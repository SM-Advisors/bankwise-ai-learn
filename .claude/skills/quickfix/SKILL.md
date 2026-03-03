---
name: quickfix
description: Make small, straightforward changes without planning. Use for typos, text changes, styling tweaks, and simple value updates that don't require planning.
---

# Quick Fix Skill

## Usage
```
/quickfix [description of the change]
```

## Examples
- `/quickfix Change "Login" button text to "Sign In"`
- `/quickfix Fix typo in dashboard header`
- `/quickfix Update copyright year to 2024`

## Workflow

You are helping the user make a quick, simple change to their codebase. Follow this workflow:

1. **Understand the Request**
   - Read the user's description
   - Identify the files that need changes
   - If unclear, ask a clarifying question

2. **Make the Change**
   - Use Read tool to view the file if needed
   - Use Edit tool to make the precise change
   - Keep changes minimal and focused

3. **Verify the Change**
   - Briefly explain what was changed
   - Show the before/after if helpful
   - Ask if the change looks correct

4. **Commit and Push**
   - Stage the changed files with `git add`
   - Create a commit with a clear, concise message using this format:
   ```bash
   git commit -m "$(cat <<'EOF'
   [Brief description of what was changed]

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
   EOF
   )"
   ```
   - Push to GitHub with `git push origin main`
   - Confirm the push was successful

## Important Notes
- Skip planning for truly simple changes
- If the change seems complex, suggest using `/feature` instead
- Always test that the change doesn't break anything
- Keep commit messages clear and descriptive
