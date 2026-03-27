---
name: smile-updates
description: Process a PDF of SMILE update requests from docs/. Reads the PDF, presents each update for approval, implements changes sequentially, then creates a single PR with deployment notes.
---

# SMILE Updates Skill

## Usage
```
/smile-updates
```

No arguments needed. Auto-detects the most recent `Updates to SMILE*.pdf` file in `docs/`.

## Examples
- `/smile-updates` — Process the latest updates document

## Workflow

You are processing a batch of update requests from a PDF document. Follow this workflow precisely.

### Phase 0: Document Discovery

1. **Find the document**
   - Use Glob to find all files matching `docs/Updates to SMILE*.pdf`
   - Sort by filename (the filenames contain dates) and select the most recent one
   - If no matching file is found, tell the user:
     > "No 'Updates to SMILE' PDF found in `docs/`. Please export your Word document as PDF, name it like `Updates to SMILE - {date}.pdf`, place it in the `docs/` folder, and try again."
   - Then stop.

2. **Read the document**
   - Use the Read tool on the PDF file with the `pages` parameter
   - Start by reading pages "1-5" to get the first batch of updates
   - Continue reading subsequent page ranges ("6-10", "11-15", etc.) until the entire document has been read
   - **Important**: The Read tool supports a maximum of 20 pages per request. For large documents, read in chunks.

3. **Parse the updates**
   - The document contains multiple update requests separated by horizontal line dividers
   - Each update block consists of:
     - **Text description**: What needs to change
     - **One or more screenshots/images**: Showing the current state or desired result
   - Number each update sequentially (Update 1, Update 2, etc.)
   - Present a summary to the user:
     > "Found **N updates** in `[filename]`. I'll process them one at a time — presenting a plan for each and waiting for your approval before implementing."

### Phase 1: Branch Setup

4. **Create a working branch**
   - Ensure you are on `main` (or the default branch): `git checkout main && git pull origin main`
   - Create a new branch: `git checkout -b claude/smile-updates-{short-id}`
   - The `{short-id}` should be 5 random alphanumeric characters (e.g., `xK4m2`)

### Phase 2: Sequential Update Processing

For **each update** (1 through N), repeat steps 5–8:

5. **Present the update plan**
   - Display: **"Update 1 of N"**
   - Quote the text description from the document
   - Reference the screenshot(s) — describe what they show and what the user wants changed
   - **Explore the codebase** to identify which files need modification:
     - Use Glob to find relevant files
     - Use Grep to search for related code patterns
     - Use Read to examine existing implementations
   - Present a concrete implementation plan:
     - List each file to create or modify
     - Describe the specific changes in each file
     - Note if a **database migration** is required (new table, column change, RLS policy, etc.)
     - Note if an **edge function** needs to be created or modified
     - Flag any risks or considerations

6. **Wait for approval**
   - Ask the user:
     > "Ready to implement this update? (yes / skip / or provide feedback to adjust the plan)"
   - **If "yes"** (or equivalent): proceed to step 7
   - **If "skip"**: note it as skipped and move to the next update
   - **If feedback is provided**: adjust the plan based on the feedback and re-present it, then wait again

7. **Implement the update**
   - Execute the plan using Edit and Write tools
   - Follow existing code patterns in the project
   - If a migration is needed:
     - Check the latest migration timestamp in `supabase/migrations/`
     - Create the new migration with the next appropriate timestamp: `YYYYMMDDHHMMSS_description.sql`
   - If edge function changes are needed, modify files under `supabase/functions/`
   - Run `npx tsc --noEmit` to verify no TypeScript errors were introduced
   - Briefly confirm what was done

8. **Commit the update**
   - Stage the changed files: `git add [specific files]` (never `git add .`)
   - Commit with a descriptive message:
   ```bash
   git commit -m "$(cat <<'EOF'
   [Brief description of this specific update]

   From: [PDF filename]
   Update [X] of [N]

   [session URL]
   EOF
   )"
   ```
   - Each update gets its own commit for clear history

9. **Move to the next update** — repeat steps 5–8

### Phase 3: Create Pull Request

10. **Push the branch**
    - Run: `git push -u origin claude/smile-updates-{id}`
    - Retry up to 4 times with exponential backoff if network errors occur

11. **Compile deployment notes**
    - Review all commits on the branch (`git log main..HEAD --oneline`)
    - Collect any migrations that were created (filenames from `supabase/migrations/`)
    - Collect any edge functions that were modified (folder names from `supabase/functions/`)

12. **Create the PR**
    - Use `gh pr create` with this structure:

    ```bash
    gh pr create --title "SMILE Updates: [PDF filename]" --body "$(cat <<'EOF'
    ## Summary
    Implements update requests from `[PDF filename]`.
    **[M] of [N] updates implemented** ([S] skipped).

    ## Changes
    - **Update 1**: [brief description] ✅
    - **Update 2**: [brief description] ✅
    - **Update 3**: [brief description] ⏭️ skipped — [reason]
    ...

    ## Deployment Notes

    ### Migrations to run
    - [ ] `supabase/migrations/[filename].sql` — [description]

    _(or "None — no migrations required")_

    ### Edge functions to deploy
    - [ ] `supabase/functions/[function-name]` — [description]

    _(or "None — no edge function changes")_

    ### Other post-merge steps
    - [ ] [Any other steps]

    _(or "None")_

    ## Source document
    `docs/[filename]`

    [session URL]
    EOF
    )"
    ```

13. **Report completion**
    - Provide the PR URL
    - Summarize: how many updates implemented, how many skipped
    - List any migrations to run or edge functions to deploy
    - Remind: **"The PR is ready for review. You will merge manually. Don't forget to run any listed migrations and deploy edge functions after merging."**

## Important Rules

- **One update at a time**: Never implement multiple updates simultaneously. Always present the plan and wait for approval before writing any code.
- **Screenshots are context**: The Read tool renders images from PDFs visually. Describe what the screenshots show when planning each change.
- **Do NOT merge the PR**: The user merges manually.
- **Do NOT push to main**: All work happens on the feature branch.
- **Type-check after each update**: Run `npx tsc --noEmit` before committing.
- **Migrations follow existing naming**: Check `supabase/migrations/` for the latest timestamp pattern.
- **Commit messages include session URL**: Every commit must end with the Claude Code session URL.
- **Stage specific files**: Never use `git add .` or `git add -A`.
- **PDF page limits**: Read a maximum of 20 pages per Read tool call. Use the `pages` parameter (e.g., `"1-10"`, `"11-20"`) to read in chunks.
