---
name: build
description: Smart orchestrator that automatically chooses the right workflow based on complexity. Fast execution with minimal explanation for straightforward tasks.
---

# Build Skill (Smart Orchestrator)

## Usage
```
/build [description of what you want to do]
```

## Examples
- `/build Fix typo in header` → Routes to quickfix
- `/build Add user profile page` → Routes to feature workflow
- `/build Update button color to blue` → Routes to quickfix

## Workflow

You are an intelligent orchestrator that assesses the user's request and chooses the optimal workflow.

### Step 1: Analyze the Request

Read the user's description and categorize it:

**SIMPLE (Use quickfix workflow):**
- Text changes, typos, wording updates
- Styling tweaks (colors, sizes, spacing)
- Simple value changes (numbers, strings)
- Single-line or few-line changes
- No new functionality

**MEDIUM (Use feature workflow):**
- Adding new components or pages
- Implementing new features
- Modifying multiple files
- Adding new routes or endpoints
- Requires planning and testing

**COMPLEX (Use feature workflow with extra steps):**
- Major architectural changes
- Changes affecting many files (>5)
- Breaking changes
- Security-sensitive changes
- Requires database migrations

### Step 2: Assess Complexity

Use these guidelines to determine complexity:

```
IF request contains words like:
  - "fix typo", "change text", "update wording"
  - "change color", "update style", "adjust spacing"
  - "rename variable", "change value"

  THEN → SIMPLE (quickfix)

ELSE IF request contains words like:
  - "add", "create", "implement", "build"
  - "new feature", "new page", "new component"
  - "integrate", "connect", "set up"

  THEN → MEDIUM (feature)

ELSE IF request contains words like:
  - "refactor", "restructure", "redesign"
  - "migrate", "upgrade", "overhaul"
  - "authentication", "authorization", "security"

  THEN → COMPLEX (feature with extra care)
```

### Step 3: Explain Your Choice

Before proceeding, tell the user:
1. What complexity level you've identified
2. Which workflow you'll use
3. What steps that workflow includes

Example:
> "This looks like a **simple change** (updating button text). I'll use the **quickfix workflow**: make the change, verify it, then commit and push. Sound good?"

### Step 4: Execute the Chosen Workflow

**For SIMPLE:**
1. Make the change directly
2. Show the before/after
3. Commit with concise message
4. Push to GitHub

**For MEDIUM:**
1. Explore the codebase
2. Create an implementation plan
3. Get user approval
4. Execute the plan
5. Test the changes
6. Commit with detailed message
7. Push to GitHub

**For COMPLEX:**
1. Explore thoroughly
2. Create detailed plan with phases
3. Discuss risks and considerations
4. Get user approval
5. Execute in phases with checkpoints
6. Test extensively
7. Commit with comprehensive message
8. Push to GitHub

### Step 5: Handle Edge Cases

**If Unsure:**
- Default to MEDIUM (feature workflow)
- Explain: "I'm not sure of the complexity, so I'll plan it out first to be safe."

**If User Disagrees:**
- Respect their choice
- "Got it! I'll use the [workflow] approach instead."

## Important Notes

- When in doubt, plan first (better safe than sorry)
- User can override your choice at any time
- Always explain your reasoning
- Adapt based on user feedback
- Some requests may need clarification before categorizing

## Quick Reference

| Request Type | Examples | Workflow |
|--------------|----------|----------|
| **Text/Wording** | "Fix typo", "Change label" | Quickfix |
| **Styling** | "Update color", "Adjust spacing" | Quickfix |
| **New Features** | "Add button", "Create page" | Feature |
| **Integration** | "Connect API", "Add auth" | Feature |
| **Major Changes** | "Refactor", "Migrate" | Feature (careful) |

