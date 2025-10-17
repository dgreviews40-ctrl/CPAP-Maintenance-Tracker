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
import { cpapMachines } from "@/data/cpap-machines";
import { addDays, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Wrench } from "lucide-react";

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

// --- Frequency Helpers (Must match MaintenanceForm.tsx and PartManagement.tsx) ---
const LOCAL_STORAGE_KEY = "cpap_custom_frequencies";

const getMaintenanceFrequencyDays = (partTypeLabel: string): number | null => {
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
  const initialParsed = useMemo(() => parseMachineString(entry.machine), [entry.machine]);

  const [machine, setMachine] = useState(initialParsed.machine);
  const [partType, setPartType] = useState(initialParsed.partType);
  const [partModel, setPartModel] = useState(initialParsed.partModel);
  const [lastMaintenance, setLastMaintenance] = useState(entry.last_maintenance);
  const [customFrequencyInput, setCustomFrequencyInput] = useState<number | string>("");
  const [nextMaintenance, setNextMaintenance] = useState(entry.next_maintenance);
  const [notes, setNotes] = useState(entry.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived state for combobox options
  const machineData = cpapMachines.find(m => m.label === machine);
  const availableParts: Part[] = machineData?.parts || [];
  const selectedPart = availableParts.find(p => p.label === partType);
  const availableModels = selectedPart?.models || [];
  const selectedModel = availableModels.find(m => m.label === partModel);

  // Determine the base frequency (default or custom from Part Management)
  const defaultFrequency = getMaintenanceFrequencyDays(partType);
  const customFrequencyFromStorage = getCustomFrequency(machine, partType, partModel);
  
  // Calculate the effective frequency (custom input overrides storage, which overrides default)
  const effectiveFrequencyDays = customFrequencyInput 
    ? Number(customFrequencyInput) 
    : (customFrequencyFromStorage || defaultFrequency);

  // Effect to reset state when a new entry is passed (e.g., dialog opens for a different entry)
  useEffect(() => {
    const newParsed = parseMachineString(entry.machine);
    setMachine(newParsed.machine);
    setPartType(newParsed.partType);
    setPartModel(newParsed.partModel);
    setLastMaintenance(entry.last_maintenance);
    setNextMaintenance(entry.next_maintenance);
    setNotes(entry.notes || "");
    setCustomFrequencyInput(""); // Always reset custom input on dialog open
  }, [entry]);


  // Effect to calculate next maintenance date automatically
  useEffect(() => {
    if (lastMaintenance && effectiveFrequencyDays !== null && effectiveFrequencyDays > 0) {
      const lastDate = new Date(lastMaintenance.replace(/-/g, "/"));
      const nextDate = addDays(lastDate, effectiveFrequencyDays);
      setNextMaintenance(format(nextDate, 'yyyy-MM-dd'));
    } else if (lastMaintenance) {
      // If last maintenance is set but frequency is unknown/invalid, clear next maintenance
      setNextMaintenance("");
    }
  }, [lastMaintenance, partType, partModel, customFrequencyInput, effectiveFrequencyDays, machine, customFrequencyFromStorage]);


  const handleMachineChange = (selectedLabel: string) => {
    setMachine(selectedLabel);
    // Reset dependent fields if machine changes
    setPartType("");
    setPartModel("");
    setCustomFrequencyInput("");
  };

  const handlePartTypeChange = (selectedLabel: string) => {
    setPartType(selectedLabel);
    // Reset dependent fields if part type changes
    setPartModel("");
    setCustomFrequencyInput("");
  };

  const handlePartModelChange = (selectedLabel: string) => {
    setPartModel(selectedLabel);
    setCustomFrequencyInput("");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine || !partType || !partModel || !lastMaintenance || !nextMaintenance) {
      alert("Please fill out all required fields: Machine, Part Type, Part Model, and Dates.");
      return;
    }
    
    const reorderInfo = selectedModel ? ` (SKU: ${selectedModel.reorder_info})` : '';

    setIsSubmitting(true);
    
    let finalNotes = notes;
    // Append frequency info to notes if it's not already there or if it changed
    if (customFrequencyInput) {
      finalNotes += ` [Form Custom Frequency: ${customFrequencyInput} days]`;
    } else if (customFrequencyFromStorage) {
      finalNotes += ` [Part Management Custom Frequency: ${customFrequencyFromStorage} days]`;
    } else if (defaultFrequency) {
      finalNotes += ` [Default Frequency: ${defaultFrequency} days]`;
    }

    const success = await onUpdate(entry.id, {
      machine: `${machine} - ${partType} - ${partModel}${reorderInfo}`,
      last_maintenance: lastMaintenance,
      next_maintenance: nextMaintenance,
      notes: finalNotes,
    });

    if (success) {
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  const placeholderFrequency = customFrequencyFromStorage 
    ? `Custom: ${customFrequencyFromStorage} days` 
    : (defaultFrequency ? `Default: ${defaultFrequency} days` : "Enter days (optional)");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2" /> Edit Maintenance Entry
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="machine">Machine Name</Label>
              <MachineCombobox value={machine} onChange={handleMachineChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="part">Part Type</Label>
              <PartCombobox 
                value={partType} 
                onChange={handlePartTypeChange} 
                parts={availableParts} 
                disabled={!machine} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Part Model</Label>
              <ModelCombobox 
                value={partModel} 
                onChange={handlePartModelChange} 
                models={availableModels} 
                disabled={!partType || availableModels.length === 0} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="last_maintenance">Last Maintenance Date</Label>
              <Input
                id="last_maintenance"
                type="date"
                value={lastMaintenance}
                onChange={(e) => setLastMaintenance(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom_frequency">Custom Frequency (Days)</Label>
              <Input
                id="custom_frequency"
                type="number"
                placeholder={placeholderFrequency}
                value={customFrequencyInput}
                onChange={(e) => setCustomFrequencyInput(e.target.value ? Number(e.target.value) : "")}
                min="1"
              />
              {effectiveFrequencyDays !== null && effectiveFrequencyDays > 0 && (
                <p className="text-xs text-muted-foreground">
                  Using frequency: {effectiveFrequencyDays} days.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_maintenance">Next Maintenance Date</Label>
              <Input
                id="next_maintenance"
                type="date"
                value={nextMaintenance}
                onChange={(e) => setNextMaintenance(e.target.value)}
                required
                // Disable manual input if we successfully calculated a date
                disabled={!!nextMaintenance && effectiveFrequencyDays !== null && effectiveFrequencyDays > 0}
                className={nextMaintenance && effectiveFrequencyDays !== null && effectiveFrequencyDays > 0 ? "bg-muted/50" : ""}
              />
              {nextMaintenance && effectiveFrequencyDays !== null && effectiveFrequencyDays > 0 && (
                <p className="text-xs text-muted-foreground">
                  Calculated based on {effectiveFrequencyDays} days.
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2 col-span-1 md:col-span-3">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about the maintenance"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMaintenanceDialog;