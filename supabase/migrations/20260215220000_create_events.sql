-- Feature 4: Create events table for calendar of events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- 'live_training', 'office_hours', 'webinar', 'deadline', 'community_session'
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  location TEXT, -- URL or physical location
  instructor TEXT,
  max_attendees INTEGER,
  is_active BOOLEAN DEFAULT true,
  live_session_id UUID REFERENCES live_training_sessions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read active events
CREATE POLICY "Authenticated users can view active events"
  ON events FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Allow admins to manage events (using the has_role function)
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  TO authenticated
  USING (has_role('admin', auth.uid()));
