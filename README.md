# OpenClaw Conductor

A multi-threaded chat UI for OpenClaw, inspired by Conductor's parallel conversation management.

## Features

- Multi-session management with tabbed interface
- Real-time WebSocket communication with OpenClaw gateway
- Streaming responses with markdown rendering
- Collapsible tool use visualization
- Dark theme by default
- Persistent session state across page refreshes
- Session status indicators (active/idle/streaming)

## Prerequisites

- Node.js 18+ and pnpm
- OpenClaw gateway running on `ws://localhost:18789`

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure gateway token (optional):
   ```bash
   cp .env.example .env
   # Edit .env and set GATEWAY_TOKEN
   ```

## Development

Start the development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:5173/`

## Building

Build for production:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

## Project Structure

```
openclaw-conductor/
├── src/
│   ├── components/       # React components
│   │   ├── Chat/        # Chat-related components
│   │   ├── Layout/      # Layout components
│   │   └── Sidebar/     # Sidebar components
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # Zustand state management
│   ├── lib/             # Utilities and protocol types
│   └── styles/          # Global styles
├── index.html
├── package.json
└── vite.config.ts
```

## Usage

1. The app will automatically connect to the OpenClaw gateway on startup
2. Create a new session using the "+ New Session" button in the sidebar
3. Select a session from the sidebar to start chatting
4. Multiple sessions can be open in tabs simultaneously
5. Use Cmd+Enter (or Ctrl+Enter) to send messages
6. Tool use blocks are collapsible - click to expand/collapse

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with custom dark theme
- **State Management**: Zustand
- **Markdown Rendering**: react-markdown with remark-gfm
- **WebSocket**: Native WebSocket API (no socket.io)

## Gateway Protocol

The app uses OpenClaw Gateway Protocol v3:

- Connection handshake with operator role
- Request/response pattern for API calls
- Event-based notifications for real-time updates
- Streaming support for chat responses

See SPEC.md for detailed protocol information.

## License

MIT
