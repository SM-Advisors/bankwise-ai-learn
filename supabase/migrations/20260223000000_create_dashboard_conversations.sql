-- Dashboard Conversations: Persist chat history for the dashboard Andrea coach
-- Each conversation belongs to a user, with full message history

CREATE TABLE IF NOT EXISTS dashboard_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup: user's conversations ordered by most recent
CREATE INDEX IF NOT EXISTS idx_dashboard_conversations_user
  ON dashboard_conversations(user_id, updated_at DESC);

-- RLS
ALTER TABLE dashboard_conversations ENABLE ROW LEVEL SECURITY;

-- User CRUD policies (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own dashboard conversations' AND tablename = 'dashboard_conversations') THEN
    EXECUTE 'CREATE POLICY "Users can view own dashboard conversations" ON dashboard_conversations FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own dashboard conversations' AND tablename = 'dashboard_conversations') THEN
    EXECUTE 'CREATE POLICY "Users can insert own dashboard conversations" ON dashboard_conversations FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own dashboard conversations' AND tablename = 'dashboard_conversations') THEN
    EXECUTE 'CREATE POLICY "Users can update own dashboard conversations" ON dashboard_conversations FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own dashboard conversations' AND tablename = 'dashboard_conversations') THEN
    EXECUTE 'CREATE POLICY "Users can delete own dashboard conversations" ON dashboard_conversations FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Admin read access (only if user_roles exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all dashboard conversations' AND tablename = 'dashboard_conversations') THEN
      EXECUTE 'CREATE POLICY "Admins can view all dashboard conversations" ON dashboard_conversations FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = ''admin''))';
    END IF;
  END IF;
END $$;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_dashboard_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'dashboard_conversations_updated_at') THEN
    CREATE TRIGGER dashboard_conversations_updated_at
      BEFORE UPDATE ON dashboard_conversations
      FOR EACH ROW
      EXECUTE FUNCTION update_dashboard_conversations_updated_at();
  END IF;
END $$;
