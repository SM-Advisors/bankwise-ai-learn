-- AI User Preferences (custom instructions for Andrea)
CREATE TABLE ai_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tone TEXT DEFAULT 'professional',
  verbosity TEXT DEFAULT 'balanced',
  formatting_preference TEXT DEFAULT 'mixed',
  role_context TEXT,
  additional_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE ai_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source TEXT,
  context TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_memories_user_active ON ai_memories(user_id, is_active);

ALTER TABLE ai_user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own preferences" ON ai_user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON ai_user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON ai_user_preferences FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE ai_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own memories" ON ai_memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON ai_memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON ai_memories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON ai_memories FOR DELETE USING (auth.uid() = user_id);