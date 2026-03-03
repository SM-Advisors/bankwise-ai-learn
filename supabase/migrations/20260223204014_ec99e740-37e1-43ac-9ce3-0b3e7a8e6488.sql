
CREATE TABLE public.dashboard_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dashboard_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dashboard conversations"
  ON public.dashboard_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dashboard conversations"
  ON public.dashboard_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dashboard conversations"
  ON public.dashboard_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dashboard conversations"
  ON public.dashboard_conversations FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_dashboard_conversations_updated_at
  BEFORE UPDATE ON public.dashboard_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
