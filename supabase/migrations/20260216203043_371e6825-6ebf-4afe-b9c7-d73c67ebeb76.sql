
-- Feature 1: Add employer_bank_name to user_profiles
ALTER TABLE user_profiles ADD COLUMN employer_bank_name TEXT;

-- Feature 3: Add tour_completed to user_profiles
ALTER TABLE user_profiles ADD COLUMN tour_completed BOOLEAN DEFAULT false;

-- Feature 4: Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  location TEXT,
  instructor TEXT,
  max_attendees INTEGER,
  is_active BOOLEAN DEFAULT true,
  live_session_id UUID REFERENCES live_training_sessions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active events"
  ON events FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));
