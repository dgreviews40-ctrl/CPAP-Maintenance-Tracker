import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "./toast";

const TABLES_TO_BACKUP = [
  "maintenance_entries",
  "part_inventory",
  "custom_frequencies",
  "user_machines",
  "profiles",
];

/**
 * Fetches all user-specific data from tracked tables and returns it as a JSON object.
 */
export async function backupUserData(userId: string): Promise<Record<string, any[]> | null> {
  const backup: Record<string, any[]> = {};
  let success = true;

  for (const table of TABLES_TO_BACKUP) {
    // Note: RLS policies ensure users only see their own data (except for 'profiles' which uses 'id' instead of 'user_id')
    const column = table === 'profiles' ? 'id' : 'user_id';
    
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq(column, userId);

    if (error) {
      console.error(`Error backing up table ${table}:`, error);
      showError(`Failed to backup data from ${table}.`);
      success = false;
      break;
    }
    backup[table] = data || [];
  }

  return success ? backup : null;
}

/**
 * Deletes all user-specific data from application tables.
 */
export async function resetAllUserData(userId: string): Promise<boolean> {
  // Tables to reset (excluding 'profiles' as we only delete the user's profile row, not the auth user)
  const TABLES_TO_RESET = [
    "maintenance_entries",
    "part_inventory",
    "custom_frequencies",
    "user_machines",
    "profiles", // Include profiles for deletion
  ];

  let success = true;

  for (const table of TABLES_TO_RESET) {
    const column = table === 'profiles' ? 'id' : 'user_id';
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq(column, userId);

    if (error) {
      console.error(`Error resetting table ${table}:`, error);
      showError(`Failed to reset data in ${table}.`);
      success = false;
      break;
    }
  }

  return success;
}