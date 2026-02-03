import { useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';
import { uuid } from '@/lib/utils';
import { Message, MessageContent } from '@/lib/protocol';

interface UseChatOptions {
  sessionId: string; // This is actually the sessionKey
  sendRequest: (method: string, params?: any) => Promise<any>;
}

interface ImageAttachment {
  type: 'image';
  data: string; // base64 data URL
  mimeType: string;
}

// Derive a session name from the first message
function deriveSessionName(text: string): string {
  // Clean up the text
  let name = text.trim();
  
  // Remove common prefixes
  name = name.replace(/^(hey|hi|hello|please|can you|could you|i want to|i need to|help me)\s+/i, '');
  
  // Truncate to reasonable length
  const maxLength = 40;
  if (name.length > maxLength) {
    // Try to cut at a word boundary
    const truncated = name.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 20) {
      name = truncated.slice(0, lastSpace) + '...';
    } else {
      name = truncated + '...';
    }
  }
  
  // Capitalize first letter
  name = name.charAt(0).toUpperCase() + name.slice(1);
  
  return name;
}

export function useChat({ sessionId, sendRequest }: UseChatOptions) {
  const { addMessage, setStreaming, setMessages, updateSession, messages, sessions } = useAppStore();

  // Load message history for session
  const loadHistory = useCallback(async () => {
    try {
      // chat.history uses sessionKey (we're using sessionId as the key)
      const result = await sendRequest('chat.history', { 
        sessionKey: sessionId,
        limit: 100,
      });
      
      // Result contains messages array
      if (result && result.messages && Array.isArray(result.messages)) {
        // Transform gateway messages to our format
        const messages: Message[] = result.messages.map((msg: any) => ({
          id: msg.id || uuid(),
          role: msg.role,
          content: typeof msg.content === 'string' 
            ? [{ type: 'text', text: msg.content }]
            : msg.content,
          timestamp: msg.timestamp || new Date().toISOString(),
          toolUse: msg.toolUse,
        }));
        setMessages(sessionId, messages);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, [sessionId, sendRequest, setMessages]);

  // Send a message with optional images
  const sendMessage = useCallback(
    async (text: string, images?: ImageAttachment[]) => {
      try {
        // Build attachments array for images
        const attachments = images?.map(img => ({
          type: 'image',
          mediaType: img.mimeType,
          data: img.data.replace(/^data:image\/[^;]+;base64,/, ''),
        }));

        // Create user message for local display
        const content: MessageContent[] = [];
        
        // Add images to content for display
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
        
        // Add text
        if (text.trim()) {
          content.push({ type: 'text', text });
        }

        const userMessage: Message = {
          id: uuid(),
          role: 'user',
          content: content.length > 0 ? content : [{ type: 'text', text: '' }],
          timestamp: new Date().toISOString(),
        };

        // Add to local state immediately
        addMessage(sessionId, userMessage);
        
        // Check if this is the first message - derive session name
        const sessionMessages = messages[sessionId] || [];
        const session = sessions.find(s => s.id === sessionId || s.key === sessionId);
        const isFirstMessage = sessionMessages.length === 0;
        const hasDefaultName = session?.label?.startsWith('Session ') || !session?.label;
        
        if (isFirstMessage && hasDefaultName && text.trim()) {
          const derivedName = deriveSessionName(text);
          updateSession(sessionId, {
            label: derivedName,
            status: 'active',
            lastActive: new Date().toISOString(),
          });
        } else {
          updateSession(sessionId, {
            status: 'active',
            lastActive: new Date().toISOString(),
          });
        }

        // Initialize streaming state
        setStreaming(sessionId, '');

        // Send to gateway - chat.send expects:
        // - sessionKey: string (required)
        // - message: string (required) - just the text
        // - idempotencyKey: string (required)
        // - attachments: array (optional)
        await sendRequest('chat.send', {
          sessionKey: sessionId,
          message: text,
          idempotencyKey: uuid(),
          ...(attachments && attachments.length > 0 && { attachments }),
        });

        // Response will come via events (chat.message, chat.delta, chat.complete)
        // No need to call chat.stream - it's automatic
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
