---
name: deploy
description: Commit current changes and push to GitHub. Use when you've already made changes and just need to save and deploy them.
---

# Deploy Skill

## Usage
```
/deploy [optional: custom commit message]
```

## Examples
- `/deploy` (uses auto-generated commit message)
- `/deploy Fix authentication bug`
- `/deploy Update user interface styles`

## Workflow

You are helping the user commit and push their current changes to GitHub.

1. **Check Git Status**
   - Run `git status` to see what files have changed
   - List the modified files for the user

2. **Stage Changes**
   - Stage all changed files with `git add [files]`
   - List specific files rather than using `git add .` when possible

3. **Create Commit**
   - If user provided a message, use that
   - If no message provided, generate a descriptive one based on the changes
   - Use this format:
   ```bash
   git commit -m "$(cat <<'EOF'
   [Commit message]

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
   EOF
   )"
   ```

4. **Push to Remote**
   - Check current branch with `git branch --show-current`
   - Pull any remote changes first if needed: `git pull --rebase origin [branch]`
   - Push changes: `git push origin [branch]`

5. **Confirm Success**
   - Report that changes were pushed successfully
   - Mention the commit message used
   - Provide the commit hash if available

## Important Notes
- Always check `git status` first to see what's being committed
- Pull before pushing to avoid conflicts
- If there are uncommitted changes, explain what will be committed
- If git push is rejected, handle merge conflicts appropriately
