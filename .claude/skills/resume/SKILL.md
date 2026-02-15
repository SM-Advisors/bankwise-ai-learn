---
name: resume
description: Pick up where you left off by reading the handoff document from a previous session. Use this at the start of a new conversation to restore context.
---

# Resume Skill

## Purpose

After using `/reset` to capture session context, use `/resume` at the start of a fresh conversation to load that context and continue seamlessly.

## Usage
```
/resume
```

## Examples
- `/resume` (loads the handoff and gets you back on track)

## Workflow

You are helping the user resume work from a previous session.

### Step 1: Load the Handoff Document

Read the file `.claude/handoff.md`.

If the file does not exist, tell the user:
> "No handoff document found. Use `/reset` in a session to capture context before starting a new conversation."

### Step 2: Check Current State

Run these commands to verify the working state matches the handoff:

```bash
git status
git branch --show-current
git log --oneline -5
```

Compare against what the handoff document describes. Note any discrepancies (e.g., new commits since the handoff, uncommitted changes that weren't mentioned).

### Step 3: Present the Context

Summarize the handoff to the user in a concise format:

1. **What you were working on** — the goal from the handoff
2. **Where things stand** — current state and what was already done
3. **What's next** — the next steps listed in the handoff
4. **Any discrepancies** — if the git state doesn't match the handoff, flag it

### Step 4: Confirm Direction

Ask the user:
> "Here's where we left off. Want me to continue with the next steps, or do you have a different direction in mind?"

Then proceed based on their answer.

## Important Notes
- Always verify git state against the handoff — things may have changed between sessions
- Keep the summary concise — the user already lived through the previous session, they just need a refresher
- If the handoff mentions blockers or open issues, highlight those prominently
- Don't just read the file back verbatim — synthesize it into an actionable summary
