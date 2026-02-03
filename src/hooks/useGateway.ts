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
import { extractFileTouches } from '@/lib/fileTracking';

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
    addFileTouch,
  } = useAppStore();

  // Handle events
  const handleEvent = useCallback((event: GatewayEvent) => {
    const payload = event.payload || {};
    
    switch (event.event) {
      case 'chat': {
        // Chat events have state: delta | final | aborted | error
        const { sessionKey, state, message, errorMessage } = payload;
        
        if (!sessionKey) break;
        
        if (state === 'delta' && message) {
          // Streaming delta - message contains the partial content
          // Extract text from message.content if present
          const content = message.content;
          if (Array.isArray(content)) {
            for (const block of content) {
              if (block.type === 'text' && block.text) {
                appendStreamingContent(block.text);
              }
            }
          } else if (typeof message === 'string') {
            appendStreamingContent(message);
          }
          updateSession(sessionKey, { status: 'streaming' });
        } else if (state === 'final' && message) {
          // Final message - add complete message to history
          const formattedMessage = {
            id: message.id || uuid(),
            role: message.role || 'assistant',
            content: Array.isArray(message.content) 
              ? message.content 
              : [{ type: 'text', text: String(message.content || '') }],
            timestamp: message.timestamp || new Date().toISOString(),
          };
          
          addMessage(sessionKey, formattedMessage);
          setStreaming(null);
          updateSession(sessionKey, { 
            status: 'idle',
            lastActive: new Date().toISOString(),
          });

          // Track file touches from tool use
          const fileTouches = extractFileTouches(formattedMessage);
          fileTouches.forEach((touch) => {
            addFileTouch(sessionKey, touch);
          });
        } else if (state === 'aborted' || state === 'error') {
          console.log('Chat aborted/error:', errorMessage);
          setStreaming(null);
          updateSession(sessionKey, { status: 'idle' });
        }
        break;
      }

      case 'presence':
        // Presence update - ignore for now
        break;

      case 'agent':
        // Agent state update
        console.log('Agent event:', payload);
        break;

      default:
        console.log('Unhandled event:', event.event, payload);
    }
  }, [addMessage, appendStreamingContent, setStreaming, updateSession, addFileTouch]);

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
              id: 'webchat',
              version: '0.1.0',
              platform: 'web',
              mode: 'webchat',
            },
            role: 'operator',
            scopes: ['operator.read', 'operator.write', 'operator.admin'],
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
                params: {
                  includeGlobal: true,
                  limit: 50,
                },
              };

              pendingRequestsRef.current.set(listId, (listResponse: GatewayResponse) => {
                if (!listResponse.error && listResponse.result) {
                  // Transform gateway sessions to our format
                  // Gateway returns sessions with 'key' as identifier
                  const sessions = (listResponse.result.sessions || listResponse.result || []).map((s: any) => ({
                    id: s.key || s.id,
                    key: s.key || s.id,
                    label: s.label || s.key,
                    created: s.created || new Date().toISOString(),
                    lastActive: s.lastActive || new Date().toISOString(),
                    messageCount: s.messageCount || 0,
                    status: 'idle',
                  }));
                  setSessions(sessions);
                  console.log('Loaded sessions:', sessions);
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
