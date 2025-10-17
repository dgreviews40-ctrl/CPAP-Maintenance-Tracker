import { z } from "zod";

export const maintenanceEntrySchema = z.object({
  machine: z.string().min(1, { message: "Machine name is required." }),
  partType: z.string().min(1, { message: "Part type is required." }),
  partModel: z.string().min(1, { message: "Part model is required." }),
  last_maintenance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format (YYYY-MM-DD)." }),
  next_maintenance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Next maintenance date is required." }),
  notes: z.string().optional(),
  customFrequencyInput: z.union([
    z.number().int().positive().optional(),
    z.literal("").optional(),
  ]).transform(val => val === "" ? undefined : val),
});

export type MaintenanceEntryFormValues = z.infer<typeof maintenanceEntrySchema>;