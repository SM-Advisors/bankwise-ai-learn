-- ============================================================
-- Community Hub: Topics and Replies
-- Simple discussion forum for learners to share ideas and collaborate
-- ============================================================

-- community_topics: top-level discussion posts
CREATE TABLE IF NOT EXISTS community_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  reply_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_topics_recent ON community_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_topics_user ON community_topics(user_id);

-- community_replies: responses to topics
CREATE TABLE IF NOT EXISTS community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES community_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_replies_topic ON community_replies(topic_id, created_at ASC);

-- Enable RLS
ALTER TABLE community_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies for community_topics (idempotent)
-- ============================================================
DO $$
BEGIN
  -- Authenticated users can SELECT all topics
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view all community topics' AND tablename = 'community_topics') THEN
    EXECUTE 'CREATE POLICY "Authenticated users can view all community topics" ON community_topics FOR SELECT TO authenticated USING (true)';
  END IF;

  -- Users can INSERT own topics
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own community topics' AND tablename = 'community_topics') THEN
    EXECUTE 'CREATE POLICY "Users can insert own community topics" ON community_topics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;

  -- Users can UPDATE own topics
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own community topics' AND tablename = 'community_topics') THEN
    EXECUTE 'CREATE POLICY "Users can update own community topics" ON community_topics FOR UPDATE TO authenticated USING (auth.uid() = user_id)';
  END IF;

  -- Users can DELETE own topics
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own community topics' AND tablename = 'community_topics') THEN
    EXECUTE 'CREATE POLICY "Users can delete own community topics" ON community_topics FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Admin override for community_topics
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all community topics' AND tablename = 'community_topics') THEN
      EXECUTE 'CREATE POLICY "Admins can manage all community topics" ON community_topics FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = ''admin''))';
    END IF;
  END IF;
END $$;

-- ============================================================
-- RLS Policies for community_replies (idempotent)
-- ============================================================
DO $$
BEGIN
  -- Authenticated users can SELECT all replies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view all community replies' AND tablename = 'community_replies') THEN
    EXECUTE 'CREATE POLICY "Authenticated users can view all community replies" ON community_replies FOR SELECT TO authenticated USING (true)';
  END IF;

  -- Users can INSERT own replies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own community replies' AND tablename = 'community_replies') THEN
    EXECUTE 'CREATE POLICY "Users can insert own community replies" ON community_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;

  -- Users can UPDATE own replies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own community replies' AND tablename = 'community_replies') THEN
    EXECUTE 'CREATE POLICY "Users can update own community replies" ON community_replies FOR UPDATE TO authenticated USING (auth.uid() = user_id)';
  END IF;

  -- Users can DELETE own replies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own community replies' AND tablename = 'community_replies') THEN
    EXECUTE 'CREATE POLICY "Users can delete own community replies" ON community_replies FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Admin override for community_replies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all community replies' AND tablename = 'community_replies') THEN
      EXECUTE 'CREATE POLICY "Admins can manage all community replies" ON community_replies FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = ''admin''))';
    END IF;
  END IF;
END $$;

-- ============================================================
-- Trigger: auto-update reply_count on community_topics
-- ============================================================
CREATE OR REPLACE FUNCTION update_topic_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_topics SET reply_count = reply_count + 1, updated_at = now() WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_topics SET reply_count = reply_count - 1, updated_at = now() WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'community_replies_count_trigger') THEN
    CREATE TRIGGER community_replies_count_trigger
      AFTER INSERT OR DELETE ON community_replies
      FOR EACH ROW
      EXECUTE FUNCTION update_topic_reply_count();
  END IF;
END $$;
