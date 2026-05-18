-- Create doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    specialty TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Allow all for admin service role (standard)
CREATE POLICY "Admins can do everything on doctors" ON public.doctors FOR ALL USING (true);

-- Add doctor_id to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES public.doctors(id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_doctors_updated_at
BEFORE UPDATE ON public.doctors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();