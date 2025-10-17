import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "./toast";

/**
 * Decrements the quantity of a specific part in the user's inventory by 1.
 * 
 * @param machineLabel The label of the machine (e.g., "ResMed AirSense 11").
 * @param partTypeLabel The label of the part type (e.g., "Filter").
 * @param partModelLabel The label of the part model (e.g., "Standard Filter (30-day)").
 */
export async function decrementInventory(
  machineLabel: string,
  partTypeLabel: string,
  partModelLabel: string
): Promise<void> {
  
  // 1. Find the existing inventory item
  const { data: existingItems, error: fetchError } = await supabase
    .from("part_inventory")
    .select("id, quantity")
    .eq("machine_label", machineLabel)
    .eq("part_type_label", partTypeLabel)
    .eq("part_model_label", partModelLabel)
    .limit(1);

  if (fetchError) {
    console.error("Error fetching inventory item for decrement:", fetchError);
    showError("Failed to check inventory for part replacement.");
    return;
  }

  const item = existingItems?.[0];

  if (!item) {
    // This is not an error, as the user might not track this part in inventory
    console.log("Part not found in inventory, skipping decrement.");
    return;
  }

  if (item.quantity <= 0) {
    showError(`Inventory for ${partModelLabel} is already zero. Please restock.`);
    return;
  }

  // 2. Decrement the quantity
  const newQuantity = item.quantity - 1;

  const { error: updateError } = await supabase
    .from("part_inventory")
    .update({ quantity: newQuantity })
    .eq("id", item.id);

  if (updateError) {
    console.error("Error updating inventory quantity:", updateError);
    showError("Failed to update inventory quantity.");
  } else {
    showSuccess(`Inventory for ${partModelLabel} decremented. Remaining: ${newQuantity}`);
  }
}