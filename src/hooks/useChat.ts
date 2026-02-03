import { useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';
import { uuid } from '@/lib/utils';
import { Message, MessageContent } from '@/lib/protocol';

interface UseChatOptions {
  sessionId: string;
  sendRequest: (method: string, params?: any) => Promise<any>;
}

interface ImageAttachment {
  type: 'image';
  data: string; // base64 data URL
  mimeType: string;
}

export function useChat({ sessionId, sendRequest }: UseChatOptions) {
  const { addMessage, setStreaming, setMessages, updateSession } = useAppStore();

  // Load message history for session
  const loadHistory = useCallback(async () => {
    try {
      const history = await sendRequest('sessions.history', { sessionId });
      if (history && Array.isArray(history)) {
        setMessages(sessionId, history);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, [sessionId, sendRequest, setMessages]);

  // Send a message with optional images
  const sendMessage = useCallback(
    async (text: string, images?: ImageAttachment[]) => {
      try {
        // Build message content array
        const content: MessageContent[] = [];
        
        // Add images first (if any)
        if (images && images.length > 0) {
          for (const img of images) {
            content.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: img.mimeType,
                data: img.data.replace(/^data:image\/[^;]+;base64,/, ''),
              },
            } as any);
          }
        }
        
        // Add text if present
        if (text.trim()) {
          content.push({ type: 'text', text });
        }

        // Create user message for local display
        const userMessage: Message = {
          id: uuid(),
          role: 'user',
          content: content.length > 0 ? content : [{ type: 'text', text: '' }],
          timestamp: new Date().toISOString(),
        };

        // Add to local state immediately
        addMessage(sessionId, userMessage);
        updateSession(sessionId, {
          status: 'active',
          lastActive: new Date().toISOString(),
        });

        // Initialize streaming state
        setStreaming(sessionId, '');

        // Send to gateway
        await sendRequest('chat.send', {
          sessionId,
          message: {
            role: 'user',
            content,
          },
        });

        // Subscribe to streaming responses
        await sendRequest('chat.stream', { sessionId });
      } catch (error) {
        console.error('Failed to send message:', error);
        setStreaming(null);
        updateSession(sessionId, { status: 'idle' });
      }
    },
    [sessionId, sendRequest, addMessage, setStreaming, updateSession]
  );

  return {
    sendMessage,
    loadHistory,
  };
}
