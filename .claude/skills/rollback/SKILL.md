---
name: rollback
description: Undo recent changes by reverting to a previous commit. Use when something breaks and you need to restore a working state.
---

# Rollback Skill

## Usage
```
/rollback [optional: number of commits or commit hash]
```

## Examples
- `/rollback` (undo last commit)
- `/rollback 3` (go back 3 commits)
- `/rollback abc123` (revert to specific commit)

## Workflow

You are helping the user safely undo changes and restore their codebase to a previous working state.

### Phase 1: Assess the Situation

1. **Show Recent Commits**
   - Run `git log --oneline -10` to show last 10 commits
   - Display commits with messages and hashes
   - Help user identify which commit to revert to

2. **Confirm the Target**
   - Ask user to confirm which commit to revert to
   - Explain what will be undone
   - **IMPORTANT:** Warn that uncommitted changes will be lost

### Phase 2: Check for Uncommitted Changes

3. **Check Working Directory**
   - Run `git status` to see if there are uncommitted changes
   - If there are uncommitted changes:
     - **STOP** and ask user what to do:
       - Option A: Stash changes (`git stash`)
       - Option B: Commit changes first
       - Option C: Discard changes (DESTRUCTIVE)
   - Wait for user decision before proceeding

### Phase 3: Perform Rollback

4. **Choose Rollback Method**

   **Method A: Soft Reset (Recommended)**
   - Keeps changes in working directory
   - Allows you to recommit or modify
   - Command: `git reset --soft HEAD~[n]`

   **Method B: Hard Reset (Destructive)**
   - Completely removes changes
   - No way to recover
   - Command: `git reset --hard HEAD~[n]`
   - **ONLY use if user explicitly confirms**

5. **Execute the Rollback**
   - Run the appropriate git reset command
   - Confirm the reset was successful
   - Show new HEAD position

### Phase 4: Update Remote

6. **Push Changes (if needed)**
   - If rolling back commits that were already pushed:
     - **WARNING:** Force push required
     - Command: `git push --force origin [branch]`
     - **ONLY proceed with explicit user confirmation**
   - If commits weren't pushed yet:
     - Regular push works: `git push origin [branch]`

7. **Verify Success**
   - Show current commit with `git log -1`
   - Run `git status` to show current state
   - Confirm the rollback completed successfully

## Safety Warnings

⚠️ **Before Rolling Back:**
- Always show what will be undone
- Check for uncommitted changes
- Get explicit user confirmation
- Explain the consequences

⚠️ **Force Push Warning:**
- Force pushing can cause data loss for others
- Only force push to branches you own
- Never force push to main without permission
- Warn user before executing

## Important Notes
- Default to soft reset unless user requests hard reset
- Always confirm before destructive actions
- Provide clear explanations of what will happen
- Offer to stash changes before resetting
- Show before/after state clearly
