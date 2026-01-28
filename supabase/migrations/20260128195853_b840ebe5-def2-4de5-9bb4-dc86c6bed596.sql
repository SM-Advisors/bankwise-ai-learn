-- Create enum for line of business
CREATE TYPE public.line_of_business AS ENUM ('accounting_finance', 'credit_administration', 'executive_leadership');

-- Create enum for learning styles
CREATE TYPE public.learning_style_type AS ENUM ('example-based', 'explanation-based', 'hands-on', 'logic-based');

-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  line_of_business line_of_business,
  bank_role TEXT,
  learning_style learning_style_type,
  tech_learning_style learning_style_type,
  ai_proficiency_level INTEGER CHECK (ai_proficiency_level >= 0 AND ai_proficiency_level <= 8),
  onboarding_completed BOOLEAN DEFAULT false,
  current_session INTEGER DEFAULT 1 CHECK (current_session >= 1 AND current_session <= 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create training progress table
CREATE TABLE public.training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  session_1_completed BOOLEAN DEFAULT false,
  session_1_progress JSONB DEFAULT '{}',
  session_2_completed BOOLEAN DEFAULT false,
  session_2_progress JSONB DEFAULT '{}',
  session_3_completed BOOLEAN DEFAULT false,
  session_3_progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
ON public.user_profiles FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for training_progress
CREATE POLICY "Users can view their own progress"
ON public.training_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
ON public.training_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.training_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
ON public.training_progress FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_progress_updated_at
BEFORE UPDATE ON public.training_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();