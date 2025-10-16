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

interface Part {
  value: string;
  label: string;
  models: { value: string; label: string; reorder_info: string }[];
}

interface MaintenanceFormProps {
  onAddEntry: (entry: Omit<MaintenanceEntry, 'id' | 'created_at'>) => Promise<boolean>;
}

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

const MaintenanceForm = ({ onAddEntry }: MaintenanceFormProps) => {
  const [machine, setMachine] = useState("");
  const [partType, setPartType] = useState("");
  const [partModel, setPartModel] = useState("");
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [availableModels, setAvailableModels] = useState<{ value: string; label: string; reorder_info: string }[]>([]);
  const [lastMaintenance, setLastMaintenance] = useState(format(new Date(), 'yyyy-MM-dd')); // Default to today
  const [nextMaintenance, setNextMaintenance] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to calculate next maintenance date automatically
  useEffect(() => {
    if (lastMaintenance && partType) {
      const frequencyDays = getMaintenanceFrequencyDays(partType);
      
      if (frequencyDays !== null) {
        // Use Date object from the input string (handle potential timezone issues by replacing hyphens)
        const lastDate = new Date(lastMaintenance.replace(/-/g, "/"));
        const nextDate = addDays(lastDate, frequencyDays);
        setNextMaintenance(format(nextDate, 'yyyy-MM-dd'));
      } else {
        // If frequency is unknown, clear the next maintenance date
        setNextMaintenance("");
      }
    } else if (lastMaintenance) {
      // If last maintenance is set but part type is not, clear next maintenance
      setNextMaintenance("");
    }
  }, [lastMaintenance, partType]);


  const handleMachineChange = (selectedLabel: string) => {
    setMachine(selectedLabel);
    const machineData = cpapMachines.find(m => m.label === selectedLabel);
    
    if (machineData) {
      setAvailableParts(machineData.parts as Part[]);
    } else {
      setAvailableParts([]);
    }
    setPartType(""); // Reset part type
    setPartModel(""); // Reset part model
    setAvailableModels([]);
  };

  const handlePartTypeChange = (selectedLabel: string) => {
    setPartType(selectedLabel);
    const selectedPart = availableParts.find(p => p.label === selectedLabel);
    
    if (selectedPart && selectedPart.models) {
      setAvailableModels(selectedPart.models);
    } else {
      setAvailableModels([]);
    }
    setPartModel(""); // Reset part model
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine || !partType || !partModel || !lastMaintenance || !nextMaintenance) {
      alert("Please fill out all required fields: Machine, Part Type, Part Model, and Dates.");
      return;
    }
    
    const selectedModel = availableModels.find(m => m.label === partModel);
    const reorderInfo = selectedModel ? ` (SKU: ${selectedModel.reorder_info})` : '';

    setIsSubmitting(true);
    const success = await onAddEntry({
      machine: `${machine} - ${partType} - ${partModel}${reorderInfo}`,
      last_maintenance: lastMaintenance,
      next_maintenance: nextMaintenance,
      notes,
    });

    if (success) {
      // Clear form, but keep lastMaintenance defaulted to today for convenience
      setMachine("");
      setPartType("");
      setPartModel("");
      setAvailableParts([]);
      setAvailableModels([]);
      setNextMaintenance("");
      setNotes("");
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-4 border rounded-lg">
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
            onChange={setPartModel} 
            models={availableModels} 
            disabled={!partType || availableModels.length === 0} 
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Label htmlFor="next_maintenance">Next Maintenance Date</Label>
          <Input
            id="next_maintenance"
            type="date"
            value={nextMaintenance}
            onChange={(e) => setNextMaintenance(e.target.value)}
            required
            // Disable manual input if we successfully calculated a date
            disabled={!!nextMaintenance && getMaintenanceFrequencyDays(partType) !== null}
            className={nextMaintenance && getMaintenanceFrequencyDays(partType) !== null ? "bg-muted/50" : ""}
          />
          {nextMaintenance && getMaintenanceFrequencyDays(partType) !== null && (
            <p className="text-xs text-muted-foreground">
              Automatically calculated based on standard {partType} replacement schedule.
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
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Entry"}
      </Button>
    </form>
  );
};

export default MaintenanceForm;