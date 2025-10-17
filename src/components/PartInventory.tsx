"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Package, Plus, Minus, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";
import { MachineCombobox } from "./MachineCombobox";
import { PartCombobox } from "./PartCombobox";
import { ModelCombobox } from "./ModelCombobox";
import { cpapMachines } from "@/data/cpap-machines";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  machine_label: string;
  part_type_label: string;
  part_model_label: string;
  reorder_info: string | null;
  quantity: number;
  reorder_threshold: number; // New field
  last_restock: string | null;
}

interface Part {
  value: string;
  label: string;
  models: { value: string; label: string; reorder_info: string }[];
}

const PartInventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state for adding new item
  const [machine, setMachine] = useState("");
  const [partType, setPartType] = useState("");
  const [partModel, setPartModel] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reorderThreshold, setReorderThreshold] = useState(0); // New form state

  const fetchInventory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from("part_inventory")
      .select("*")
      .order("machine_label", { ascending: true });

    if (error) {
      console.error("Error fetching inventory:", error);
      showError("Failed to load inventory.");
    } else {
      setInventory(data as InventoryItem[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Derived state for comboboxes
  const machineData = cpapMachines.find(m => m.label === machine);
  const availableParts: Part[] = machineData?.parts || [];
  const selectedPart = availableParts.find(p => p.label === partType);
  const availableModels = selectedPart?.models || [];
  const selectedModel = availableModels.find(m => m.label === partModel);

  const handleAddPart = async () => {
    if (!user || !machine || !partType || !partModel || quantity <= 0) {
      showError("Please select a machine, part type, part model, and a valid quantity.");
      return;
    }

    const reorderInfo = selectedModel?.reorder_info || null;

    // Check if this exact part already exists in inventory
    const existingItem = inventory.find(item => 
      item.machine_label === machine && 
      item.part_type_label === partType && 
      item.part_model_label === partModel
    );

    if (existingItem) {
      showError("This exact part is already in your inventory. Please update the quantity instead.");
      return;
    }

    const newItem = {
      user_id: user.id,
      machine_label: machine,
      part_type_label: partType,
      part_model_label: partModel,
      reorder_info: reorderInfo,
      quantity: quantity,
      reorder_threshold: reorderThreshold, // Include threshold
      last_restock: format(new Date(), 'yyyy-MM-dd'),
    };

    const { error } = await supabase
      .from("part_inventory")
      .insert([newItem]);

    if (error) {
      console.error("Error adding part:", error);
      showError("Failed to add part to inventory.");
    } else {
      showSuccess("Part added to inventory!");
      // Reset form
      setMachine("");
      setPartType("");
      setPartModel("");
      setQuantity(1);
      setReorderThreshold(0);
      setIsAdding(false);
      fetchInventory();
    }
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    const updateData: Partial<InventoryItem> = { quantity: newQuantity };
    
    // If quantity increases, update last_restock date
    const currentItem = inventory.find(item => item.id === id);
    if (currentItem && newQuantity > currentItem.quantity) {
        updateData.last_restock = format(new Date(), 'yyyy-MM-dd');
    }

    const { error } = await supabase
      .from("part_inventory")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating quantity:", error);
      showError("Failed to update quantity.");
    } else {
      showSuccess("Inventory updated!");
      fetchInventory();
    }
  };
  
  const handleUpdateThreshold = async (id: string, newThreshold: number) => {
    if (newThreshold < 0) return;

    const { error } = await supabase
      .from("part_inventory")
      .update({ reorder_threshold: newThreshold })
      .eq("id", id);

    if (error) {
      console.error("Error updating threshold:", error);
      showError("Failed to update reorder threshold.");
    } else {
      showSuccess("Reorder threshold updated!");
      fetchInventory();
    }
  };

  const handleDeletePart = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this inventory item?")) return;

    const { error } = await supabase
      .from("part_inventory")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting part:", error);
      showError("Failed to delete inventory item.");
    } else {
      showSuccess("Inventory item deleted.");
      setInventory(prev => prev.filter(item => item.id !== id));
    }
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
            <Button onClick={handleAddPart} disabled={!machine || !partType || !partModel || quantity <= 0}>
              Save Part
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine</TableHead>
                  <TableHead>Part Type</TableHead>
                  <TableHead>Model / SKU</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Threshold</TableHead>
                  <TableHead>Last Restock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        {item.last_restock ? new Date(item.last_restock.replace(/-/g, "/")).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          title="Increase Quantity (Restock)"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 0}
                          title="Decrease Quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePart(item.id)}
                          title="Delete Item"
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
    </Card>
  );
};

export default PartInventory;