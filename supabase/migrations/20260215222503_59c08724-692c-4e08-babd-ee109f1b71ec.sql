CREATE TABLE prompt_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id INTEGER,
  module_id TEXT,
  event_type TEXT NOT NULL,
  exception_flag BOOLEAN DEFAULT false,
  exception_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prompt_events_user ON prompt_events(user_id);
CREATE INDEX idx_prompt_events_exception ON prompt_events(exception_flag) WHERE exception_flag = true;

ALTER TABLE prompt_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own prompt events" ON prompt_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own prompt events" ON prompt_events FOR SELECT USING (auth.uid() = user_id);