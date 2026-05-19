// Server-side anonymous Supabase client (uses publishable key, respects RLS).
// Use for public operations like inserting bookings or tracking visits.
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Fallback hardcoded values for VPS environment where process.env might be missing
const SUPABASE_URL = process.env.SUPABASE_URL || "https://vpcretcjpfaizrcmwslp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwY3JldGNqcGZhaXpyY213c2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTQyODAsImV4cCI6MjA5NDY5MDI4MH0.v3j8zcyNHYdto0rH81YSjmLmiyO9-cuAnyIUNnkZxYQ";

function createAnon() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error("[Supabase] ERRO: Faltam URL ou KEY de conexão.");
    throw new Error('Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY');
  }
  
  console.log("[Supabase] Inicializando cliente Anon para a URL:", SUPABASE_URL);
  
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

let _client: ReturnType<typeof createAnon> | undefined;
export const supabaseAnon = new Proxy({} as ReturnType<typeof createAnon>, {
  get(_, prop, receiver) {
    if (!_client) _client = createAnon();
    return Reflect.get(_client, prop, receiver);
  },
});
