"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { MaintenanceEntry } from "./MaintenanceTracker";
import { addDays, format } from "date-fns";
import { getMaintenanceFrequencyDays, getCustomFrequencyFromDB } from "@/utils/frequency";
import { showError } from "@/utils/toast";
import { decrementInventory, parseMachineStringForInventory } from "@/utils/inventory"; // Import utilities

interface MarkAsDoneButtonProps {
  entry: MaintenanceEntry;
  onComplete: (id: string, newLastDate: string, newNextDate: string) => Promise<boolean>;
}

// Helper to extract part type label from the machine string
const extractPartTypeLabel = (machineString: string): string => {
  const parts = machineString.split(' - ');
  return parts[1]?.trim() || "";
};

const MarkAsDoneButton = ({ entry, onComplete }: MarkAsDoneButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleComplete = async () => {
    setIsProcessing(true);
    
    const { machineLabel, partTypeLabel, partModelLabel } = parseMachineStringForInventory(entry.machine);
    
    if (!partTypeLabel || !machineLabel || !partModelLabel) {
      showError("Could not parse part details from entry. Please edit manually.");
      setIsProcessing(false);
      return;
    }
    
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // 1. Determine the frequency (Check DB first, then fallback to default)
    // Note: We fetch the custom frequency directly here for the most accurate calculation.
    const customFrequency = await getCustomFrequencyFromDB(machineLabel, partTypeLabel, partModelLabel);
    const defaultFrequency = getMaintenanceFrequencyDays(partTypeLabel);
    
    const frequencyDays = customFrequency || defaultFrequency || 30; // Default to 30 days if unknown

    if (frequencyDays <= 0) {
      showError("Cannot calculate next maintenance date. Please edit the entry manually.");
      setIsProcessing(false);
      return;
    }

    // 2. Calculate new next maintenance date
    const newNextDate = format(addDays(new Date(), frequencyDays), 'yyyy-MM-dd');

    // 3. Update the maintenance entry
    const success = await onComplete(entry.id, today, newNextDate);

    if (success) {
      // 4. Decrement inventory for the replaced part
      await decrementInventory(machineLabel, partTypeLabel, partModelLabel);
    }
    
    setIsProcessing(false);
  };

  return (
    <Button 
      variant="default" 
      size="sm" 
      onClick={handleComplete} 
      disabled={isProcessing}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <CheckCircle className="h-4 w-4 mr-2" />
      )}
      Done
    </Button>
  );
};

export default MarkAsDoneButton;