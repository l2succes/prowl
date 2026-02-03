import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ChatArea from './components/Layout/ChatArea';
import FileViewerModal from './components/FileViewer/FileViewerModal';
import { useAppStore } from './stores/appStore';
import { useGateway } from './hooks/useGateway';
import { extractFileTouches } from '@/lib/fileTracking';
import { uuid } from '@/lib/utils';

// Gateway configuration
const GATEWAY_URL = 'ws://localhost:18789';
const GATEWAY_TOKEN = import.meta.env.VITE_GATEWAY_TOKEN || 'dev-token';

function App() {
  const { 
    currentSessionId, 
    connected, 
    activeSessions, 
    messages, 
    setMessages, 
    addFileTouch 
  } = useAppStore();
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  // Connect to OpenClaw gateway
  const { sendRequest } = useGateway({
    url: GATEWAY_URL,
    token: GATEWAY_TOKEN,
  });

  // Load persisted state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('prowl-state');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.activeSessions) {
          parsed.activeSessions.forEach((sessionId: string) => {
            useAppStore.getState().openSession(sessionId);
          });
          if (parsed.currentSessionId) {
            useAppStore.getState().setCurrentSession(parsed.currentSessionId);
          }
        }
      } catch (e) {
        console.error('Failed to load persisted state:', e);
      }
    }
  }, []);

  // Fetch history for active sessions when connected
  
  useEffect(() => {
    if (!connected || activeSessions.length === 0) return;
    
    const fetchHistoryForSessions = async () => {
      for (const sessionId of activeSessions) {
        // Skip if we already have messages
        if (messages[sessionId] && messages[sessionId].length > 0) continue;
        
        try {
          const result = await sendRequest('sessions.history', {
            sessionKey: sessionId,
            limit: 100,
            includeTools: true,
          });
          
          if (result && result.messages) {
            const formattedMessages = result.messages.map((msg: any) => ({
              id: msg.id || uuid(),
              role: msg.role,
              content: Array.isArray(msg.content) 
                ? msg.content 
                : [{ type: 'text', text: String(msg.content || '') }],
              timestamp: msg.timestamp || new Date().toISOString(),
            }));
            
            setMessages(sessionId, formattedMessages);
            
            formattedMessages.forEach((msg: any) => {
              const fileTouches = extractFileTouches(msg);
              fileTouches.forEach((touch: any) => {
                addFileTouch(sessionId, touch);
              });
            });
          }
        } catch (err) {
          console.log('Could not fetch history for:', sessionId);
        }
      }
    };
    
    fetchHistoryForSessions();
  }, [connected, activeSessions.length]); // Only re-run when connection or session count changes

  // Persist active sessions to localStorage
  useEffect(() => {
    const { activeSessions, currentSessionId } = useAppStore.getState();
    localStorage.setItem(
      'prowl-state',
      JSON.stringify({ activeSessions, currentSessionId })
    );
  }, [currentSessionId]);

  const handleFileClick = (path: string) => {
    setSelectedFilePath(path);
  };

  const handleCloseFileViewer = () => {
    setSelectedFilePath(null);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar sendRequest={sendRequest} onFileClick={handleFileClick} />
      <ChatArea sendRequest={sendRequest} onFileClick={handleFileClick} />
      <FileViewerModal
        path={selectedFilePath}
        onClose={handleCloseFileViewer}
        sendRequest={sendRequest}
      />
    </div>
  );
}

export default App;
