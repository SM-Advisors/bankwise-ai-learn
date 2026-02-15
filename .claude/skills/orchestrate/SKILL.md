---
name: orchestrate
description: Intelligent orchestrator that analyzes tasks, chooses the right workflow, and coordinates multiple skills. Use for any task when you want smart coordination, detailed explanations, and multi-step workflow management.
---

# Orchestrate Skill - Smart Workflow Manager

## Usage
```
/orchestrate [description of what you want to do]
```

## Examples
- `/orchestrate Fix typo in header`
- `/orchestrate Add user profile page with authentication`
- `/orchestrate Deploy the latest changes`

## Workflow

You are an intelligent orchestrator. Your job is to:
1. **Understand** the user's request
2. **Analyze** what needs to be done
3. **Choose** the right approach
4. **Execute** using the appropriate skill workflow
5. **Coordinate** multiple steps if needed

---

## Step 1: Analyze the Request

Read the user's description and extract:
- **What** they want to accomplish
- **Scope** of the change (small, medium, large)
- **Complexity** level
- **Dependencies** between steps

---

## Step 2: Categorize the Task

### Category A: Simple Changes (Use quickfix workflow)
**Indicators:**
- Single file changes
- Text/wording updates
- Styling tweaks (colors, spacing, fonts)
- Value changes (numbers, strings, booleans)
- Typo fixes
- No new functionality added

**Action:** Follow the `/quickfix` skill workflow:
1. Make the change directly
2. Verify it looks correct
3. Commit with concise message
4. Push to GitHub

---

### Category B: Feature Development (Use feature workflow)
**Indicators:**
- Adding new components or pages
- Implementing new features
- Multi-file changes (2-5 files)
- New routes or API endpoints
- Requires planning
- New functionality

**Action:** Follow the `/feature` skill workflow:
1. Plan the implementation
2. Get user approval
3. Execute the plan
4. Test the changes
5. Commit with detailed message
6. Push to GitHub

---

### Category C: Complex Changes (Use feature workflow + extra care)
**Indicators:**
- Architectural changes
- Affects many files (5+ files)
- Authentication/security changes
- Database migrations
- Breaking changes
- Integration with external services

**Action:** Follow the `/feature` skill workflow with these additions:
1. **Extra exploration** - Understand full impact
2. **Detailed planning** - Break into phases
3. **Risk assessment** - Identify potential issues
4. **Phased execution** - Implement in stages
5. **Comprehensive testing** - Test all scenarios
6. **Detailed commit** - Document everything
7. Push to GitHub

---

### Category D: Deploy Only (Use deploy workflow)
**Indicators:**
- User says "deploy", "push", "save changes"
- Changes already made
- Just needs commit + push
- No new work needed

**Action:** Follow the `/deploy` skill workflow:
1. Check git status
2. Stage changed files
3. Create commit
4. Push to GitHub

---

### Category E: Testing Only (Use test workflow)
**Indicators:**
- User says "test", "verify", "check"
- Changes already made
- Want to verify before committing
- Looking for bugs

**Action:** Follow the `/test` skill workflow:
1. Review changed files
2. Check for errors
3. Test functionality
4. Report findings

---

### Category F: Rollback (Use rollback workflow)
**Indicators:**
- User says "undo", "revert", "rollback"
- Something broke
- Need to go back
- Want previous version

**Action:** Follow the `/rollback` skill workflow:
1. Show commit history
2. Confirm target commit
3. Check for uncommitted changes
4. Perform reset
5. Push if needed

---

## Step 3: Explain Your Decision

Before proceeding, tell the user:

```
I've analyzed your request: "[summarize request]"

This is a [CATEGORY] task because:
- [Reason 1]
- [Reason 2]

I'll use the [SKILL NAME] workflow:
→ [Step 1]
→ [Step 2]
→ [Step 3]

This should take about [estimate] and will involve [files/changes].

Ready to proceed?
```

Wait for confirmation if it's a complex task.

---

## Step 4: Execute with Coordination

### For Simple Tasks (Category A):
Execute directly without asking permission.

### For Medium Tasks (Category B):
Show the plan, get approval, then execute.

### For Complex Tasks (Category C):
Show detailed plan → Get approval → Execute in phases → Test after each phase → Final commit.

### For Multi-Skill Tasks:
Some requests need multiple skills in sequence:

**Example: "Add feature and test it"**
1. Use `/feature` workflow to implement
2. Then use `/test` workflow to verify
3. Only commit if tests pass

**Example: "Fix bug and deploy"**
1. Use `/quickfix` workflow for the fix
2. Auto-commits and pushes (deploy is included)

**Example: "Build feature but let me test manually"**
1. Use `/feature` workflow to implement
2. Skip the commit step
3. Tell user to test manually
4. Wait for user to say "deploy" or "commit this"

---

## Step 5: Handle Edge Cases

### If Request is Ambiguous:
Ask clarifying questions:
- "Do you want me to plan this first, or just make the change?"
- "Should this create a new component or modify existing?"
- "Which file should I update?"

### If Request Needs Breaking Down:
"This is a large task. I recommend breaking it into phases:
1. [Phase 1]
2. [Phase 2]
3. [Phase 3]

Should I start with Phase 1?"

### If Multiple Approaches Exist:
Present options:
"I can do this two ways:
A) [Approach 1] - pros and cons
B) [Approach 2] - pros and cons

Which would you prefer?"

### If Request is Unclear:
"I'm not quite sure what you mean. Could you clarify:
- [Specific question 1]
- [Specific question 2]"

---

## Decision Matrix Reference

| Request Keywords | Category | Workflow | Needs Approval? |
|-----------------|----------|----------|-----------------|
| fix, change, update (simple) | A | quickfix | No |
| add, create, new, implement | B | feature | Yes |
| refactor, migrate, restructure | C | feature (careful) | Yes |
| deploy, push, commit, save | D | deploy | No |
| test, verify, check | E | test | No |
| undo, revert, rollback | F | rollback | Yes |

---

## Important Notes

1. **Default to planning** for anything that's not obviously simple
2. **Always explain** your reasoning before acting
3. **Coordinate steps** logically (test before commit, plan before build)
4. **Adapt based on feedback** - user can override your choice
5. **Be transparent** about what will happen

---

## Examples in Action

### Example 1: Simple Fix
```
User: /orchestrate Fix typo "Sing In" → "Sign In"

You: "I've analyzed your request: Fix typo in button text.

This is a SIMPLE CHANGE because:
- Single text change
- No new functionality
- One file affected

I'll use the QUICKFIX workflow:
→ Find and fix the typo
→ Commit with message
→ Push to GitHub

Proceeding now..."

[Execute quickfix workflow]
```

### Example 2: New Feature
```
User: /orchestrate Add dark mode toggle

You: "I've analyzed your request: Add dark mode toggle.

This is a FEATURE DEVELOPMENT task because:
- New component needed
- Multiple files affected (toggle component, theme config, styles)
- Requires planning

I'll use the FEATURE workflow:
→ Plan the implementation approach
→ Get your approval
→ Create toggle component
→ Integrate with theme system
→ Test on different pages
→ Commit and push

Let me start by exploring your current theme setup..."

[Execute feature workflow]
```

### Example 3: Complex Task
```
User: /orchestrate Implement user authentication with email verification

You: "I've analyzed your request: Implement authentication system.

This is a COMPLEX CHANGE because:
- Security-sensitive functionality
- Multiple files affected (auth pages, API routes, database schema)
- Requires careful planning and testing
- Breaking change for existing users

I'll use the FEATURE workflow with extra care:

Phase 1: Planning & Architecture
→ Review current auth setup
→ Design auth flow
→ Plan database changes
→ Get your approval

Phase 2: Implementation
→ Create auth pages
→ Set up API endpoints
→ Configure email service
→ Add email verification

Phase 3: Testing & Deployment
→ Test all auth flows
→ Verify security measures
→ Commit with detailed docs
→ Push to GitHub

This is significant work. Should I proceed with Phase 1 planning?"

[Wait for approval, then execute carefully]
```

---

## Customization Tips

You can tell me to adjust my behavior:
- "Always ask before committing"
- "Be more aggressive - don't ask permission for small changes"
- "Break complex tasks into smaller pieces"
- "Default to testing everything before committing"

