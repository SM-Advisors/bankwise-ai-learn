# Your Global Claude Code Skills

These skills are available in **every project** where you use Claude Code for Desktop.

## Available Skills

### 🎯 `/orchestrate` - Smart Orchestrator (Start Here!)
**The intelligent coordinator that manages your entire workflow**

```bash
/orchestrate [what you want to do]
```

**Examples:**
- `/orchestrate Fix the typo in the header`
- `/orchestrate Add a dark mode toggle`
- `/orchestrate Create a user settings page`

**What it does:**
- Analyzes your request deeply
- Chooses the right workflow (quickfix, feature, test, deploy, rollback)
- Coordinates multiple steps if needed
- Explains its reasoning before acting

---

### 🔧 `/build` - Simple Smart Router
**Quick decision maker for straightforward tasks**

```bash
/build [what you want to do]
```

**Best for:** When you want a faster, less verbose experience
**What it does:** Quickly categorizes and executes without detailed explanations

---

### ⚡ `/quickfix` - Fast Changes
**For simple, straightforward changes**

```bash
/quickfix [description]
```

**Best for:**
- Text changes, typos
- Color/styling updates
- Simple value changes

**Workflow:** Change → Verify → Commit → Push

---

### 🚀 `/feature` - Full Development
**For new features and significant changes**

```bash
/feature [description]
```

**Best for:**
- New components or pages
- Adding functionality
- Multi-file changes

**Workflow:** Plan → Execute → Test → Commit → Push

---

### 📦 `/deploy` - Save & Push
**Commit and push existing changes**

```bash
/deploy [optional: commit message]
```

**Best for:**
- When you've manually made changes
- Quick save and push
- Deploying ready work

**Workflow:** Stage → Commit → Push

---

### ✅ `/test` - Verify Changes
**Check that everything works**

```bash
/test [optional: what to test]
```

**Best for:**
- After making changes
- Before committing
- Catching bugs early

**Workflow:** Review → Check Errors → Test → Report

---

### ⏮️ `/rollback` - Undo Changes
**Revert to a previous commit**

```bash
/rollback [optional: commits or hash]
```

**Best for:**
- Something broke
- Need to undo changes
- Go back to working state

**Workflow:** Show History → Confirm → Reset → Push

---

### 🔄 `/reset` - Session Handoff
**Capture context and start fresh**

```bash
/reset [optional: notes about what to capture]
```

**Best for:**
- Long conversations hitting context limits
- Switching to a new session without losing progress
- Documenting where you left off before taking a break

**Workflow:** Analyze Session → Check Git State → Write Handoff → Offer Deploy

---

### 🔁 `/resume` - Continue From Handoff
**Pick up where you left off in a new conversation**

```bash
/resume
```

**Best for:**
- Starting a new conversation after `/reset`
- Loading previous session context quickly

**Workflow:** Load Handoff → Verify Git State → Summarize → Confirm Direction

---

## Which Skill Should I Use?

### Quick Decision Tree:

```
Not sure what you need?
  → Use /orchestrate (RECOMMENDED)
     It will figure everything out for you!

Want quick action without explanation?
  → Use /build

Know exactly what you need?
  ↓

Is it a small, simple change?
  YES → Use /quickfix
  NO ↓

Is it adding new functionality?
  YES → Use /feature
  NO ↓

Do you just need to save what you did?
  YES → Use /deploy
  NO ↓

Want to test before committing?
  YES → Use /test
  NO ↓

Need to undo something?
  YES → Use /rollback
  NO ↓

Session getting long or need to pick up later?
  YES → Use /reset, then /resume in the new session
```

---

## How Global Skills Work

✅ **Available Everywhere**
- These skills work in every project
- No need to recreate them

✅ **Can Be Overridden**
- Create project-specific versions in `.claude/skills/` in your project
- Project skills take precedence over global ones

✅ **Easy to Customize**
- Edit the `.md` files in `~/.claude/skills/`
- Changes apply to all projects immediately

---

## Location

These skills are stored at:
```
Windows: C:\Users\coryk\.claude\skills\
Mac/Linux: ~/.claude/skills/
```

---

## Tips

1. **Start with `/orchestrate`** if unsure - it's the smartest and explains everything
2. **Use `/build`** for faster execution with less explanation
3. **Use `/quickfix`** when you know it's a simple change
4. **Use `/feature`** when you know you need full planning
5. **Use `/test`** before any commit to catch issues early
6. **Use `/rollback`** carefully - it can't be undone!
7. **Use `/reset`** before ending a long session, then **`/resume`** to pick back up

## Orchestrate vs Build: What's the Difference?

| Feature | `/orchestrate` | `/build` |
|---------|----------------|----------|
| **Explanation** | Detailed reasoning | Brief |
| **Coordination** | Multi-step workflows | Single workflow |
| **Best for** | Learning, complex tasks | Quick execution |
| **Speed** | Slower (more thorough) | Faster |
| **Transparency** | High (explains everything) | Medium |

---

## Examples in Action

**Scenario 1: Fix a typo**
```
You: /quickfix Change "Sing In" to "Sign In"
Claude: Makes change → Commits → Pushes → Done!
```

**Scenario 2: Add new feature**
```
You: /feature Add export button to dashboard
Claude: Plans → Shows plan → You approve → Implements → Tests → Commits → Pushes
```

**Scenario 3: Not sure?**
```
You: /build Update the user profile page
Claude: "This looks like a medium complexity task. I'll use the feature workflow..."
```

---

## Need Help?

Ask me:
- "Show me how to use /feature"
- "What's the difference between /quickfix and /feature?"
- "Can I customize these skills?"
- "How do I create project-specific skills?"

