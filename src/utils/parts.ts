export interface UniquePartKey {
  machineLabel: string;
  partTypeLabel: string;
  modelLabel: string;
}

/**
 * Parses a maintenance entry machine string (e.g., "Machine - Part Type - Part Model (SKU: XXX)")
 * into its constituent labels.
 */
export const parseMaintenanceMachineString = (machineString: string): UniquePartKey => {
  const parts = machineString.split(' - ');
  const machine = parts[0]?.trim() || machineString;
  const partType = parts[1]?.trim() || "";
  const partModelWithSku = parts[2]?.trim() || "";
  // Remove the SKU information (e.g., "(SKU: ResMed SKU 37301)")
  const partModel = partModelWithSku.replace(/\s*\(SKU:.*\)/, '').trim();
  return { machineLabel: machine, partTypeLabel: partType, modelLabel: partModel };
};

/**
 * Generates the URL-safe unique key used for part detail pages.
 */
export const generateUniqueKey = (machineLabel: string, partTypeLabel: string, modelLabel: string): string => {
  return `${machineLabel}|${partTypeLabel}|${modelLabel}`;
};