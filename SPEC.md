# OpenClaw Conductor — Technical Spec

A multi-threaded chat UI for OpenClaw, inspired by Conductor's parallel conversation management.

## Overview

**Goal**: Replace the single-thread webchat with a workspace UI that shows multiple OpenClaw sessions side-by-side, with persistent history and easy context switching.

**Target Users**: Power users managing multiple AI workstreams (dev tasks, research, ops) simultaneously.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenClaw Conductor                        │
├──────────────┬──────────────────────────────────────────────┤
│              │                                               │
│  Sidebar     │            Active Sessions (Tabs/Panels)     │
│              │                                               │
│  ┌────────┐  │  ┌─────────────────┐  ┌─────────────────┐    │
│  │Session1│  │  │   Session 1     │  │   Session 2     │    │
│  │ (dev)  │  │  │   [streaming]   │  │   [idle]        │    │
│  ├────────┤  │  │                 │  │                 │    │
│  │Session2│  │  │  > message...   │  │  > done earlier │    │
│  │(research)│ │  │  < response... │  │                 │    │
│  ├────────┤  │  │                 │  │                 │    │
│  │Session3│  │  │  [input box]    │  │  [input box]    │    │
│  │ (ops)  │  │  └─────────────────┘  └─────────────────┘    │
│  └────────┘  │                                               │
│              │                                               │
│  [+ New]     │                                               │
└──────────────┴──────────────────────────────────────────────┘
```

## Core Features

### 1. Session Management
- List all sessions from gateway (`sessions.list`)
- Create new sessions with custom labels
- Archive/delete sessions
- Session metadata: label, created, last active, message count

### 2. Multi-Panel View
- **Tabs**: Switch between sessions (default)
- **Split**: 2-3 sessions side-by-side (optional)
- Remember panel layout per user (localStorage)

### 3. Real-Time Chat
- WebSocket connection to OpenClaw gateway
- Streaming responses with markdown rendering
- Tool use visualization (collapsible)
- Message history with scroll-to-load

### 4. Session State
- Show active/idle/streaming status per session
- Unread message indicators
- Last message preview in sidebar

## Tech Stack

```
Frontend:
- React 18 + TypeScript
- Vite (fast dev/build)
- TailwindCSS + shadcn/ui
- Zustand (state management)
- WebSocket (native, no socket.io)

No backend needed — connects directly to OpenClaw gateway.
```

## Gateway Protocol Integration

### Connection
```typescript
const ws = new WebSocket(`ws://localhost:18789?token=${GATEWAY_TOKEN}`);

// Handshake
ws.send(JSON.stringify({
  type: "req",
  id: uuid(),
  method: "connect",
  params: {
    minProtocol: 3,
    maxProtocol: 3,
    client: { id: "conductor", version: "0.1.0", platform: "web", mode: "operator" },
    role: "operator",
    scopes: ["operator.read", "operator.write"],
    auth: { token: GATEWAY_TOKEN }
  }
}));
```

### Key Methods
- `sessions.list` — Get all sessions
- `sessions.history` — Load messages for a session
- `chat.send` — Send message to session
- `chat.stream` — Subscribe to responses

### Events to Handle
- `chat.message` — New message in session
- `chat.delta` — Streaming token
- `chat.complete` — Response finished
- `session.updated` — Session metadata changed

## File Structure

```
openclaw-conductor/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Sidebar/
│   │   │   ├── SessionList.tsx
│   │   │   └── SessionItem.tsx
│   │   ├── Chat/
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── Message.tsx
│   │   │   ├── InputBox.tsx
│   │   │   └── ToolUseBlock.tsx
│   │   └── Layout/
│   │       ├── TabBar.tsx
│   │       └── SplitView.tsx
│   ├── hooks/
│   │   ├── useGateway.ts        # WebSocket connection
│   │   ├── useSessions.ts       # Session state
│   │   └── useChat.ts           # Chat for active session
│   ├── stores/
│   │   └── appStore.ts          # Zustand store
│   ├── lib/
│   │   ├── protocol.ts          # Gateway protocol types
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── SPEC.md
```

## UI/UX Details

### Sidebar (Left, ~250px)
- Logo/title at top
- Session list (scrollable)
  - Each item: label, status dot, last message preview, timestamp
  - Click to activate
  - Right-click for context menu (rename, archive, delete)
- "+ New Session" button at bottom
- Collapsible on mobile

### Tab Bar (Top of main area)
- Tabs for open sessions
- Close button on each tab
- Drag to reorder
- Overflow scroll if many tabs

### Chat Panel
- Messages: alternating user/assistant, with timestamps
- Markdown rendering (code blocks, lists, links)
- Tool use: collapsible blocks showing tool name + result
- Streaming: show partial response with cursor
- Input: textarea with Cmd+Enter to send, file drag-drop

### Dark Mode
- Default: dark theme
- Respect system preference
- Manual toggle

## Implementation Phases

### Phase 1: Foundation (MVP)
- [ ] Vite + React + TS setup
- [ ] Gateway WebSocket connection
- [ ] Single session chat working
- [ ] Basic styling

### Phase 2: Multi-Session
- [ ] Session list in sidebar
- [ ] Tab bar for switching
- [ ] Create/delete sessions
- [ ] Persist active sessions in localStorage

### Phase 3: Polish
- [ ] Split view option
- [ ] Tool use visualization
- [ ] Unread indicators
- [ ] Keyboard shortcuts
- [ ] Mobile responsive

### Phase 4: Power Features
- [ ] Session search
- [ ] Export chat history
- [ ] Session templates/presets
- [ ] Model selector per session

## Gateway Connection Details

**URL**: `ws://localhost:18789` (or via ngrok: `wss://breezy.ngrok.dev`)

**Auth**: Token in query param or in connect params

**Protocol Version**: 3

Reference: `/opt/homebrew/lib/node_modules/openclaw/docs/gateway/protocol.md`

## Success Criteria

1. Can connect to local OpenClaw gateway
2. Can see list of existing sessions
3. Can chat in a session with streaming responses
4. Can switch between multiple sessions
5. State persists across page refresh
6. Looks good (dark theme, clean UI)

---

*Spec v0.1 — Ready for implementation*
