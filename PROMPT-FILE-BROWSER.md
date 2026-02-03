# Phase 5: Add File Browser to OpenClaw Conductor

## Context
OpenClaw Conductor is a multi-session chat UI. Phases 1-4 are complete. Now add a file browser so users can see what files the AI is working on.

## Requirements

### 1. Track Files from Tool Use
- Parse tool use blocks in messages to extract file paths
- Track files that were read (`Read` tool) or written (`Write`/`Edit` tool)
- Store in session state: `{ path: string, action: 'read'|'write'|'edit', timestamp: number }`

### 2. Recent Files Panel
Add a collapsible "Files" section to the sidebar (below sessions list) showing:
- Files touched in the current session
- Group by: Recently Written, Recently Read
- Show relative path (truncate if long)
- Timestamp (e.g., "2 min ago")
- Click to view file

### 3. File Viewer
When clicking a file:
- Open a modal or right-side panel
- Show file contents with syntax highlighting
- Read file via exec: `cat <filepath>` (gateway can run shell commands)
- For now, use simple `<pre>` with basic styling (no need for Monaco yet)
- Close button, file path in header

### 4. Clickable File Paths in Chat
In tool use blocks that show file paths:
- Make the path clickable
- Opens file viewer when clicked

## Implementation

### Store Changes (`src/stores/appStore.ts`)
Add to session state:
```typescript
interface FileTouch {
  path: string;
  action: 'read' | 'write' | 'edit';
  timestamp: number;
}

// In session state
recentFiles: FileTouch[];
```

### New Components
- `src/components/Sidebar/FileList.tsx` — List of recent files
- `src/components/FileViewer/FileViewer.tsx` — Modal/panel for viewing file
- `src/components/FileViewer/FileViewerModal.tsx` — Modal wrapper

### Parse Tool Use
In the message parsing logic, detect:
- `Read` tool calls → extract `path` param
- `Write` tool calls → extract `path` param  
- `Edit` tool calls → extract `path` param

### UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Conductor                                                   │
├──────────────┬──────────────────────────────────────────────┤
│  Sessions    │                                               │
│  ▶ Session1  │            Chat Panel                        │
│  ▶ Session2  │                                               │
│              │  Messages with tool use blocks...             │
│  ──────────  │                                               │
│  📁 Files    │  Tool: Read                                   │
│   • App.tsx  │    path: [src/App.tsx] ← clickable           │
│   • store.ts │                                               │
│              │                                               │
└──────────────┴──────────────────────────────────────────────┘
```

## Success Criteria
1. Files from tool use appear in sidebar
2. Clicking a file opens viewer with contents
3. File paths in tool blocks are clickable
4. Works with current session (no persistence needed yet)

## Do NOT
- Add complex tree view (that's Phase 5b)
- Add file editing (read-only for now)
- Add Monaco/CodeMirror (simple pre tag is fine)

---

When done, output: FILE_BROWSER_COMPLETE
