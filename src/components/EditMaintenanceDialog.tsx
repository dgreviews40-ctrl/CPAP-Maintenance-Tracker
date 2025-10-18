"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MaintenanceEntry } from "./MaintenanceTracker";
import { MachineCombobox } from "./MachineCombobox";
import { PartCombobox } from "./PartCombobox";
import { ModelCombobox } from "./ModelCombobox";
import { addDays, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Wrench } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { maintenanceEntrySchema, MaintenanceEntryFormValues } from "@/lib/validation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { showError } from "@/utils/toast";
import { getMaintenanceFrequencyDays, getCustomFrequencyFromDB } from "@/utils/frequency";
import { useAllMachines } from "@/hooks/use-all-machines"; // Import the new hook

interface Part {
  value: string;
  label: string;
  models: { value: string; label: string; reorder_info: string }[];
}

interface EditMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: MaintenanceEntry;
  onUpdate: (id: string, entry: Omit<MaintenanceEntry, 'id' | 'created_at'>) => Promise<boolean>;
}

// Helper to parse the machine string back into its components
const parseMachineString = (machineString: string) => {
  // Expected format: "Machine Label - Part Type Label - Part Model Label (SKU: XXX)"
  const parts = machineString.split(' - ');
  
  if (parts.length < 3) {
    // Fallback for older/malformed entries
    return { machine: machineString, partType: "", partModel: "" };
  }

  const machine = parts[0].trim();
  const partType = parts[1].trim();
  
  // Remove SKU info from part model
  const partModelWithSku = parts[2].trim();
  const partModel = partModelWithSku.replace(/\s*\(SKU:.*\)/, '').trim();

  return { machine, partType, partModel };
};


const EditMaintenanceDialog = ({ open, onOpenChange, entry, onUpdate }: EditMaintenanceDialogProps) => {
  const { allMachines } = useAllMachines(); // Use the new hook
  const initialParsed = useMemo(() => parseMachineString(entry.machine), [entry.machine]);
  const [customFrequencyFromDB, setCustomFrequencyFromDB] = useState<number | null>(null);


  const form = useForm<MaintenanceEntryFormValues>({
    resolver: zodResolver(maintenanceEntrySchema),
    defaultValues: {
      machine: initialParsed.machine,
      partType: initialParsed.partType,
      partModel: initialParsed.partModel,
      last_maintenance: entry.last_maintenance,
      next_maintenance: entry.next_maintenance,
      notes: entry.notes || "",
      customFrequencyInput: undefined, // Always reset custom input on dialog open
    },
  });

  const { watch, setValue, reset, formState: { isSubmitting } } = form;

  const machine = watch("machine");
  const partType = watch("partType");
  const partModel = watch("partModel");
  const lastMaintenance = watch("last_maintenance");
  const customFrequencyInput = watch("customFrequencyInput");

  // Derived state for combobox options
  const machineData = allMachines.find(m => m.label === machine); // Use allMachines
  const availableParts: Part[] = machineData?.parts || [];
  const selectedPart = availableParts.find(p => p.label === partType);
  const availableModels = selectedPart?.models || [];
  const selectedModel = availableModels.find(m => m.label === partModel);

  // Determine the base frequency (default or custom from DB/Part Management)
  const defaultFrequency = getMaintenanceFrequencyDays(partType);
  
  // Calculate the effective frequency (custom input overrides DB, which overrides default)
  const effectiveFrequencyDays = customFrequencyInput 
    ? Number(customFrequencyInput) 
    : (customFrequencyFromDB || defaultFrequency);

  // Effect to reset state when a new entry is passed (e.g., dialog opens for a different entry)
  useEffect(() => {
    const newParsed = parseMachineString(entry.machine);
    reset({
      machine: newParsed.machine,
      partType: newParsed.partType,
      partModel: newParsed.partModel,
      last_maintenance: entry.last_maintenance,
      next_maintenance: entry.next_maintenance,
      notes: entry.notes || "",
      customFrequencyInput: undefined,
    });
  }, [entry, reset]);
  
  // Effect to fetch custom frequency from DB when machine/partType/partModel changes
  useEffect(() => {
    if (machine && partType && partModel) {
      getCustomFrequencyFromDB(machine, partType, partModel).then(setCustomFrequencyFromDB);
    } else {
      setCustomFrequencyFromDB(null);
    }
  }, [machine, partType, partModel]);


  // Effect to calculate next maintenance date automatically
  useEffect(() => {
    if (lastMaintenance && effectiveFrequencyDays !== null && effectiveFrequencyDays > 0) {
      const lastDate = new Date(lastMaintenance.replace(/-/g, "/"));
      const nextDate = addDays(lastDate, effectiveFrequencyDays);
      setValue("next_maintenance", format(nextDate, 'yyyy-MM-dd'), { shouldValidate: true });
    } else if (lastMaintenance) {
      // If last maintenance is set but frequency is unknown/invalid, clear next maintenance
      setValue("next_maintenance", "");
    }
  }, [lastMaintenance, effectiveFrequencyDays, setValue]);


  const onSubmit = async (values: MaintenanceEntryFormValues) => {
    const selectedModel = availableModels.find(m => m.label === values.partModel);
    const reorderInfo = selectedModel ? ` (SKU: ${selectedModel.reorder_info})` : '';
    
    let finalNotes = values.notes || "";
    // Append frequency info to notes if it's not already there or if it changed
    if (values.customFrequencyInput) {
      finalNotes += ` [Form Custom Frequency: ${values.customFrequencyInput} days]`;
    } else if (customFrequencyFromDB) {
      finalNotes += ` [Part Management Custom Frequency: ${customFrequencyFromDB} days]`;
    } else if (defaultFrequency) {
      finalNotes += ` [Default Frequency: ${defaultFrequency} days]`;
    }

    const success = await onUpdate(entry.id, {
      machine: `${values.machine} - ${values.partType} - ${values.partModel}${reorderInfo}`,
      last_maintenance: values.last_maintenance,
      next_maintenance: values.next_maintenance,
      notes: finalNotes,
    });

    if (success) {
      onOpenChange(false);
    }
  };

  const placeholderFrequency = customFrequencyFromDB 
    ? `Custom: ${customFrequencyFromDB} days` 
    : (defaultFrequency ? `Default: ${defaultFrequency} days` : "Enter days (optional)");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2" /> Edit Maintenance Entry
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Machine Name */}
              <FormField
                control={form.control}
                name="machine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine Name</FormLabel>
                    <FormControl>
                      <MachineCombobox 
                        value={field.value} 
                        onChange={(value) => {
                          field.onChange(value);
                          setValue("partType", "");
                          setValue("partModel", "");
                          setValue("customFrequencyInput", undefined);
                        }} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Part Type */}
              <FormField
                control={form.control}
                name="partType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Type</FormLabel>
                    <FormControl>
                      <PartCombobox 
                        value={field.value} 
                        onChange={(value) => {
                          field.onChange(value);
                          setValue("partModel", "");
                          setValue("customFrequencyInput", undefined);
                        }} 
                        parts={availableParts} 
                        disabled={!machine} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Part Model */}
              <FormField
                control={form.control}
                name="partModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Model</FormLabel>
                    <FormControl>
                      <ModelCombobox 
                        value={field.value} 
                        onChange={(value) => {
                          field.onChange(value);
                          setValue("customFrequencyInput", undefined);
                        }} 
                        models={availableModels} 
                        disabled={!partType || availableModels.length === 0} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Last Maintenance Date */}
              <FormField
                control={form.control}
                name="last_maintenance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Maintenance Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Custom Frequency (Days) */}
              <FormField
                control={form.control}
                name="customFrequencyInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Frequency (Days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={placeholderFrequency}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? Number(value) : "");
                        }}
                        min="1"
                      />
                    </FormControl>
                    {effectiveFrequencyDays !== null && effectiveFrequencyDays > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Using frequency: {effectiveFrequencyDays} days.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Next Maintenance Date (Read-only/Calculated) */}
              <FormField
                control={form.control}
                name="next_maintenance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Maintenance Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        // Disable manual input since it's calculated
                        disabled={true}
                        className={field.value ? "bg-muted/50" : ""}
                      />
                    </FormControl>
                    {field.value && effectiveFrequencyDays !== null && effectiveFrequencyDays > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Calculated based on {effectiveFrequencyDays} days.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes about the maintenance"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMaintenanceDialog;