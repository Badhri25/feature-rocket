-- Add public SELECT policy for features table to support public embed script
-- Features are intentionally public when users choose to embed them on their websites
CREATE POLICY "Public users can view features for embed"
ON public.features
FOR SELECT
TO anon
USING (true);