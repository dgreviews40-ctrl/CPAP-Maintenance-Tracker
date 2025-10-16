import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // This will log to the browser console, which is helpful.
  console.error(
    "Supabase credentials are not available. Please check your environment variables.",
  );
}

// A flag to easily check if the client is available.
export const isSupabaseConfigured = !!supabase;

export { supabase };