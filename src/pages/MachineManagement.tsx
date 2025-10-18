"use client";

import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wrench, Plus, Trash2, Loader2 } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { showSuccess, showError } from "@/utils/toast";
import { useAllMachines } from "@/hooks/use-all-machines";
import { cpapMachines } from "@/data/cpap-machines"; // <-- Added import

interface CustomMachinePart {
  id: string;
  machine_label: string;
  part_type_label: string;
  part_model_label: string;
  reorder_info: string | null;
}

const MachineManagement = () => {
  const { user } = useAuth();
  const { allMachines, loading: loadingAllMachines, refetchMachines } = useAllMachines();
  const [customParts, setCustomParts] = useState<CustomMachinePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [machineLabel, setMachineLabel] = useState("");
  const [partTypeLabel, setPartTypeLabel] = useState("");
  const [partModelLabel, setPartModelLabel] = useState("");
  const [reorderInfo, setReorderInfo] = useState("");

  const fetchCustomParts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from("user_machines")
      .select("*")
      .order("machine_label", { ascending: true });

    if (error) {
      console.error("Error fetching custom parts:", error);
      showError("Failed to load custom machine parts.");
      setCustomParts([]);
    } else {
      setCustomParts(data as CustomMachinePart[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCustomParts();
  }, [fetchCustomParts]);

  const handleAddPart = async () => {
    if (!user || !machineLabel || !partTypeLabel || !partModelLabel) {
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

    const { error } = await supabase
      .from("user_machines")
      .insert([newItem]);

    if (error) {
      console.error("Error adding custom part:", error);
      if (error.code === '23505') { // Unique constraint violation
        showError("This exact part model already exists for this machine.");
      } else {
        showError("Failed to add custom part.");
      }
    } else {
      showSuccess("Custom part added successfully!");
      // Reset form
      setMachineLabel("");
      setPartTypeLabel("");
      setPartModelLabel("");
      setReorderInfo("");
      setIsAdding(false);
      fetchCustomParts();
      refetchMachines(); // Refresh the global machine list
    }
  };

  const handleDeletePart = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this custom part definition? This will not affect existing maintenance entries.")) return;

    const { error } = await supabase
      .from("user_machines")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting custom part:", error);
      showError("Failed to delete custom part.");
    } else {
      showSuccess("Custom part deleted.");
      fetchCustomParts();
      refetchMachines(); // Refresh the global machine list
    }
  };
  
  const totalMachines = allMachines.length;
  const customMachineCount = customParts.length;

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold">Machine & Part Management</h1>
          <p className="text-xl text-muted-foreground">
            Define custom machines and parts not listed in the default catalog.
          </p>
        </header>
        <main className="w-full max-w-4xl mx-auto space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" /> Add Custom Part Definition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsAdding(!isAdding)} className="mb-4">
                {isAdding ? "Hide Form" : "Show Form"}
              </Button>
              
              {isAdding && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="machineLabel">Machine Name (e.g., My Custom CPAP)</Label>
                      <Input
                        id="machineLabel"
                        value={machineLabel}
                        onChange={(e) => setMachineLabel(e.target.value)}
                        placeholder="Machine Label"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="partTypeLabel">Part Type (e.g., Custom Filter)</Label>
                      <Input
                        id="partTypeLabel"
                        value={partTypeLabel}
                        onChange={(e) => setPartTypeLabel(e.target.value)}
                        placeholder="Part Type Label"
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
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="reorderInfo">Reorder Info / SKU (Optional)</Label>
                      <Input
                        id="reorderInfo"
                        value={reorderInfo}
                        onChange={(e) => setReorderInfo(e.target.value)}
                        placeholder="SKU or link"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddPart} disabled={!machineLabel || !partTypeLabel || !partModelLabel}>
                    Save Custom Part
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="h-5 w-5 mr-2" /> Your Custom Parts ({customMachineCount})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                These parts are available alongside {totalMachines - cpapMachines.length} default machines in the maintenance and inventory forms.
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : customParts.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  You have not defined any custom machines or parts yet.
                </p>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Machine</TableHead>
                        <TableHead>Part Type</TableHead>
                        <TableHead>Part Model</TableHead>
                        <TableHead>Reorder Info</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customParts.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.machine_label}</TableCell>
                          <TableCell>{item.part_type_label}</TableCell>
                          <TableCell>{item.part_model_label}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                            {item.reorder_info || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePart(item.id)}
                              title="Delete Custom Part"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </Layout>
  );
};

export default MachineManagement;