import { Session } from '@/lib/protocol';
import { formatTime } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onClick: () => void;
}

export default function SessionItem({
  session,
  isActive,
  onClick,
}: SessionItemProps) {
  const { messages } = useAppStore();
  const sessionMessages = messages[session.id] || [];
  const lastMessage = sessionMessages[sessionMessages.length - 1];

  // Get last message preview
  const getPreview = () => {
    if (!lastMessage) return 'No messages yet';
    const textContent = lastMessage.content.find((c) => c.type === 'text');
    if (textContent && 'text' in textContent) {
      return textContent.text.slice(0, 50) + '...';
    }
    return 'Message';
  };

  // Status indicator color
  const statusColor =
    session.status === 'streaming'
      ? 'bg-blue-500'
      : session.status === 'active'
      ? 'bg-green-500'
      : 'bg-gray-500';

  return (
    <div
      className={`p-3 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors ${
        isActive ? 'bg-accent' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`w-2 h-2 rounded-full ${statusColor} flex-shrink-0`} />
          <span className="font-medium truncate">
            {session.label || `Session ${session.id.slice(0, 8)}`}
          </span>
        </div>
        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
          {session.lastActive ? formatTime(session.lastActive) : ''}
        </span>
      </div>
      <div className="text-xs text-muted-foreground truncate ml-4">
        {getPreview()}
      </div>
    </div>
  );
}
