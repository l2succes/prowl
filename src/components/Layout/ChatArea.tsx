import { useAppStore } from '@/stores/appStore';
import TabBar from './TabBar';
import ChatPanel from '../Chat/ChatPanel';

interface ChatAreaProps {
  sendRequest: (method: string, params?: any) => Promise<any>;
}

export default function ChatArea({ sendRequest }: ChatAreaProps) {
  const { currentSessionId } = useAppStore();

  return (
    <div className="flex-1 flex flex-col">
      <TabBar />
      {currentSessionId ? (
        <ChatPanel sessionId={currentSessionId} sendRequest={sendRequest} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome to OpenClaw Conductor</h2>
            <p>Select a session or create a new one to get started.</p>
          </div>
        </div>
      )}
    </div>
  );
}
