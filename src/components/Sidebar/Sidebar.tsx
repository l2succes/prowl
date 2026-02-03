import { useAppStore } from '@/stores/appStore';
import SessionList from './SessionList';
import FileList from './FileList';
import { uuid } from '@/lib/utils';

interface SidebarProps {
  sendRequest: (method: string, params?: any) => Promise<any>;
  onFileClick: (path: string) => void;
}

export default function Sidebar({ sendRequest, onFileClick }: SidebarProps) {
  const { connected, connectionError, addSession, openSession } = useAppStore();

  const handleCreateSession = () => {
    // Generate a unique session key (webchat style)
    // Sessions are created implicitly by chat.send - no API call needed
    const sessionKey = `prowl-${uuid()}`;
    const label = `Session ${new Date().toLocaleTimeString()}`;
    
    // Add session to local state
    // The actual session will be created on the gateway when the first message is sent
    addSession({
      id: sessionKey,
      key: sessionKey,
      label,
      created: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'idle',
      messageCount: 0,
    });
    
    openSession(sessionKey);
  };

  return (
    <div className="w-64 border-r border-border flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold">OpenClaw</h1>
        <p className="text-sm text-muted-foreground">Conductor</p>
        {!connected && (
          <div className="mt-2 text-xs text-destructive">
            {connectionError || 'Not connected'}
          </div>
        )}
        {connected && (
          <div className="mt-2 text-xs text-green-500">Connected</div>
        )}
      </div>

      {/* Session List */}
      <SessionList />

      {/* File List */}
      <FileList onFileClick={onFileClick} />

      {/* New Session Button */}
      <div className="p-4 border-t border-border mt-auto">
        <button
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCreateSession}
          disabled={!connected}
        >
          + New Session
        </button>
      </div>
    </div>
  );
}
