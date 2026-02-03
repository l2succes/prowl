import { useAppStore } from '@/stores/appStore';

export default function TabBar() {
  const { sessions, activeSessions, currentSessionId, setCurrentSession, closeSession } =
    useAppStore();

  if (activeSessions.length === 0) {
    return null;
  }

  return (
    <div className="flex border-b border-border bg-card overflow-x-auto">
      {activeSessions.map((sessionId) => {
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) return null;

        const isActive = sessionId === currentSessionId;

        return (
          <div
            key={sessionId}
            className={`flex items-center gap-2 px-4 py-2 border-r border-border cursor-pointer hover:bg-accent/50 transition-colors ${
              isActive ? 'bg-accent border-b-2 border-b-primary' : ''
            }`}
            onClick={() => setCurrentSession(sessionId)}
          >
            <span className="text-sm whitespace-nowrap">
              {session.label || `Session ${session.id.slice(0, 8)}`}
            </span>
            <button
              className="text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                closeSession(sessionId);
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
