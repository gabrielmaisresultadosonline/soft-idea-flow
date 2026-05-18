ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('pending', 'paid')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS attendance_status TEXT CHECK (attendance_status IN ('waiting', 'completed', 'missed')) DEFAULT 'waiting';

-- Update RLS if needed (already managed by admin service role mostly)
COMMENT ON COLUMN public.bookings.payment_status IS 'Status do pagamento do agendamento';
COMMENT ON COLUMN public.bookings.attendance_status IS 'Status do atendimento presencial/online';