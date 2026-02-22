-- ============================================================
-- Community Hub: Add review queue status
-- ============================================================

-- Add status column (pending by default — all new posts need admin approval)
ALTER TABLE community_topics
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add missing columns referenced in TypeScript interface
ALTER TABLE community_topics
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'discussion',
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS linked_content_id UUID,
  ADD COLUMN IF NOT EXISTS linked_content_type TEXT;

-- Bulk-approve all existing topics (they were visible before this migration)
UPDATE community_topics
  SET status = 'approved'
  WHERE status = 'pending' AND created_at < now();

-- Drop the permissive public SELECT policy and replace with status-filtered one
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Authenticated users can view all community topics'
    AND tablename = 'community_topics'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can view all community topics" ON community_topics';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users see approved topics or own pending topics'
    AND tablename = 'community_topics'
  ) THEN
    EXECUTE 'CREATE POLICY "Users see approved topics or own pending topics"
      ON community_topics FOR SELECT TO authenticated
      USING (status = ''approved'' OR user_id = auth.uid())';
  END IF;
END $$;
