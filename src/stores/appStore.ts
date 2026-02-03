import { create } from 'zustand';
import { Session, Message } from '@/lib/protocol';

export interface FileTouch {
  path: string;
  action: 'read' | 'write' | 'edit';
  timestamp: number;
}

interface AppState {
  // Connection
  connected: boolean;
  connectionError: string | null;
  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;

  // Sessions
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  mergeSessions: (sessions: Session[]) => void; // Merge without overwriting local sessions
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

  // File tracking
  recentFiles: Record<string, FileTouch[]>; // sessionId -> files
  addFileTouch: (sessionId: string, file: FileTouch) => void;

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
  mergeSessions: (newSessions) =>
    set((state) => {
      // Keep existing local sessions, add new ones from gateway
      const existingIds = new Set(state.sessions.map(s => s.id));
      const existingKeys = new Set(state.sessions.map(s => s.key));
      const toAdd = newSessions.filter(s => !existingIds.has(s.id) && !existingKeys.has(s.key));
      
      // Also update existing sessions with gateway data (e.g., message counts)
      const updated = state.sessions.map(existing => {
        const fromGateway = newSessions.find(s => s.id === existing.id || s.key === existing.key);
        if (fromGateway) {
          return { ...existing, ...fromGateway, label: existing.label || fromGateway.label };
        }
        return existing;
      });
      
      return { sessions: [...updated, ...toAdd] };
    }),
  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
    })),
  updateSession: (sessionId, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        (s.key === sessionId || s.id === sessionId) ? { ...s, ...updates } : s
      ),
    })),
  deleteSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.key !== sessionId && s.id !== sessionId),
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

  // File tracking
  recentFiles: {},
  addFileTouch: (sessionId, file) =>
    set((state) => {
      const sessionFiles = state.recentFiles[sessionId] || [];
      // Remove existing entry for the same path
      const filteredFiles = sessionFiles.filter((f) => f.path !== file.path);
      // Add new entry at the beginning
      return {
        recentFiles: {
          ...state.recentFiles,
          [sessionId]: [file, ...filteredFiles],
        },
      };
    }),

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
