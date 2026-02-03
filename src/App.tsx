import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ChatArea from './components/Layout/ChatArea';
import FileViewerModal from './components/FileViewer/FileViewerModal';
import { useAppStore } from './stores/appStore';
import { useGateway } from './hooks/useGateway';

// Gateway configuration
const GATEWAY_URL = 'ws://localhost:18789';
const GATEWAY_TOKEN = import.meta.env.VITE_GATEWAY_TOKEN || 'dev-token';

function App() {
  const { currentSessionId } = useAppStore();
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  // Connect to OpenClaw gateway
  const { sendRequest } = useGateway({
    url: GATEWAY_URL,
    token: GATEWAY_TOKEN,
  });

  // Load persisted state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('conductor-state');
    if (stored) {
      try {
        const { activeSessions, currentSessionId } = JSON.parse(stored);
        if (activeSessions) {
          activeSessions.forEach((sessionId: string) => {
            useAppStore.getState().openSession(sessionId);
          });
          if (currentSessionId) {
            useAppStore.getState().setCurrentSession(currentSessionId);
          }
        }
      } catch (e) {
        console.error('Failed to load persisted state:', e);
      }
    }
  }, []);

  // Persist active sessions to localStorage
  useEffect(() => {
    const { activeSessions, currentSessionId } = useAppStore.getState();
    localStorage.setItem(
      'conductor-state',
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
