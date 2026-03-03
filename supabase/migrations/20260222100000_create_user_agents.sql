-- Agent Studio: user_agents and agent_test_conversations tables
-- Supports Session 2 agent building, testing, and deployment

CREATE TABLE IF NOT EXISTS user_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Agent metadata
  name TEXT NOT NULL DEFAULT 'My Agent',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'testing', 'active', 'archived')),

  -- Structured template data (5 sections from Module 2-3)
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Assembled system prompt (generated from template_data)
  system_prompt TEXT NOT NULL DEFAULT '',

  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,
  parent_version_id UUID REFERENCES user_agents(id),

  -- Test results summary
  last_test_results JSONB,

  -- Deployment
  is_deployed BOOLEAN NOT NULL DEFAULT false,
  deployed_at TIMESTAMPTZ,

  -- Sharing
  is_shared BOOLEAN NOT NULL DEFAULT false,
  shared_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_agents_user ON user_agents(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_agents_deployed ON user_agents(user_id, is_deployed) WHERE is_deployed = true;
CREATE INDEX IF NOT EXISTS idx_user_agents_shared ON user_agents(is_shared) WHERE is_shared = true;

-- RLS
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own agents' AND tablename = 'user_agents') THEN
    EXECUTE 'CREATE POLICY "Users can view own agents" ON user_agents FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view shared agents' AND tablename = 'user_agents') THEN
    EXECUTE 'CREATE POLICY "Users can view shared agents" ON user_agents FOR SELECT USING (is_shared = true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own agents' AND tablename = 'user_agents') THEN
    EXECUTE 'CREATE POLICY "Users can insert own agents" ON user_agents FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own agents' AND tablename = 'user_agents') THEN
    EXECUTE 'CREATE POLICY "Users can update own agents" ON user_agents FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own agents' AND tablename = 'user_agents') THEN
    EXECUTE 'CREATE POLICY "Users can delete own agents" ON user_agents FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Admin read access (only if user_roles exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all agents' AND tablename = 'user_agents') THEN
      EXECUTE 'CREATE POLICY "Admins can view all agents" ON user_agents FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = ''admin''))';
    END IF;
  END IF;
END $$;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_user_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'user_agents_updated_at') THEN
    CREATE TRIGGER user_agents_updated_at
      BEFORE UPDATE ON user_agents
      FOR EACH ROW
      EXECUTE FUNCTION update_user_agents_updated_at();
  END IF;
END $$;

-- Agent test conversations
CREATE TABLE IF NOT EXISTS agent_test_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES user_agents(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL DEFAULT 'freeform'
    CHECK (test_type IN ('freeform', 'standard', 'edge', 'out_of_scope')),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  result TEXT CHECK (result IN ('pass', 'fail', 'inconclusive')),
  evaluation_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_test_conversations ON agent_test_conversations(agent_id, test_type);

ALTER TABLE agent_test_conversations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own test conversations' AND tablename = 'agent_test_conversations') THEN
    EXECUTE 'CREATE POLICY "Users can manage own test conversations" ON agent_test_conversations FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;
