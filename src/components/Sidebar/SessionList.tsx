import { useAppStore } from '@/stores/appStore';
import SessionItem from './SessionItem';
import { uuid } from '@/lib/utils';
import { extractFileTouches } from '@/lib/fileTracking';

interface SessionListProps {
  sendRequest: (method: string, params?: any) => Promise<any>;
}

export default function SessionList({ sendRequest }: SessionListProps) {
  const { sessions, currentSessionId, openSession, messages, setMessages, addFileTouch } = useAppStore();

  const handleOpenSession = async (sessionId: string) => {
    openSession(sessionId);
    
    // Fetch history if we don't have messages for this session yet
    if (!messages[sessionId] || messages[sessionId].length === 0) {
      try {
        const result = await sendRequest('sessions.history', {
          sessionKey: sessionId,
          limit: 100,
          includeTools: true,
        });
        
        if (result && result.messages) {
          // Transform messages to our format
          const formattedMessages = result.messages.map((msg: any) => ({
            id: msg.id || uuid(),
            role: msg.role,
            content: Array.isArray(msg.content) 
              ? msg.content 
              : [{ type: 'text', text: String(msg.content || '') }],
            timestamp: msg.timestamp || new Date().toISOString(),
          }));
          
          setMessages(sessionId, formattedMessages);
          
          // Extract file touches from history
          formattedMessages.forEach((msg: any) => {
            const fileTouches = extractFileTouches(msg);
            fileTouches.forEach((touch) => {
              addFileTouch(sessionId, touch);
            });
          });
          
          console.log(`Loaded ${formattedMessages.length} messages for session ${sessionId}`);
        }
      } catch (err) {
        console.log('No history found for session:', sessionId, err);
        // This is fine - new sessions won't have history
      }
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center text-muted-foreground text-sm">
        No sessions yet.
        <br />
        Create one to get started.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {sessions.map((session) => (
        <SessionItem
          key={session.id}
          session={session}
          isActive={session.id === currentSessionId}
          onClick={() => handleOpenSession(session.id)}
        />
      ))}
    </div>
  );
}
