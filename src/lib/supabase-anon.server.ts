// Server-side anonymous Supabase client (uses publishable key, respects RLS).
// Use for public operations like inserting bookings or tracking visits.
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

function createAnon() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY');
  }
  return createClient<Database>(url, key, {
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
