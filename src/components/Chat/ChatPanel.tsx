import MessageList from './MessageList';
import InputBox from './InputBox';

interface ChatPanelProps {
  sessionId: string;
  sendRequest: (method: string, params?: any) => Promise<any>;
  onFileClick?: (path: string) => void;
}

export default function ChatPanel({ sessionId, sendRequest, onFileClick }: ChatPanelProps) {
  // History is loaded by App.tsx when sessions are opened
  // No need to load here - avoids race condition with WebSocket connection

  return (
    <div className="flex-1 flex flex-col">
      <MessageList sessionId={sessionId} onFileClick={onFileClick} />
      <InputBox sessionId={sessionId} sendRequest={sendRequest} />
    </div>
  );
}
