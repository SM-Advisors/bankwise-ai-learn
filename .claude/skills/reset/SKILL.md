---
name: reset
description: Capture the current session context (progress, decisions, next steps) into a handoff document, so you can start a fresh conversation and seamlessly pick up where you left off.
---

# Reset Skill

## Purpose

Long conversations accumulate context that can degrade performance and hit token limits. This skill captures the essential state of your current session into a structured handoff document, so a fresh conversation can resume your work without losing important context.

## Usage
```
/reset [optional: additional notes about what to capture]
```

## Examples
- `/reset` (auto-generates full context summary)
- `/reset Focus on the auth bug — we narrowed it to the session middleware`
- `/reset We decided on approach B for the database migration`

## Workflow

You are helping the user capture their current session state so they can continue in a new conversation.

### Step 1: Gather Session Context

Analyze the full conversation to extract:

1. **What was the goal?** — The original task or request that started this session
2. **What was accomplished?** — Concrete changes made (files created, edited, deleted)
3. **Key decisions made** — Architecture choices, approach selections, trade-offs discussed
4. **Current state** — Where things stand right now (working? broken? partially done?)
5. **Open issues / blockers** — Anything unresolved, errors encountered, questions pending
6. **Next steps** — What should be done next to continue the work
7. **Important file paths** — Key files that were central to the work
8. **User preferences expressed** — Any stated preferences for how to approach things

If the user provided additional notes in their `/reset` command, incorporate those as priority context.

### Step 2: Check Working State

Run these commands to capture the current code state:

```bash
git status
git diff --stat
git log --oneline -5
```

Include a summary of:
- Any uncommitted changes
- Current branch
- Recent commits from this session

### Step 3: Generate the Handoff Document

Write a structured handoff file to `.claude/handoff.md` using this format:

```markdown
# Session Handoff

**Date:** [current date and time]
**Branch:** [current git branch]
**Status:** [In Progress | Blocked | Ready for Next Phase | Completed]

## Goal
[1-2 sentence description of what the user was trying to accomplish]

## What Was Done
- [Concrete accomplishment 1]
- [Concrete accomplishment 2]
- [etc.]

## Key Decisions
- [Decision 1 and why it was made]
- [Decision 2 and why it was made]

## Current State
[Description of where things stand — what's working, what's not, what's partially done]

### Uncommitted Changes
[Summary of any uncommitted git changes, or "None — all changes committed"]

## Open Issues
- [Issue or blocker 1]
- [Issue or blocker 2]
- [Or "None" if everything is clean]

## Next Steps
1. [Most important next action]
2. [Second priority]
3. [Third priority]

## Key Files
- `path/to/file1` — [why it matters]
- `path/to/file2` — [why it matters]

## Context for Next Session
[Any nuanced context that would be hard to rediscover — e.g., "The Supabase RLS policy
needs to be updated manually in the dashboard, not via migration" or "The user prefers
inline styles over separate CSS files for this project"]
```

### Step 4: Present and Confirm

Show the user a summary of what was captured and tell them:

1. The handoff document has been saved to `.claude/handoff.md`
2. In their next conversation, they can say: **"Read .claude/handoff.md and continue where we left off"**
3. Offer to commit the handoff file if there are also code changes to save

### Step 5: Offer to Deploy (Optional)

If there are uncommitted code changes, ask the user:
- "Would you like me to commit and push your current changes before you reset?"
- If yes, follow the `/deploy` workflow to save everything first

## Important Notes

- **Overwrite previous handoffs:** Each `/reset` overwrites `.claude/handoff.md` — this is intentional. It should always reflect the most recent session state.
- **Be specific, not verbose:** The handoff should be scannable. Use bullet points and short sentences. Avoid restating the entire conversation.
- **Capture decisions, not deliberation:** Don't document the full back-and-forth. Capture the conclusions and the reasoning behind them.
- **Include file paths:** Always mention specific files so the next session can jump straight to the right code.
- **Git state matters:** Always check and document uncommitted changes so nothing gets lost between sessions.
- **User notes take priority:** If the user adds notes to the `/reset` command, make sure those are prominently captured — they're flagging what they consider most important.
