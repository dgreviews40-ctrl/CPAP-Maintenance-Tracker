import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The `isSupabaseConfigured` check in the component will fail if the client isn't created.
// We'll create a dummy client if the env vars are missing to avoid crashing the app,
// but the component will show the "Not Configured" message.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);