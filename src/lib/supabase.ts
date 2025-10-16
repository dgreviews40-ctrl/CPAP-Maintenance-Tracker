import { createClient } from "@supabase/supabase-js";

// Using direct credentials as a temporary measure since env vars are not loading.
const supabaseUrl = "https://ixzksyogrrzqzsqbsrtw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4emtzeW9ncnJ6cXpzcWJzcnR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2Mjc0NDksImV4cCI6MjA3NjIwMzQ0OX0.mqNrdcwgg8nMpgDLJjqDGOWL_vO4SngZ7IIs8LbOhls";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This will no longer be needed, but we'll keep it for now to avoid breaking other imports.
export const isSupabaseConfigured = true;