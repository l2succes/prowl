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
// Valid client.id: webchat-ui | clawdbot-control-ui | webchat | cli | gateway-client | clawdbot-macos | node-host | test | fingerprint | clawdbot-probe
// Valid client.mode: webchat | cli | ui | backend | node | probe | test
export interface ConnectParams {
  minProtocol: number;
  maxProtocol: number;
  client: {
    id: 'webchat-ui' | 'webchat' | 'cli' | 'clawdbot-control-ui' | 'gateway-client' | 'clawdbot-macos' | 'node-host' | 'test' | 'fingerprint' | 'clawdbot-probe';
    version: string;
    platform: string;
    mode: 'webchat' | 'cli' | 'ui' | 'backend' | 'node' | 'probe' | 'test';
  };
  role: string;
  scopes: string[];
  auth: {
    token: string;
  };
}

// Session types
// Gateway uses 'key' as the primary identifier
export interface Session {
  id: string; // Alias for key (for UI convenience)
  key: string; // Session key (primary identifier used by gateway)
  label?: string;
  created?: string;
  lastActive?: string;
  messageCount?: number;
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
