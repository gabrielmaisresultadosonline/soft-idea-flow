-- Permitir que qualquer pessoa (incluindo o sistema de agendamento) leia as configurações
CREATE POLICY "Anyone can view app settings"
ON public.app_settings
FOR SELECT
USING (true);
