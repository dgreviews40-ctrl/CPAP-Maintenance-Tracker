"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

interface AddCustomPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPartAdded: () => void;
}

interface CustomMachinePart {
  id: string;
  machine_label: string;
  part_type_label: string;
  part_model_label: string;
  reorder_info: string | null;
}

const AddCustomPartDialog = ({ open, onOpenChange, onPartAdded }: AddCustomPartDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Form state
  const [machineLabel, setMachineLabel] = useState("");
  const [partTypeLabel, setPartTypeLabel] = useState("");
  const [partModelLabel, setPartModelLabel] = useState("");
  const [reorderInfo, setReorderInfo] = useState("");

  const resetForm = () => {
    setMachineLabel("");
    setPartTypeLabel("");
    setPartModelLabel("");
    setReorderInfo("");
  };

  const addMutation = useMutation({
    mutationFn: async (newItem: Omit<CustomMachinePart, 'id'>) => {
      const { error } = await supabase
        .from("user_machines")
        .insert([newItem]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Custom part added successfully!");
      resetForm();
      onOpenChange(false);
      onPartAdded(); // Trigger refetch in parent
    },
    onError: (error) => {
      console.error("Error adding custom part:", error);
      if ((error as any).code === '23505') { // Unique constraint violation
        showError("This exact part model already exists for this machine.");
      } else {
        showError("Failed to add custom part.");
      }
    }
  });

  const handleAddPart = () => {
    if (!user) {
      showError("You must be logged in to add custom parts.");
      return;
    }
    if (!machineLabel || !partTypeLabel || !partModelLabel) {
      showError("All machine, part type, and part model fields are required.");
      return;
    }

    const newItem = {
      user_id: user.id,
      machine_label: machineLabel.trim(),
      part_type_label: partTypeLabel.trim(),
      part_model_label: partModelLabel.trim(),
      reorder_info: reorderInfo.trim() || null,
    };
    
    addMutation.mutate(newItem as Omit<CustomMachinePart, 'id'>);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" /> Add New Custom Part Definition
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Define a new machine or part model that is not in the default catalog.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="machineLabel">Machine Name (e.g., My Custom CPAP)</Label>
              <Input
                id="machineLabel"
                value={machineLabel}
                onChange={(e) => setMachineLabel(e.target.value)}
                placeholder="Machine Label"
                disabled={addMutation.isPending}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="partTypeLabel">Part Type (e.g., Custom Filter)</Label>
              <Input
                id="partTypeLabel"
                value={partTypeLabel}
                onChange={(e) => setPartTypeLabel(e.target.value)}
                placeholder="Part Type Label"
                disabled={addMutation.isPending}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="partModelLabel">Part Model (e.g., HEPA Filter 2000)</Label>
              <Input
                id="partModelLabel"
                value={partModelLabel}
                onChange={(e) => setPartModelLabel(e.target.value)}
                placeholder="Part Model Label"
                disabled={addMutation.isPending}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="reorderInfo">Reorder Info / SKU (Optional)</Label>
              <Input
                id="reorderInfo"
                value={reorderInfo}
                onChange={(e) => setReorderInfo(e.target.value)}
                placeholder="SKU or link"
                disabled={addMutation.isPending}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={addMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddPart} 
            disabled={!machineLabel || !partTypeLabel || !partModelLabel || addMutation.isPending}
          >
            {addMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Save Custom Part
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomPartDialog;