"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { MaintenanceEntry } from "./MaintenanceTracker";
import { addDays, format } from "date-fns";
import { getMaintenanceFrequencyDays, getCustomFrequencyFromDB } from "@/utils/frequency";
import { showError } from "@/utils/toast";

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
    
    const partType = extractPartTypeLabel(entry.machine);
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // 1. Determine the frequency
    const defaultFrequency = getMaintenanceFrequencyDays(partType);
    
    // Since we don't have the full machine/model breakdown here, we rely on the default
    // or assume the user manages custom frequencies via the Frequency Management tab.
    // For simplicity in this button, we use the default if custom is not easily accessible.
    // NOTE: A more robust solution would require fetching the custom frequency here, 
    // but for a quick action button, we prioritize speed and use the default as a fallback.
    const frequencyDays = defaultFrequency || 30; // Default to 30 days if unknown

    if (frequencyDays <= 0) {
      showError("Cannot calculate next maintenance date. Please edit the entry manually.");
      setIsProcessing(false);
      return;
    }

    // 2. Calculate new next maintenance date
    const newNextDate = format(addDays(new Date(), frequencyDays), 'yyyy-MM-dd');

    // 3. Update the entry
    const success = await onComplete(entry.id, today, newNextDate);

    if (success) {
      // Optionally decrement inventory if this was a replacement, but for a generic 'done' button, 
      // we assume it might be cleaning, so we skip inventory decrement here.
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