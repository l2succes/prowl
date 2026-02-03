import { useAppStore } from '@/stores/appStore';
import Message from './Message';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageListProps {
  sessionId: string;
  onFileClick?: (path: string) => void;
}

export default function MessageList({ sessionId, onFileClick }: MessageListProps) {
  const { messages, streamingSessionId, streamingContent } = useAppStore();
  const sessionMessages = messages[sessionId] || [];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {sessionMessages.length === 0 && !streamingContent && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Start a conversation...
        </div>
      )}

      {sessionMessages.map((message) => (
        <Message key={message.id} message={message} onFileClick={onFileClick} />
      ))}

      {streamingSessionId === sessionId && streamingContent && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
            A
          </div>
          <div className="flex-1 space-y-2">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {streamingContent}
              </ReactMarkdown>
              <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
