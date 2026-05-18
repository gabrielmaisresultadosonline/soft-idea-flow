-- Create a table for site visits tracking
CREATE TABLE IF NOT EXISTS public.site_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Allow public to insert visits (needed for tracking)
CREATE POLICY "Anyone can insert visits" 
ON public.site_visits 
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated users to view visits (for the admin dashboard)
CREATE POLICY "Admins can view visits" 
ON public.site_visits 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Index for faster analytics queries
CREATE INDEX idx_site_visits_created_at ON public.site_visits(created_at);
CREATE INDEX idx_site_visits_path ON public.site_visits(path);