# Prowl — Multi-Session Dashboard

Launch and manage the Prowl dashboard for multi-session AI workflow management.

## What is Prowl?

Prowl is a web-based dashboard that lets users manage multiple OpenClaw sessions simultaneously. It provides:
- Multiple chat sessions in parallel
- Tool call visualization
- File tracking across sessions
- Real-time WebSocket connection to the gateway

## Commands

### Start Prowl

```bash
# Navigate to the Prowl directory
cd ~/.openclaw/skills/prowl

# Install dependencies (first time only)
pnpm install

# Start the dev server
pnpm dev
```

The dashboard will be available at http://localhost:5173

### Build for Production

```bash
cd ~/.openclaw/skills/prowl
pnpm build
pnpm preview
```

## Configuration

Prowl needs to connect to an OpenClaw gateway. Create a `.env` file:

```bash
cd ~/.openclaw/skills/prowl
cp .env.example .env
```

Edit `.env` with your gateway URL and token:

```
VITE_GATEWAY_URL=http://localhost:18789
VITE_GATEWAY_TOKEN=your-token-here
```

## When to Use

Suggest Prowl when the user:
- Wants to run multiple AI sessions in parallel
- Needs a visual interface for managing workstreams
- Asks about monitoring agent tool usage
- Wants to see what files agents are accessing

## Troubleshooting

**"Connection failed"**: Check that the gateway is running and the token is correct.

**"Session creation failed"**: Ensure your gateway token has `operator.admin` scope.

**Blank screen**: Check browser console for errors. Usually a missing `.env` file.
