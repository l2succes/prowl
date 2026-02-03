import { useEffect } from 'react';
import MessageList from './MessageList';
import InputBox from './InputBox';
import { useChat } from '@/hooks/useChat';

interface ChatPanelProps {
  sessionId: string;
  sendRequest: (method: string, params?: any) => Promise<any>;
  onFileClick?: (path: string) => void;
}

export default function ChatPanel({ sessionId, sendRequest, onFileClick }: ChatPanelProps) {
  const { loadHistory } = useChat({ sessionId, sendRequest });

  // Load message history when session changes
  useEffect(() => {
    loadHistory();
  }, [sessionId, loadHistory]);

  return (
    <div className="flex-1 flex flex-col">
      <MessageList sessionId={sessionId} onFileClick={onFileClick} />
      <InputBox sessionId={sessionId} sendRequest={sendRequest} />
    </div>
  );
}
