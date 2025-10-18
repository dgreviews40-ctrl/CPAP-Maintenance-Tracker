"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { showError, showSuccess } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PartInventoryManagerProps {
  uniqueKey: string;
  initialQuantity?: number;
  initialThreshold?: number;
  initialReorderInfo: string;
  initialLastRestock?: string | null;
}

const PartInventoryManager = ({
  uniqueKey,
  initialQuantity = 0,
  initialThreshold = 0,
  initialReorderInfo,
  initialLastRestock,
}: PartInventoryManagerProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for local input changes
  const [quantity, setQuantity] = useState(initialQuantity);
  const [threshold, setThreshold] = useState(initialThreshold);
  const [restockAmount, setRestockAmount] = useState(1);
  
  // State for UI control
  const [isRestocking, setIsRestocking] = useState(false);
  const [isSavingThreshold, setIsSavingThreshold] = useState(false);
  
  const [machineLabel, partTypeLabel, partModelLabel] = uniqueKey.split('|');

  // Sync local state with props when they change (e.g., after a successful restock/refetch)
  useEffect(() => {
    setQuantity(initialQuantity);
    setThreshold(initialThreshold);
  }, [initialQuantity, initialThreshold]);

  const needsReorder = quantity <= threshold;
  const isTracked = initialQuantity !== undefined;

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all(user?.id || 'anonymous') });
    queryClient.invalidateQueries({ queryKey: queryKeys.parts.userParts(user?.id || 'anonymous') });
  }, [queryClient, user]);

  // --- Mutations ---

  const upsertMutation = useMutation({
    mutationFn: async (updateData: Partial<{ quantity: number, reorder_threshold: number, last_restock: string | null }>) => {
      if (!user) throw new Error("User not logged in.");

      // 1. Check if the part already exists in inventory
      const { data: existing, error: fetchError } = await supabase
        .from("part_inventory")
        .select("id")
        .eq("machine_label", machineLabel) // Use labels for unique key lookup
        .eq("part_type_label", partTypeLabel)
        .eq("part_model_label", partModelLabel)
        .limit(1);

      if (fetchError) throw fetchError;
      
      const baseData = {
        user_id: user.id,
        machine_label: machineLabel,
        part_type_label: partTypeLabel,
        part_model_label: partModelLabel,
        reorder_info: initialReorderInfo,
      };

      if (existing && existing.length > 0) {
        // Update existing row
        const { error: updateError } = await supabase
          .from("part_inventory")
          .update(updateData)
          .eq("id", existing[0].id);
        if (updateError) throw updateError;
      } else {
        // Insert new row (must include all required fields)
        const insertData = {
          ...baseData,
          quantity: updateData.quantity ?? 0,
          reorder_threshold: updateData.reorder_threshold ?? 0,
          last_restock: updateData.last_restock ?? null,
        };
        const { error: insertError } = await supabase
          .from("part_inventory")
          .insert([insertData]);
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      invalidateQueries();
    },
    onError: (error) => {
      console.error("Inventory update error:", error);
      showError("Failed to update inventory.");
    }
  });

  // --- Handlers ---

  const handleSaveThreshold = async () => {
    setIsSavingThreshold(true);
    const originalThreshold = threshold; // Capture current local state before mutation
    try {
      await upsertMutation.mutateAsync({ reorder_threshold: threshold });
      showSuccess("Reorder threshold saved!");
    } catch (e) {
      // Rollback state if mutation fails
      setThreshold(initialThreshold);
    } finally {
      setIsSavingThreshold(false);
    }
  };
  
  const handleRestock = async () => {
    if (restockAmount <= 0) return;
    setIsRestocking(true);
    
    const newQuantity = quantity + restockAmount;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    try {
      await upsertMutation.mutateAsync({ 
        quantity: newQuantity, 
        last_restock: today,
        reorder_threshold: threshold,
      });
      // State update will happen via useEffect when props change after refetch, 
      // but we update locally for immediate feedback if needed.
      setQuantity(newQuantity); 
      setRestockAmount(1);
      showSuccess(`${restockAmount} units of ${partModelLabel} restocked!`);
    } catch (e) {
      // Rollback local state if restock fails
      setQuantity(initialQuantity);
      setThreshold(initialThreshold);
    } finally {
      setIsRestocking(false);
    }
  };
  
  const handleManualQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 0) return;
    
    // Update local state immediately for responsiveness
    setQuantity(newQuantity);
    
    // Capture the value we are trying to save
    const quantityToSave = newQuantity;
    
    try {
      await upsertMutation.mutateAsync({ 
        quantity: quantityToSave,
        reorder_threshold: threshold,
      });
      showSuccess("Quantity updated manually.");
    } catch (e) {
      // Rollback local state if save fails
      setQuantity(initialQuantity);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Package className="h-5 w-5 mr-2" /> Inventory Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {needsReorder && isTracked && (
          <Badge variant="destructive" className="flex items-center w-full justify-center py-2 text-base">
            <AlertTriangle className="h-4 w-4 mr-2" /> REORDER NEEDED: Only {quantity} left!
          </Badge>
        )}
        
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="current-quantity">Current Quantity</Label>
            <Input
              id="current-quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
              onBlur={(e) => handleManualQuantityChange(Math.max(0, Number(e.target.value)))}
              min="0"
              disabled={upsertMutation.isPending}
              className={cn(needsReorder && "border-red-500")}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="threshold">Reorder Threshold</Label>
            <div className="flex space-x-2">
              <Input
                id="threshold"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Math.max(0, Number(e.target.value)))}
                min="0"
                disabled={upsertMutation.isPending}
              />
              <Button 
                onClick={handleSaveThreshold} 
                disabled={isSavingThreshold || upsertMutation.isPending}
                variant="secondary"
              >
                {isSavingThreshold ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Restock Action */}
        <div className="space-y-2 border-t pt-4">
          <Label>Log Restock Event</Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              value={restockAmount}
              onChange={(e) => setRestockAmount(Math.max(1, Number(e.target.value)))}
              min="1"
              placeholder="Quantity to add"
              disabled={isRestocking || upsertMutation.isPending}
            />
            <Button 
              onClick={handleRestock} 
              disabled={restockAmount <= 0 || isRestocking || upsertMutation.isPending}
            >
              {isRestocking ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Restock
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Last Restock: {initialLastRestock ? safeFormatDate(initialLastRestock) : 'Never'}
          </p>
        </div>
        
        <div className="text-sm text-muted-foreground border-t pt-4">
          <p>SKU/Reorder Info: <span className="font-mono text-primary">{initialReorderInfo || 'N/A'}</span></p>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to safely format date strings (copied from PartDetailView)
const safeFormatDate = (dateStr: string | undefined | null, formatString: string = 'MMM dd, yyyy'): string => {
  if (!dateStr) return "N/A";
  // Handle timezone issues by replacing hyphens with slashes
  const date = new Date(dateStr.replace(/-/g, "/"));
  if (isNaN(date.getTime())) return "Invalid Date";
  return format(date, formatString);
};

export default PartInventoryManager;