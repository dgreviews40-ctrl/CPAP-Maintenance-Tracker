"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Package, Plus, Minus, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";
import { MachineCombobox } from "./MachineCombobox";
import { PartCombobox } from "./PartCombobox";
import { ModelCombobox } from "./ModelCombobox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAllMachines } from "@/hooks/use-all-machines";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface InventoryItem {
  id: string;
  machine_label: string;
  part_type_label: string;
  part_model_label: string;
  reorder_info: string | null;
  quantity: number;
  reorder_threshold: number;
  last_restock: string | null;
}

interface Part {
  value: string;
  label: string;
  models: { value: string; label: string; reorder_info: string }[];
}

const fetchInventory = async (userId: string | undefined): Promise<InventoryItem[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from("part_inventory")
    .select("*")
    .order("machine_label", { ascending: true });

  if (error) {
    console.error("Error fetching inventory:", error);
    throw new Error("Failed to load inventory.");
  }
  return data as InventoryItem[];
};

const PartInventory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { allMachines } = useAllMachines();

  const { data: inventory = [], isLoading: loading, refetch: refetchInventory } = useQuery<InventoryItem[]>({
    queryKey: ['partInventory', user?.id],
    queryFn: () => fetchInventory(user?.id),
    enabled: !!user,
    staleTime: 1000 * 10, // 10 seconds
  });
  
  // Form state for adding new item
  const [isAdding, setIsAdding] = useState(false);
  const [machine, setMachine] = useState("");
  const [partType, setPartType] = useState("");
  const [partModel, setPartModel] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reorderThreshold, setReorderThreshold] = useState(0);
  
  // Restock Dialog State
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState(1);


  // Derived state for comboboxes
  const machineData = allMachines.find(m => m.label === machine);
  const availableParts: Part[] = machineData?.parts || [];
  const selectedPart = availableParts.find(p => p.label === partType);
  const availableModels = selectedPart?.models || [];
  const selectedModel = availableModels.find(m => m.label === partModel);

  const invalidateInventoryQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['partInventory'] });
    queryClient.invalidateQueries({ queryKey: ['userParts'] }); // User parts depend on inventory
  }, [queryClient]);

  const addMutation = useMutation({
    mutationFn: async (newItem: Omit<InventoryItem, 'id' | 'last_restock'>) => {
      const { error } = await supabase
        .from("part_inventory")
        .insert([{ ...newItem, user_id: user!.id, last_restock: format(new Date(), 'yyyy-MM-dd') }]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Part added to inventory!");
      // Reset form
      setMachine("");
      setPartType("");
      setPartModel("");
      setQuantity(1);
      setReorderThreshold(0);
      setIsAdding(false);
      invalidateInventoryQueries();
    },
    onError: (error) => {
      console.error("Error adding part:", error);
      if ((error as any).code === '23505') { // Unique constraint violation
        showError("This exact part is already in your inventory. Please update the quantity instead.");
      } else {
        showError("Failed to add part to inventory.");
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updateData }: { id: string, updateData: Partial<InventoryItem> }) => {
      const { error } = await supabase
        .from("part_inventory")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Inventory updated!");
      invalidateInventoryQueries();
    },
    onError: (error) => {
      console.error("Error updating inventory:", error);
      showError("Failed to update inventory.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("part_inventory")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Inventory item deleted.");
      invalidateInventoryQueries();
    },
    onError: (error) => {
      console.error("Error deleting part:", error);
      showError("Failed to delete inventory item.");
    }
  });

  const handleAddPart = () => {
    if (!user || !machine || !partType || !partModel || quantity <= 0) {
      showError("Please select a machine, part type, part model, and a valid quantity.");
      return;
    }

    const reorderInfo = selectedModel?.reorder_info || null;
    
    addMutation.mutate({
      machine_label: machine,
      part_type_label: partType,
      part_model_label: partModel,
      reorder_info: reorderInfo,
      quantity: quantity,
      reorder_threshold: reorderThreshold,
    } as Omit<InventoryItem, 'id' | 'last_restock'>);
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    // Note: We no longer update last_restock here, only quantity
    updateMutation.mutate({ id, updateData: { quantity: newQuantity } });
  };
  
  const handleUpdateThreshold = (id: string, newThreshold: number) => {
    if (newThreshold < 0) return;
    updateMutation.mutate({ id, updateData: { reorder_threshold: newThreshold } });
  };

  const handleDeletePart = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this inventory item?")) return;
    deleteMutation.mutate(id);
  };
  
  const openRestockDialog = (item: InventoryItem) => {
    setRestockItem(item);
    setRestockAmount(1); // Default to 1
    setIsRestockDialogOpen(true);
  };
  
  const handleRestock = () => {
    if (!restockItem || restockAmount <= 0) return;
    
    const newQuantity = restockItem.quantity + restockAmount;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    updateMutation.mutate({ 
      id: restockItem.id, 
      updateData: { 
        quantity: newQuantity,
        last_restock: today,
      } 
    }, {
      onSuccess: () => {
        showSuccess(`${restockAmount} units of ${restockItem.part_model_label} restocked!`);
        setIsRestockDialogOpen(false);
        setRestockItem(null);
        invalidateInventoryQueries();
      },
      onError: (error) => {
        console.error("Error during restock:", error);
        showError("Failed to process restock.");
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" /> Part Inventory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">
          Track the spare parts you currently have on hand and set reorder alerts.
        </p>

        <Button onClick={() => setIsAdding(!isAdding)} className="mb-6">
          {isAdding ? "Cancel Add Part" : "Add New Spare Part"}
        </Button>

        {isAdding && (
          <div className="border p-4 rounded-lg mb-6 space-y-4 bg-muted/50">
            <h4 className="font-semibold">Add New Part</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-1">
                <Label>Machine</Label>
                <MachineCombobox 
                  value={machine} 
                  onChange={(value) => {
                    setMachine(value);
                    setPartType("");
                    setPartModel("");
                  }} 
                />
              </div>
              <div className="md:col-span-1">
                <Label>Part Type</Label>
                <PartCombobox 
                  value={partType} 
                  onChange={(value) => {
                    setPartType(value);
                    setPartModel("");
                  }} 
                  parts={availableParts} 
                  disabled={!machine} 
                />
              </div>
              <div className="md:col-span-1">
                <Label>Part Model</Label>
                <ModelCombobox 
                  value={partModel} 
                  onChange={setPartModel} 
                  models={availableModels} 
                  disabled={!partType || availableModels.length === 0} 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  min="1"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="threshold">Reorder Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={reorderThreshold}
                  onChange={(e) => setReorderThreshold(Math.max(0, Number(e.target.value)))}
                  min="0"
                />
              </div>
            </div>
            <Button 
              onClick={handleAddPart} 
              disabled={!machine || !partType || !partModel || quantity <= 0 || addMutation.isPending}
            >
              {addMutation.isPending ? "Saving..." : "Save Part"}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : inventory.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Your inventory is empty. Add a spare part above!
          </p>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Machine</TableHead>
                  <TableHead>Part Type</TableHead>
                  <TableHead>Model / SKU</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Threshold</TableHead>
                  <TableHead>Last Restock</TableHead>
                  <TableHead className="text-right w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => {
                  const needsReorder = item.quantity <= item.reorder_threshold;
                  return (
                    <TableRow key={item.id} className={cn(needsReorder && "bg-red-900/10 hover:bg-red-900/20")}>
                      <TableCell className="font-medium">{item.machine_label}</TableCell>
                      <TableCell>{item.part_type_label}</TableCell>
                      <TableCell>
                        <span className="font-medium">{item.part_model_label}</span>
                        {item.reorder_info && (
                          <span className="text-xs text-muted-foreground block">SKU: {item.reorder_info}</span>
                        )}
                        {needsReorder && (
                          <Badge variant="destructive" className="mt-1 flex items-center w-fit">
                            <AlertTriangle className="h-3 w-3 mr-1" /> REORDER NEEDED
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className={cn("text-center font-bold", needsReorder && "text-red-500")}>
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          value={item.reorder_threshold}
                          onChange={(e) => handleUpdateThreshold(item.id, Math.max(0, Number(e.target.value)))}
                          onBlur={(e) => handleUpdateThreshold(item.id, Math.max(0, Number(e.target.value)))}
                          min="0"
                          className="w-16 text-center h-8 p-1"
                        />
                      </TableCell>
                      <TableCell>
                        {item.last_restock 
                          ? (() => {
                              const date = new Date(item.last_restock.replace(/-/g, "/"));
                              return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString();
                            })()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right space-x-1 flex items-center justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openRestockDialog(item)}
                          title="Log Restock"
                          disabled={updateMutation.isPending}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" /> Restock
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePart(item.id)}
                          title="Delete Item"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Restock {restockItem?.part_model_label}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="restock-amount">Quantity to Add</Label>
              <Input
                id="restock-amount"
                type="number"
                value={restockAmount}
                onChange={(e) => setRestockAmount(Math.max(1, Number(e.target.value)))}
                min="1"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Current Stock: {restockItem?.quantity || 0}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRestock} 
              disabled={restockAmount <= 0 || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Processing..." : "Confirm Restock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PartInventory;