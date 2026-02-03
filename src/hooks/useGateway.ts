import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';
import {
  GatewayMessage,
  GatewayRequest,
  GatewayResponse,
  GatewayEvent,
  ConnectParams,
} from '@/lib/protocol';
import { uuid } from '@/lib/utils';

interface UseGatewayOptions {
  url: string;
  token: string;
}

export function useGateway({ url, token }: UseGatewayOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const pendingRequestsRef = useRef<Map<string, (response: any) => void>>(
    new Map()
  );

  const {
    setConnected,
    setConnectionError,
    setSessions,
    addMessage,
    setStreaming,
    appendStreamingContent,
    updateSession,
  } = useAppStore();

  // Handle events
  const handleEvent = useCallback((event: GatewayEvent) => {
    const payload = event.payload || {};
    switch (event.event) {
      case 'chat.message':
        // New message in a session
        if (payload.sessionId && payload.message) {
          addMessage(payload.sessionId, payload.message);
          updateSession(payload.sessionId, {
            lastActive: new Date().toISOString(),
            messageCount: 1, // This should be incremented properly
          });
        }
        break;

      case 'chat.delta':
        // Streaming token
        if (payload.sessionId && payload.delta) {
          appendStreamingContent(payload.delta);
          updateSession(payload.sessionId, { status: 'streaming' });
        }
        break;

      case 'chat.complete':
        // Response finished
        if (payload.sessionId) {
          setStreaming(null);
          updateSession(payload.sessionId, { status: 'idle' });
        }
        break;

      case 'session.updated':
        // Session metadata changed
        if (payload.session) {
          updateSession(payload.session.id, payload.session);
        }
        break;

      default:
        console.log('Unhandled event:', event.event, payload);
    }
  }, [addMessage, appendStreamingContent, setStreaming, updateSession]);

  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: GatewayMessage = JSON.parse(event.data);

      if (message.type === 'res') {
        // Response to a request
        const handler = pendingRequestsRef.current.get(message.id);
        if (handler) {
          handler(message);
          pendingRequestsRef.current.delete(message.id);
        }
      } else if (message.type === 'event') {
        // Event from gateway
        handleEvent(message);
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }, [handleEvent]);

  // Send a request and wait for response
  const sendRequest = useCallback(
    (method: string, params?: any): Promise<any> => {
      return new Promise((resolve, reject) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket not connected'));
          return;
        }

        const id = uuid();
        const request: GatewayRequest = {
          type: 'req',
          id,
          method,
          params,
        };

        pendingRequestsRef.current.set(id, (response: GatewayResponse) => {
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.result);
          }
        });

        wsRef.current.send(JSON.stringify(request));
      });
    },
    []
  );

  // Connect to gateway
  useEffect(() => {
    const connect = () => {
      try {
        const wsUrl = `${url}?token=${token}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('WebSocket connected');
          wsRef.current = ws;

          // Send connect handshake
          const connectParams: ConnectParams = {
            minProtocol: 3,
            maxProtocol: 3,
            client: {
              id: 'conductor',
              version: '0.1.0',
              platform: 'web',
              mode: 'operator',
            },
            role: 'operator',
            scopes: ['operator.read', 'operator.write'],
            auth: { token },
          };

          const connectId = uuid();
          const connectRequest: GatewayRequest = {
            type: 'req',
            id: connectId,
            method: 'connect',
            params: connectParams,
          };

          pendingRequestsRef.current.set(connectId, (response: GatewayResponse) => {
            if (response.error) {
              console.error('Handshake failed:', response.error);
              setConnectionError(response.error.message);
            } else {
              console.log('Gateway handshake successful');
              setConnected(true);
              setConnectionError(null);

              // Fetch initial sessions list
              const listId = uuid();
              const listRequest: GatewayRequest = {
                type: 'req',
                id: listId,
                method: 'sessions.list',
              };

              pendingRequestsRef.current.set(listId, (listResponse: GatewayResponse) => {
                if (!listResponse.error && listResponse.result) {
                  setSessions(listResponse.result);
                }
              });

              ws.send(JSON.stringify(listRequest));
            }
          });

          ws.send(JSON.stringify(connectRequest));
        };

        ws.onmessage = handleMessage;

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionError('Connection error');
        };

        ws.onclose = () => {
          console.log('WebSocket closed');
          setConnected(false);
          wsRef.current = null;

          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            if (!wsRef.current) {
              connect();
            }
          }, 3000);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        setConnectionError(
          error instanceof Error ? error.message : 'Failed to connect'
        );
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url, token, handleMessage, setConnected, setConnectionError, setSessions]);

  return {
    sendRequest,
    connected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}
