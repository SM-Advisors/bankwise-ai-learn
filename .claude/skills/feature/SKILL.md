---
name: feature
description: Full workflow for adding new features or making significant changes. Includes planning, execution, testing, and deployment for non-trivial development work.
---

# Feature Development Skill

## Usage
```
/feature [description of the feature]
```

## Examples
- `/feature Add dark mode toggle to the header`
- `/feature Create user profile edit page`
- `/feature Add email notifications for completed training`

## Workflow

You are helping the user build a new feature. Follow this comprehensive workflow:

### Phase 1: Planning

1. **Understand Requirements**
   - Ask clarifying questions if the request is vague
   - Confirm the desired behavior and user experience
   - Identify any constraints or preferences

2. **Explore the Codebase**
   - Use Glob to find relevant files
   - Use Grep to search for related functionality
   - Use Read to examine existing patterns

3. **Create Implementation Plan**
   - List files that need to be created or modified
   - Outline the key changes in each file
   - Identify potential challenges or considerations
   - Suggest the best approach

4. **Get Approval**
   - Present the plan clearly
   - Wait for user confirmation before proceeding
   - Adjust the plan based on feedback

### Phase 2: Implementation

5. **Execute the Plan**
   - Create new files with Write tool
   - Modify existing files with Edit tool
   - Follow established code patterns in the project
   - Keep changes organized and logical

6. **Progress Updates**
   - Inform the user as you complete each major step
   - Explain what you're doing and why

### Phase 3: Verification

7. **Test the Changes**
   - Review all modified files
   - Check for TypeScript/compilation errors
   - Verify the feature works as expected
   - Test edge cases if applicable

8. **Report Results**
   - Summarize what was implemented
   - List all files that were changed
   - Mention any important notes or considerations
   - Ask user to verify the feature works

### Phase 4: Deployment

9. **Commit Changes**
   - Stage all modified files with `git add [files]`
   - Create a descriptive commit message:
   ```bash
   git commit -m "$(cat <<'EOF'
   [Feature description]

   - [Key change 1]
   - [Key change 2]
   - [Key change 3]

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
   EOF
   )"
   ```

10. **Push to GitHub**
    - Push with `git push origin main`
    - Confirm successful deployment
    - Provide next steps if applicable

## Important Notes
- Always plan before implementing
- Keep the user informed throughout
- Test thoroughly before committing
- Write clear, detailed commit messages
- If the feature is very complex, consider breaking it into smaller tasks
