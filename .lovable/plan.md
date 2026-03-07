

## Updates from Document — Implementation Plan

Based on the uploaded doc, here are the **6 changes** requested:

---

### 1. NavRail should default to expanded on desktop
**File:** `src/components/shell/AppShell.tsx`
- Change `useState(false)` → `useState(true)` for `navExpanded` (line 37).
- Mobile is unaffected (already renders as bottom bar).

---

### 2. Dashboard main pane: limit width to ~60%, center vertically
**File:** `src/pages/Dashboard.tsx`
- The content wrapper currently uses `max-w-5xl`. Change to `max-w-[60%]` on desktop (keep full-width on mobile).
- Add vertical centering: wrap the content area in a flex container with `items-center justify-center min-h-full` so Andrea + session card sit in the middle of the viewport, not pinned to the top.

---

### 3. Admin Dashboard: Andrea as expand/collapse right pane (not floating bubble)
**Files:** `src/pages/AdminDashboard.tsx`, `src/components/admin/AdminAndreaFloat.tsx`
- Remove the floating `AdminAndreaFloat` bubble.
- Add a collapsible right pane (similar to a sidebar) that hosts `CSuiteAdvisorPanel`.
- Default state: expanded. When collapsed, main content fills the space. Use a toggle button (chevron) to expand/collapse.

---

### 4. Admin Andrea: persistent conversation history + new chat button
**File:** `src/components/admin/CSuiteAdvisorPanel.tsx`
- Store conversation history in the database (new table or existing `dashboard_conversations`).
- Add a "New Chat" button that clears the current thread and starts fresh.
- Load previous conversation on mount so it persists across page navigations.

---

### 5. Admin Andrea: stop generation + summarize & save to "Notes" tab
**Files:** `src/components/admin/CSuiteAdvisorPanel.tsx`, `src/pages/AdminDashboard.tsx`
- Add a "Stop" button visible while Andrea is responding (abort the edge function stream).
- Add a "Summarize" button that asks Andrea to produce a 2-3 sentence summary of the current conversation.
- Add a new **"Notes"** tab next to the existing "Config" tab in the admin view. Summaries are saved there as timestamped entries.
- This requires a small database table (e.g., `admin_andrea_notes`) to persist the notes.

---

### 6. Admin header: center the module status/tracking metrics
**File:** `src/components/admin/ExecutiveOverview.tsx` (or whichever component renders the top KPI cards)
- Center-align the session completion funnel / module status row in the admin overview header.

---

### Database Changes
- New table `admin_andrea_notes` (id, user_id, organization_id, summary, created_at) with RLS for authenticated users on their own rows.
- Possibly leverage existing `dashboard_conversations` table for Andrea chat persistence, or add an `admin_conversations` table if the schema differs.

### Order of Implementation
1. NavRail default expanded (quick)
2. Dashboard width + vertical centering (quick)
3. Admin Andrea right-pane refactor (medium)
4. Persistent conversation + new chat (medium)
5. Stop generation + summarize/notes tab (medium)
6. Admin header centering (quick)

