import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a custom part (defined by its labels) is currently referenced 
 * in maintenance entries or part inventory.
 * 
 * @param machineLabel 
 * @param partTypeLabel 
 * @param partModelLabel 
 * @returns true if references exist, false otherwise.
 */
export async function isCustomPartReferenced(
  machineLabel: string,
  partTypeLabel: string,
  partModelLabel: string
): Promise<boolean> {
  
  // 1. Check Maintenance Entries
  // The 'machine' column stores the full string: "Machine Label - Part Type Label - Part Model Label (SKU: XXX)"
  const fullPartStringPrefix = `${machineLabel} - ${partTypeLabel} - ${partModelLabel}`;
  
  const { count: maintenanceCount, error: maintenanceError } = await supabase
    .from("maintenance_entries")
    .select("id", { count: 'exact', head: true })
    .ilike("machine", `${fullPartStringPrefix}%`);

  if (maintenanceError) {
    console.error("Error checking maintenance references:", maintenanceError);
    throw new Error("Failed to check maintenance references.");
  }
  
  if (maintenanceCount && maintenanceCount > 0) {
    return true;
  }

  // 2. Check Part Inventory
  const { count: inventoryCount, error: inventoryError } = await supabase
    .from("part_inventory")
    .select("id", { count: 'exact', head: true })
    .eq("machine_label", machineLabel)
    .eq("part_type_label", partTypeLabel)
    .eq("part_model_label", partModelLabel);

  if (inventoryError) {
    console.error("Error checking inventory references:", inventoryError);
    throw new Error("Failed to check inventory references.");
  }

  if (inventoryCount && inventoryCount > 0) {
    return true;
  }

  return false;
}