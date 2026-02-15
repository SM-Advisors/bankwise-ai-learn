---
name: test
description: Verify that recent changes work correctly. Review code, check for errors, and test functionality before committing.
---

# Test Skill

## Usage
```
/test [optional: what to test]
```

## Examples
- `/test` (test recent changes)
- `/test authentication flow`
- `/test the new export button`

## Workflow

You are helping the user test and verify their code changes.

1. **Identify What to Test**
   - If user specified what to test, focus on that
   - If not, check recent git changes: `git diff HEAD~1`
   - List the files that were recently modified

2. **Review Code Changes**
   - Use Read tool to examine changed files
   - Look for:
     - Syntax errors or typos
     - Missing imports or dependencies
     - Potential logic errors
     - TypeScript/type errors

3. **Check for Common Issues**
   - Missing error handling
   - Undefined variables or null references
   - Incorrect API endpoints or data structures
   - Missing dependencies in package.json
   - Broken imports or file paths

4. **Test Functionality**
   - Describe how the feature should work
   - Walk through the user flow
   - Identify edge cases to consider
   - Suggest manual testing steps

5. **Report Findings**
   - Summarize what was tested
   - Report any issues found (HIGH priority)
   - Confirm what looks good (LOW priority)
   - Suggest fixes for any problems
   - Recommend next steps

## Testing Scenarios to Check

### For UI Changes:
- Components render without errors
- Props are passed correctly
- Event handlers are connected
- Styling looks correct
- Responsive design works

### For Backend/Logic Changes:
- Functions have proper error handling
- Data validation is in place
- API calls use correct endpoints
- Database queries are safe
- Authentication is enforced

### For Routing Changes:
- Routes are properly defined
- Protected routes check auth
- Redirects work correctly
- 404 handling works

## Important Notes
- Focus on what was actually changed
- Be thorough but practical
- Prioritize critical issues over minor ones
- Suggest fixes, don't just report problems
- Consider both happy path and error cases
