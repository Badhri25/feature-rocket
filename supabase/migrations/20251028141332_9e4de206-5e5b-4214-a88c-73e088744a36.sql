-- Create features table
CREATE TABLE public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('fix', 'update', 'new')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  impressions INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

-- Users can view their own features
CREATE POLICY "Users can view their own features"
  ON public.features
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own features
CREATE POLICY "Users can create their own features"
  ON public.features
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own features
CREATE POLICY "Users can update their own features"
  ON public.features
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own features
CREATE POLICY "Users can delete their own features"
  ON public.features
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_features_user_id ON public.features(user_id);
CREATE INDEX idx_features_created_at ON public.features(created_at DESC);