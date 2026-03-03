-- Practice Conversations: Persist chat history for practice sessions
-- Each conversation belongs to a user + module combo, with full message history

CREATE TABLE practice_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,          -- e.g. "1", "2", "3"
  module_id TEXT NOT NULL,           -- e.g. "1-1", "2-3"
  title TEXT NOT NULL DEFAULT 'New Conversation',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_submitted BOOLEAN NOT NULL DEFAULT false,  -- whether submitted for Andrea's review
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup: user's conversations for a specific module
CREATE INDEX idx_practice_conversations_user_module
  ON practice_conversations(user_id, session_id, module_id);

-- Index for ordering by most recent
CREATE INDEX idx_practice_conversations_updated
  ON practice_conversations(user_id, updated_at DESC);

-- RLS
ALTER TABLE practice_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own practice conversations"
  ON practice_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice conversations"
  ON practice_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own practice conversations"
  ON practice_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own practice conversations"
  ON practice_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Admin read access
CREATE POLICY "Admins can view all practice conversations"
  ON practice_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_practice_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER practice_conversations_updated_at
  BEFORE UPDATE ON practice_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_conversations_updated_at();
