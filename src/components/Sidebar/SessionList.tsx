import { useAppStore } from '@/stores/appStore';
import SessionItem from './SessionItem';

export default function SessionList() {
  const { sessions, currentSessionId, openSession } = useAppStore();

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
          onClick={() => openSession(session.id)}
        />
      ))}
    </div>
  );
}
