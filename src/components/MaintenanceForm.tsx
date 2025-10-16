"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MaintenanceEntry } from "./MaintenanceTracker";
import { MachineCombobox } from "./MachineCombobox";
import { PartCombobox } from "./PartCombobox";
import { cpapMachines } from "@/data/cpap-machines";

interface MaintenanceFormProps {
  onAddEntry: (entry: Omit<MaintenanceEntry, 'id' | 'created_at'>) => Promise<boolean>;
}

const MaintenanceForm = ({ onAddEntry }: MaintenanceFormProps) => {
  const [machine, setMachine] = useState("");
  const [part, setPart] = useState("");
  const [availableParts, setAvailableParts] = useState<{value: string, label: string}[]>([]);
  const [lastMaintenance, setLastMaintenance] = useState("");
  const [nextMaintenance, setNextMaintenance] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMachineChange = (selectedLabel: string) => {
    setMachine(selectedLabel);
    const machineData = cpapMachines.find(m => m.label === selectedLabel);
    
    if (machineData) {
      setAvailableParts(machineData.parts);
    } else {
      setAvailableParts([]);
    }
    setPart(""); // Reset part selection when machine changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine || !part || !lastMaintenance || !nextMaintenance) {
      alert("Please fill out all required fields, including machine and part.");
      return;
    }
    setIsSubmitting(true);
    const success = await onAddEntry({
      machine: `${machine} - ${part}`,
      last_maintenance: lastMaintenance,
      next_maintenance: nextMaintenance,
      notes,
    });

    if (success) {
      // Clear form
      setMachine("");
      setPart("");
      setAvailableParts([]);
      setLastMaintenance("");
      setNextMaintenance("");
      setNotes("");
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-4 border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="machine">Machine Name</Label>
          <MachineCombobox value={machine} onChange={handleMachineChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="part">Part</Label>
          <PartCombobox 
            value={part} 
            onChange={setPart} 
            parts={availableParts} 
            disabled={!machine} 
          />
        </div>
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
          />
        </div>
      </div>
      <div className="space-y-2 col-span-1 md:col-span-2">
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