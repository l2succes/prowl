// OpenClaw Gateway Protocol Types (v3)

export interface GatewayRequest {
  type: 'req';
  id: string;
  method: string;
  params?: any;
}

export interface GatewayResponse {
  type: 'res';
  id: string;
  result?: any;
  error?: {
    code: string;
    message: string;
  };
}

export interface GatewayEvent {
  type: 'event';
  event: string;
  payload: any;
  seq?: number;
  stateVersion?: number;
}

export type GatewayMessage = GatewayRequest | GatewayResponse | GatewayEvent;

// Connect params
export interface ConnectParams {
  minProtocol: number;
  maxProtocol: number;
  client: {
    id: string;
    version: string;
    platform: string;
    mode: string;
  };
  role: string;
  scopes: string[];
  auth: {
    token: string;
  };
}

// Session types
export interface Session {
  id: string;
  label?: string;
  created: string;
  lastActive: string;
  messageCount: number;
  status?: 'active' | 'idle' | 'streaming';
}

// Message types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: MessageContent[];
  timestamp: string;
}

export type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
  | { type: 'tool_use'; id: string; name: string; input: any }
  | { type: 'tool_result'; tool_use_id: string; content: string };

// Chat events
export interface ChatMessageEvent {
  sessionId: string;
  message: Message;
}

export interface ChatDeltaEvent {
  sessionId: string;
  delta: string;
}

export interface ChatCompleteEvent {
  sessionId: string;
  messageId: string;
}

export interface SessionUpdatedEvent {
  session: Session;
}
