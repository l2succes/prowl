# Prowl Launch Materials

## Hacker News Post

**Title:** Show HN: Prowl – Multi-session dashboard for AI agent workflows

**Text:**
```
Hey HN,

I built Prowl to solve a problem I kept running into: managing multiple AI agent sessions at once.

When you're using AI agents for real work – research, coding, automation – you often need several running in parallel. But switching between terminal windows or chat tabs gets messy fast. You lose track of what each agent is doing, which files they've touched, and where you left off.

Prowl is a web dashboard that connects to OpenClaw (an open-source AI agent framework) and lets you:

- Run multiple chat sessions side by side
- See tool calls in real-time (file reads, shell commands, web searches)
- Track every file your agents touch across all sessions
- Click any file to view its contents

It's built with React + TypeScript + Tailwind, connects via WebSocket, and is fully open source.

Tech stack: React 18, Vite, Zustand for state, TailwindCSS. No heavy dependencies.

GitHub: https://github.com/l2succes/prowl

This started as a weekend project to scratch my own itch. Would love feedback on what features would make this more useful for your workflows.
```

---

## Twitter/X Thread

**Tweet 1 (Hook):**
```
I got tired of juggling 5 terminal windows while running AI agents.

So I built Prowl – a multi-session dashboard for AI workflows.

Here's what it does 🧵
```

**Tweet 2 (Problem):**
```
The problem: AI agents are great for parallel work.

Research in one session. Coding in another. Automation in a third.

But managing them? Chaos. You're constantly switching tabs, losing context, forgetting what each agent was doing.
```

**Tweet 3 (Solution):**
```
Prowl gives you one dashboard to rule them all:

• Multiple sessions running in parallel
• Real-time tool call visualization
• File tracking across all sessions
• Click any file to view it instantly

Like mission control for your AI workflows.
```

**Tweet 4 (Demo/Screenshot):**
```
Here's what it looks like in action:

[ATTACH SCREENSHOT/GIF]

Create a session, chat with your agent, watch the tools execute in real-time.
```

**Tweet 5 (Tech):**
```
Built with:
• React 18 + TypeScript
• Vite (fast!)
• TailwindCSS
• Zustand for state
• WebSocket connection to OpenClaw

No heavy dependencies. Just clean, fast UI.
```

**Tweet 6 (Open Source):**
```
It's fully open source.

GitHub: github.com/l2succes/prowl

Works with OpenClaw (open-source AI agent framework).

PRs welcome – especially for keyboard shortcuts, search, and split view.
```

**Tweet 7 (CTA):**
```
If you're running multiple AI agents and want a better way to manage them, give Prowl a try.

Star the repo if it's useful: github.com/l2succes/prowl

What features would you want to see? 👇
```

---

## Demo Video Script (30-60 seconds)

**Scene 1 (0-5s):** Empty Prowl dashboard. "Managing multiple AI agents? Let me show you Prowl."

**Scene 2 (5-15s):** Click "+ New Session". Type a message like "Read my package.json and summarize it". Send.

**Scene 3 (15-30s):** Watch the response stream in. Tool call appears (Read tool). Expand it to show the file path and content.

**Scene 4 (30-40s):** Switch to Files tab in sidebar. Show the tracked file. Click it to open the file viewer.

**Scene 5 (40-50s):** Create a second session. Show both in the sidebar. Switch between them.

**Scene 6 (50-60s):** "Prowl. Multi-session AI dashboard. Link in bio." Show GitHub URL.

---

## How to Record the Demo

**Option 1: QuickTime (Mac) – Simplest**
1. Open QuickTime Player
2. File → New Screen Recording
3. Select the browser window
4. Record your demo
5. Trim in QuickTime, export as .mov
6. Convert to GIF with: `ffmpeg -i demo.mov -vf "fps=15,scale=800:-1" -loop 0 demo.gif`

**Option 2: Kap (Mac) – Best for GIFs**
1. `brew install --cask kap`
2. Open Kap, select region around browser
3. Record
4. Export directly as GIF or MP4

**Option 3: OBS (Any platform) – Most control**
1. Set up scene with browser window capture
2. Record
3. Edit in any video editor
4. Export as MP4, convert to GIF if needed

**Option 4: Screen.studio (Mac) – Prettiest**
- Paid but makes gorgeous demo videos with auto-zoom
- Worth it if you do this often

**Tips:**
- Use a clean browser profile (no bookmarks bar clutter)
- Increase font size slightly for readability
- Pre-type your messages, paste them in (faster recording)
- Keep it under 60 seconds for Twitter, under 2 min for HN
- Add captions/text overlays for silent autoplay

---

## Launch Checklist

- [ ] Record demo video/GIF
- [ ] Add GIF to README (replace static screenshot)
- [ ] Post on Hacker News (best times: 9-11am EST weekdays)
- [ ] Post Twitter thread
- [ ] Share in OpenClaw Discord/community
- [ ] Cross-post to Reddit r/MachineLearning, r/artificial, r/LocalLLaMA
- [ ] Publish to ClawdHub as installable skill
