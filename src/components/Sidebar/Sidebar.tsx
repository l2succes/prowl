import { useAppStore } from '@/stores/appStore';
import SessionList from './SessionList';
import { uuid } from '@/lib/utils';

interface SidebarProps {
  sendRequest: (method: string, params?: any) => Promise<any>;
}

export default function Sidebar({ sendRequest }: SidebarProps) {
  const { connected, connectionError, addSession, openSession } = useAppStore();

  const handleCreateSession = async () => {
    try {
      const sessionId = uuid();
      const result = await sendRequest('sessions.create', {
        sessionId,
        label: `Session ${new Date().toLocaleTimeString()}`,
      });

      if (result && result.session) {
        addSession(result.session);
        openSession(result.session.id);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
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
