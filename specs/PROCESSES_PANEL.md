# Processes & Sub-Agents Panel

## Overview

Add a panel to monitor background processes and sub-agent sessions spawned by OpenClaw. This gives visibility into what's running in the background without cluttering the main session list.

## Why

When working with AI agents, they often:
- Spawn sub-agents for parallel tasks (`sessions_spawn`)
- Run background shell commands (`exec` with `background: true`)
- Have cron jobs running periodically

Currently there's no visibility into these. Users have to guess or check logs.

## UI Design

### Location

Bottom of the sidebar, collapsible panel (like the Files panel):

```
┌─────────────────────┐
│ 🐾 Prowl            │
│ Multi-Session...    │
├─────────────────────┤
│ Sessions            │
│  ├─ Research task   │
│  ├─ Code review     │
│  └─ Debug login...  │
├─────────────────────┤
│ Files (3)         ▼ │
│  ├─ package.json    │
│  └─ src/App.tsx     │
├─────────────────────┤
│ Running (2)       ▼ │  ← NEW
│  ├─ 🔄 pnpm dev     │
│  └─ 🤖 sub-agent-1  │
├─────────────────────┤
│ [+ New Session]     │
└─────────────────────┘
```

### Process Item Display

```
┌─────────────────────────────┐
│ 🔄 pnpm dev                 │
│ pid 12345 • 5m running      │
│ [View Log] [Kill]           │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 🤖 Research competitors     │
│ sub-agent • streaming       │
│ [View] [Cancel]             │
└─────────────────────────────┘
```

### States

**Processes:**
- 🔄 Running (spinner)
- ✅ Completed (green check)
- ❌ Failed (red x)
- ⏹️ Killed (gray)

**Sub-agents:**
- 🤖 Active/streaming
- ✅ Completed
- ❌ Errored
- ⏸️ Idle/waiting

## Data Sources

### 1. Background Processes (exec sessions)

Gateway provides `process` tool with actions:
- `list` - Get all running sessions
- `log` - Get output for a session
- `kill` - Terminate a session

We need to poll or subscribe to process list.

### 2. Sub-Agent Sessions

Gateway provides:
- `sessions_list` - Can filter by `kinds: ['isolated']` for sub-agents
- `sessions_history` - Get conversation for a sub-agent
- Events for session state changes

Sub-agents spawned via `sessions_spawn` have:
- `label` - Task description
- `cleanup` - Whether to delete on completion
- Parent session reference

## Implementation Plan

### Phase 1: Process List

1. Add `processes` state to Zustand store
2. Poll `process.list` every 5 seconds when panel is expanded
3. Display running processes with status
4. Add "View Log" modal to show process output
5. Add "Kill" button

### Phase 2: Sub-Agent Sessions

1. Filter `sessions.list` for isolated/sub-agent sessions
2. Show in separate section or mixed with processes
3. Allow viewing sub-agent conversation
4. Show streaming status

### Phase 3: Real-time Updates

1. Subscribe to gateway events for process/session changes
2. Remove polling, use event-driven updates
3. Show notifications when sub-agents complete

## API Calls

```typescript
// List background processes
await sendRequest('process.list', {});
// Returns: { sessions: [{ sessionId, pid, command, status, startTime }] }

// Get process log
await sendRequest('process.log', { sessionId, limit: 100 });
// Returns: { output: string }

// Kill process  
await sendRequest('process.kill', { sessionId });

// List sub-agent sessions
await sendRequest('sessions.list', { 
  kinds: ['isolated'],
  activeMinutes: 60,  // Last hour
  messageLimit: 1,    // Just need status
});
```

## Open Questions

1. **Polling vs Events**: Gateway may not push process events. Need to verify.
2. **Process persistence**: Do completed processes stay in list? For how long?
3. **Sub-agent cleanup**: Show completed sub-agents or only active?
4. **Log streaming**: Can we stream process output or just poll?

## Out of Scope (for now)

- Cron job management
- Process resource usage (CPU/memory)
- Process grouping/filtering
- Bulk actions (kill all)

## Files to Create/Modify

```
src/
├── components/
│   └── Sidebar/
│       ├── ProcessList.tsx      # NEW - Process/sub-agent list
│       ├── ProcessItem.tsx      # NEW - Individual process display
│       └── ProcessLogModal.tsx  # NEW - Log viewer modal
├── stores/
│   └── appStore.ts              # Add processes state
└── hooks/
    └── useProcesses.ts          # NEW - Process polling/management
```

## Acceptance Criteria

- [ ] Can see list of running background processes
- [ ] Can view process output/logs
- [ ] Can kill a running process
- [ ] Can see sub-agent sessions
- [ ] Can click sub-agent to view its conversation
- [ ] Panel is collapsible
- [ ] Updates automatically (poll or events)
