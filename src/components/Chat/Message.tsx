import { Message as MessageType } from '@/lib/protocol';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ToolUseBlock from './ToolUseBlock';
import ToolResultBlock from './ToolResultBlock';

interface MessageProps {
  message: MessageType;
  onFileClick?: (path: string) => void;
}

export default function Message({ message, onFileClick }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-secondary text-secondary-foreground'
            : 'bg-primary text-primary-foreground'
        }`}
      >
        {isUser ? 'U' : 'A'}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        {message.content.map((content, idx) => {
          if (content.type === 'text') {
            return (
              <div key={idx} className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content.text}
                </ReactMarkdown>
              </div>
            );
          }

          if (content.type === 'image') {
            const src = content.source.type === 'base64'
              ? `data:${content.source.media_type};base64,${content.source.data}`
              : '';
            return (
              <div key={idx} className="my-2">
                <img
                  src={src}
                  alt="Uploaded image"
                  className="max-w-md rounded-md border border-border"
                />
              </div>
            );
          }

          if (content.type === 'tool_use') {
            return (
              <ToolUseBlock
                key={idx}
                name={content.name}
                input={content.input}
                onFileClick={onFileClick}
              />
            );
          }

          if (content.type === 'tool_result') {
            return (
              <ToolResultBlock
                key={idx}
                content={content.content}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
