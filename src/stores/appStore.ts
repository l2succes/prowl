import { create } from 'zustand';
import { Session, Message } from '@/lib/protocol';

interface AppState {
  // Connection
  connected: boolean;
  connectionError: string | null;
  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;

  // Sessions
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  deleteSession: (sessionId: string) => void;

  // Active sessions (tabs)
  activeSessions: string[]; // session IDs
  currentSessionId: string | null;
  openSession: (sessionId: string) => void;
  closeSession: (sessionId: string) => void;
  setCurrentSession: (sessionId: string) => void;

  // Messages
  messages: Record<string, Message[]>; // sessionId -> messages
  setMessages: (sessionId: string, messages: Message[]) => void;
  addMessage: (sessionId: string, message: Message) => void;

  // Streaming state
  streamingSessionId: string | null;
  streamingContent: string;
  setStreaming: (sessionId: string | null, content?: string) => void;
  appendStreamingContent: (content: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Connection
  connected: false,
  connectionError: null,
  setConnected: (connected) => set({ connected }),
  setConnectionError: (error) => set({ connectionError: error }),

  // Sessions
  sessions: [],
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
    })),
  updateSession: (sessionId, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, ...updates } : s
      ),
    })),
  deleteSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
      activeSessions: state.activeSessions.filter((id) => id !== sessionId),
      currentSessionId:
        state.currentSessionId === sessionId
          ? state.activeSessions[0] || null
          : state.currentSessionId,
    })),

  // Active sessions
  activeSessions: [],
  currentSessionId: null,
  openSession: (sessionId) =>
    set((state) => {
      if (state.activeSessions.includes(sessionId)) {
        return { currentSessionId: sessionId };
      }
      return {
        activeSessions: [...state.activeSessions, sessionId],
        currentSessionId: sessionId,
      };
    }),
  closeSession: (sessionId) =>
    set((state) => {
      const newActiveSessions = state.activeSessions.filter(
        (id) => id !== sessionId
      );
      return {
        activeSessions: newActiveSessions,
        currentSessionId:
          state.currentSessionId === sessionId
            ? newActiveSessions[0] || null
            : state.currentSessionId,
      };
    }),
  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),

  // Messages
  messages: {},
  setMessages: (sessionId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [sessionId]: messages },
    })),
  addMessage: (sessionId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: [...(state.messages[sessionId] || []), message],
      },
    })),

  // Streaming
  streamingSessionId: null,
  streamingContent: '',
  setStreaming: (sessionId, content = '') =>
    set({ streamingSessionId: sessionId, streamingContent: content }),
  appendStreamingContent: (content) =>
    set((state) => ({
      streamingContent: state.streamingContent + content,
    })),
}));
