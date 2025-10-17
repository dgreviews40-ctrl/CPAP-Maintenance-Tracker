"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MaintenanceEntry } from "./MaintenanceTracker";
import { MachineCombobox } from "./MachineCombobox";
import { PartCombobox } from "./PartCombobox";
import { ModelCombobox } from "./ModelCombobox";
import { cpapMachines } from "@/data/cpap-machines";
import { addDays, format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { maintenanceEntrySchema, MaintenanceEntryFormValues } from "@/lib/validation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { showError } from "@/utils/toast";
import { decrementInventory } from "@/utils/inventory"; // Import the new utility

interface Part {
  value: string;
  label: string;
  models: { value: string; label: string; reorder_info: string }[];
}

interface MaintenanceFormProps {
  onAddEntry: (entry: Omit<MaintenanceEntry, 'id' | 'created_at'>) => Promise<boolean>;
}

// --- Frequency Helpers (Must match PartManagement.tsx) ---
const LOCAL_STORAGE_KEY = "cpap_custom_frequencies";

// Helper function to determine maintenance frequency in days
const getMaintenanceFrequencyDays = (partTypeLabel: string): number | null => {
  const lowerCaseLabel = partTypeLabel.toLowerCase();
  
  if (lowerCaseLabel.includes("filter")) {
    // Differentiate between disposable (30 days) and reusable (90 days)
    if (lowerCaseLabel.includes("disposable")) return 30;
    if (lowerCaseLabel.includes("reusable")) return 90;
    // Default filter replacement is often monthly
    return 30; 
  }
  
  if (lowerCaseLabel.includes("tubing") || lowerCaseLabel.includes("hose")) {
    return 90; // Every 3 months
  }
  
  if (lowerCaseLabel.includes("mask") || lowerCaseLabel.includes("cushion") || lowerCaseLabel.includes("pillow")) {
    return 30; // Monthly replacement for mask components
  }

  if (lowerCaseLabel.includes("chamber") || lowerCaseLabel.includes("tank")) {
    return 180; // Every 6 months
  }

  if (lowerCaseLabel.includes("headgear") || lowerCaseLabel.includes("frame")) {
    return 180; // Every 6 months
  }

  // If no specific match, return null
  return null;
};

// Helper to get custom frequency from local storage
const getCustomFrequency = (machineLabel: string, partTypeLabel: string, partModelLabel: string): number | null => {
  try {
    const storedFrequencies = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedFrequencies) {
      const frequencies = JSON.parse(storedFrequencies);
      const uniqueKey = `${machineLabel}|${partTypeLabel}|${partModelLabel}`;
      const customDays = frequencies[uniqueKey];
      if (customDays && Number(customDays) > 0) {
        return Number(customDays);
      }
    }
  } catch (e) {
    console.error("Error reading custom frequency from local storage:", e);
  }
  return null;
};
// --- End Frequency Helpers ---


const MaintenanceForm = ({ onAddEntry }: MaintenanceFormProps) => {
  const form = useForm<MaintenanceEntryFormValues>({
    resolver: zodResolver(maintenanceEntrySchema),
    defaultValues: {
      machine: "",
      partType: "",
      partModel: "",
      last_maintenance: format(new Date(), 'yyyy-MM-dd'),
      next_maintenance: "",
      notes: "",
      customFrequencyInput: undefined,
    },
  });

  const { watch, setValue, formState: { isSubmitting, errors } } = form;
  
  const machine = watch("machine");
  const partType = watch("partType");
  const partModel = watch("partModel");
  const lastMaintenance = watch("last_maintenance");
  const customFrequencyInput = watch("customFrequencyInput");

  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [availableModels, setAvailableModels] = useState<{ value: string; label: string; reorder_info: string }[]>([]);

  // Determine the base frequency (default or custom from Part Management)
  const defaultFrequency = getMaintenanceFrequencyDays(partType);
  const customFrequencyFromStorage = getCustomFrequency(machine, partType, partModel);
  
  // Calculate the effective frequency (custom input overrides storage, which overrides default)
  const effectiveFrequencyDays = customFrequencyInput 
    ? Number(customFrequencyInput) 
    : (customFrequencyFromStorage || defaultFrequency);

  // Effect to update available parts/models when machine/partType changes
  useEffect(() => {
    const machineData = cpapMachines.find(m => m.label === machine);
    
    if (machineData) {
      setAvailableParts(machineData.parts as Part[]);
      const selectedPart = machineData.parts.find(p => p.label === partType);
      if (selectedPart && selectedPart.models) {
        setAvailableModels(selectedPart.models);
      } else {
        setAvailableModels([]);
      }
    } else {
      setAvailableParts([]);
      setAvailableModels([]);
    }
    
    // Reset part model if the selected part type is no longer valid for the machine
    if (machine && partType && !availableParts.find(p => p.label === partType)) {
      setValue("partType", "");
      setValue("partModel", "");
    }
    
    // Reset part model if the selected model is no longer valid for the part type
    if (partType && partModel && !availableModels.find(m => m.label === partModel)) {
      setValue("partModel", "");
    }
    
  }, [machine, partType, setValue]);


  // Effect to calculate next maintenance date automatically
  useEffect(() => {
    if (lastMaintenance && effectiveFrequencyDays !== null && effectiveFrequencyDays > 0) {
      // Use Date object from the input string (handle potential timezone issues by replacing hyphens)
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
    if (values.customFrequencyInput) {
      finalNotes += ` [Form Custom Frequency: ${values.customFrequencyInput} days]`;
    } else if (customFrequencyFromStorage) {
      finalNotes += ` [Part Management Custom Frequency: ${customFrequencyFromStorage} days]`;
    } else if (defaultFrequency) {
      finalNotes += ` [Default Frequency: ${defaultFrequency} days]`;
    }

    const success = await onAddEntry({
      machine: `${values.machine} - ${values.partType} - ${values.partModel}${reorderInfo}`,
      last_maintenance: values.last_maintenance,
      next_maintenance: values.next_maintenance,
      notes: finalNotes,
    });

    if (success) {
      // Decrement inventory for the replaced part
      await decrementInventory(values.machine, values.partType, values.partModel);
      
      // Reset form, keeping lastMaintenance defaulted to today for convenience
      form.reset({
        machine: "",
        partType: "",
        partModel: "",
        last_maintenance: format(new Date(), 'yyyy-MM-dd'),
        next_maintenance: "",
        notes: "",
        customFrequencyInput: undefined,
      });
    }
  };

  const placeholderFrequency = customFrequencyFromStorage 
    ? `Custom: ${customFrequencyFromStorage} days` 
    : (defaultFrequency ? `Default: ${defaultFrequency} days` : "Enter days (optional)");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-8 p-4 border rounded-lg">
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Entry"}
        </Button>
      </form>
    </Form>
  );
};

export default MaintenanceForm;