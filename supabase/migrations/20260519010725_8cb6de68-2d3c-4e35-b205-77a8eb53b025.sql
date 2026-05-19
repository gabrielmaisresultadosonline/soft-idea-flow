-- Fix doctors policy to actually check admin role
DROP POLICY IF EXISTS "Admins can do everything on doctors" ON public.doctors;

CREATE POLICY "Anyone can view doctors"
ON public.doctors FOR SELECT
USING (true);

CREATE POLICY "Admins can insert doctors"
ON public.doctors FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update doctors"
ON public.doctors FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete doctors"
ON public.doctors FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tighten site_visits view policy to admins only
DROP POLICY IF EXISTS "Admins can view visits" ON public.site_visits;
CREATE POLICY "Admins can view visits"
ON public.site_visits FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete bookings (used by clearBookings)
CREATE POLICY "Admins can delete bookings"
ON public.bookings FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));