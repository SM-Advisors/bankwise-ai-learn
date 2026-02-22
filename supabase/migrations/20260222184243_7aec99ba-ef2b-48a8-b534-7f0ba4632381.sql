
CREATE TABLE public.community_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  author_name text NOT NULL,
  author_role text,
  title text NOT NULL,
  body text NOT NULL,
  reply_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.community_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view topics"
  ON public.community_topics FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create topics"
  ON public.community_topics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own topics"
  ON public.community_topics FOR DELETE
  USING (auth.uid() = user_id);

-- Also create community_replies table
CREATE TABLE public.community_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.community_topics(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  author_name text NOT NULL,
  author_role text,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view replies"
  ON public.community_replies FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create replies"
  ON public.community_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies"
  ON public.community_replies FOR DELETE
  USING (auth.uid() = user_id);
