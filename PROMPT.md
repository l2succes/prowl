# OpenClaw Conductor — Build Task

Build a multi-threaded chat UI for OpenClaw based on `SPEC.md` in this directory.

## Your Mission

Implement the OpenClaw Conductor UI following the spec. Work iteratively:
1. Read SPEC.md for requirements
2. Implement one phase at a time
3. Test that it works (run dev server, verify features)
4. Move to next phase

## Phases

### Phase 1: Foundation
- Initialize Vite + React 18 + TypeScript project
- Add TailwindCSS + shadcn/ui
- Create basic layout (sidebar + main area)
- Set up Zustand store for app state

### Phase 2: Gateway Connection  
- Implement WebSocket connection to OpenClaw gateway
- Handle connect handshake (protocol v3)
- Create useGateway hook
- Test connection to ws://localhost:18789

### Phase 3: Single Session Chat
- Implement chat panel with message list
- Handle chat.send and streaming responses
- Markdown rendering for messages
- Input box with Cmd+Enter to send

### Phase 4: Multi-Session
- Fetch sessions list from gateway
- Display sessions in sidebar
- Tab bar for switching between sessions
- Create new session functionality

### Phase 5: Polish
- Tool use visualization (collapsible blocks)
- Session status indicators (active/idle/streaming)
- Dark theme styling
- localStorage persistence for open tabs

## Technical Notes

- Gateway URL: `ws://localhost:18789` (token in query: `?token=xxx`)
- See SPEC.md for protocol details
- Use shadcn/ui components for consistent styling
- Keep components small and focused

## Completion Criteria

When ALL of the following are true:
- [ ] Can connect to OpenClaw gateway
- [ ] Can list sessions in sidebar
- [ ] Can chat in a session with streaming
- [ ] Can switch between multiple sessions
- [ ] Dark theme looks clean
- [ ] No TypeScript errors
- [ ] Dev server runs without errors

Then output: <promise>CONDUCTOR_COMPLETE</promise>

## If Stuck

- Check the OpenClaw protocol docs at `/opt/homebrew/lib/node_modules/openclaw/docs/gateway/protocol.md`
- Run `pnpm dev` to test changes
- Check browser console for WebSocket errors
- After 15 iterations without progress, document blockers and suggest alternatives

---

*Start with Phase 1. Build incrementally. Test frequently.*
