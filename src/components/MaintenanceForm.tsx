"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MaintenanceEntry } from "./MaintenanceTracker";

interface MaintenanceFormProps {
  onAddEntry: (entry: Omit<MaintenanceEntry, 'id' | 'created_at'>) => Promise<boolean>;
}

const MaintenanceForm = ({ onAddEntry }: MaintenanceFormProps) => {
  const [machine, setMachine] = useState("");
  const [lastMaintenance, setLastMaintenance] = useState("");
  const [nextMaintenance, setNextMaintenance] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine || !lastMaintenance || !nextMaintenance) {
      alert("Please fill out all required fields.");
      return;
    }
    setIsSubmitting(true);
    const success = await onAddEntry({
      machine,
      last_maintenance: lastMaintenance,
      next_maintenance: nextMaintenance,
      notes,
    });

    if (success) {
      // Clear form
      setMachine("");
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
          <Input
            id="machine"
            value={machine}
            onChange={(e) => setMachine(e.target.value)}
            placeholder="e.g., CNC Mill"
            required
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
      <div className="space-y-2">
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