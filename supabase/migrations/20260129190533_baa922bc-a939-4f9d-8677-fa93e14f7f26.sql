-- Create live_training_sessions table
CREATE TABLE public.live_training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_attendees INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_training_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view active sessions
CREATE POLICY "Users can view active live training sessions"
ON public.live_training_sessions
FOR SELECT
USING (is_active = true);

-- Admins can do anything
CREATE POLICY "Admins can manage live training sessions"
ON public.live_training_sessions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_live_training_sessions_updated_at
BEFORE UPDATE ON public.live_training_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();