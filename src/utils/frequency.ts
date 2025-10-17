import { supabase } from "@/integrations/supabase/client";

const LOCAL_STORAGE_KEY = "cpap_custom_frequencies";

/**
 * Determines the default maintenance frequency in days based on part type label.
 */
export const getMaintenanceFrequencyDays = (partTypeLabel: string): number | null => {
  const lowerCaseLabel = partTypeLabel.toLowerCase();
  
  if (lowerCaseLabel.includes("filter")) {
    if (lowerCaseLabel.includes("disposable")) return 30;
    if (lowerCaseLabel.includes("reusable")) return 90;
    return 30; 
  }
  
  if (lowerCaseLabel.includes("tubing") || lowerCaseLabel.includes("hose")) {
    return 90;
  }
  
  if (lowerCaseLabel.includes("mask") || lowerCaseLabel.includes("cushion") || lowerCaseLabel.includes("pillow")) {
    return 30;
  }

  if (lowerCaseLabel.includes("chamber") || lowerCaseLabel.includes("tank")) {
    return 180;
  }

  if (lowerCaseLabel.includes("headgear") || lowerCaseLabel.includes("frame")) {
    return 180;
  }

  return null;
};

/**
 * Retrieves the custom frequency for a specific part from the database.
 * Falls back to local storage for migration purposes (will be removed later).
 */
export const getCustomFrequencyFromDB = async (machineLabel: string, partTypeLabel: string, partModelLabel: string): Promise<number | null> => {
  const uniqueKey = `${machineLabel}|${partTypeLabel}|${partModelLabel}`;
  
  // 1. Check Supabase
  const { data, error } = await supabase
    .from("custom_frequencies")
    .select("frequency_days")
    .eq("unique_part_key", uniqueKey)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no row found
    console.error("Error fetching custom frequency from DB:", error);
  }

  if (data) {
    return data.frequency_days;
  }

  // 2. Fallback: Check Local Storage (for migration/legacy data)
  try {
    const storedFrequencies = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedFrequencies) {
      const frequencies = JSON.parse(storedFrequencies);
      const customDays = frequencies[uniqueKey];
      if (customDays && Number(customDays) > 0) {
        // Optional: Log that we are using legacy data
        // console.warn("Using legacy custom frequency from local storage.");
        return Number(customDays);
      }
    }
  } catch (e) {
    console.error("Error reading custom frequency from local storage:", e);
  }
  
  return null;
};