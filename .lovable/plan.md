

## Apply C-Suite Reporting Migration (with fixes)

The migration file `20260220000000_csuite_reporting_enhancements.sql` has two bugs that need to be fixed before applying:

### Bug 1: Wrong admin check (Lines 9-14)
The policy references `user_profiles.role = 'admin'`, but this project uses a separate `user_roles` table and the `has_role()` function. Every other admin policy in the database uses `has_role(auth.uid(), 'admin'::app_role)`.

### Bug 2: CHECK constraint with NULL (Line 24)
`CHECK (roi_impact IN ('high', 'medium', 'low', NULL))` -- the `NULL` in an `IN` list doesn't work as expected in SQL. The column is already nullable, so the constraint just needs the three valid values plus an explicit `OR roi_impact IS NULL` allowance.

### Plan

**Step 1** -- Apply a corrected version of the migration using the database migration tool:

- Create admin SELECT policy on `prompt_events` using `has_role(auth.uid(), 'admin'::app_role)`
- Add indexes on `prompt_events(created_at)` and `prompt_events(user_id, created_at)`
- Add columns to `user_ideas`: `votes`, `roi_impact`, `category`, `submitter_name`, `submitter_department`
- Fix the `roi_impact` CHECK constraint to properly handle NULLs
- Add indexes on `user_ideas(status)` and `user_ideas(votes DESC)`

**Step 2** -- Update the migration file to match what was actually applied (fix the two bugs in the `.sql` file).

**Step 3** -- Update `useUserIdeas.ts` hook and the `UserIdea` interface to include the new columns (`votes`, `roi_impact`, `category`, `submitter_name`, `submitter_department`).

**Step 4** -- Update the C-Suite Reports component (`src/components/admin/CSuiteReports.tsx`) if it references these new columns, ensuring queries align with the updated schema.

### Technical Details

Corrected SQL to apply:

```sql
-- Admin policy for prompt_events
CREATE POLICY "Admins can view all prompt events"
  ON prompt_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes on prompt_events
CREATE INDEX IF NOT EXISTS idx_prompt_events_created_at ON prompt_events(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_events_user_created ON prompt_events(user_id, created_at);

-- Enhance user_ideas
ALTER TABLE user_ideas
  ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS roi_impact TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS submitter_name TEXT,
  ADD COLUMN IF NOT EXISTS submitter_department TEXT;

-- Constrain roi_impact values (allowing NULL since column is nullable)
ALTER TABLE user_ideas
  ADD CONSTRAINT chk_roi_impact
  CHECK (roi_impact IS NULL OR roi_impact IN ('high', 'medium', 'low'));

-- Indexes for ideas reporting
CREATE INDEX IF NOT EXISTS idx_user_ideas_status ON user_ideas(status);
CREATE INDEX IF NOT EXISTS idx_user_ideas_votes ON user_ideas(votes DESC);
```

