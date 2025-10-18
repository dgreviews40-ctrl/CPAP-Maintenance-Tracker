"use client";

import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wrench, Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { showSuccess, showError } from "@/utils/toast";
import { useAllMachines } from "@/hooks/use-all-machines";
import { cpapMachines } from "@/data/cpap-machines";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { isCustomPartReferenced } from "@/utils/data-integrity";
import { queryKeys } from "@/lib/queryKeys";
import AddCustomPartDialog from "@/components/AddCustomPartDialog"; // Import the new component

interface CustomMachinePart {
  id: string;
  machine_label: string;
  part_type_label: string;
  part_model_label: string;
  reorder_info: string | null;
}

const fetchCustomParts = async (userId: string | undefined): Promise<CustomMachinePart[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from("user_machines")
    .select("*")
    .order("machine_label", { ascending: true });

  if (error) {
    console.error("Error fetching custom parts:", error);
    throw new Error("Failed to load custom machine parts.");
  }
  return data as CustomMachinePart[];
};

const MachineManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { allMachines, refetchMachines } = useAllMachines();
  
  const { data: customParts = [], isLoading: loading } = useQuery<CustomMachinePart[]>({
    queryKey: queryKeys.machines.customParts(user?.id || 'anonymous'),
    queryFn: () => fetchCustomParts(user?.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const invalidateMachineQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.machines.customParts(user?.id || 'anonymous') });
    queryClient.invalidateQueries({ queryKey: queryKeys.machines.all(user?.id || 'anonymous') }); // Must refetch the combined list
  }, [queryClient, user]);

  const deleteMutation = useMutation({
    mutationFn: async (item: CustomMachinePart) => {
      // 1. Check for references
      const isReferenced = await isCustomPartReferenced(
        item.machine_label,
        item.part_type_label,
        item.part_model_label
      );
      
      if (isReferenced) {
        throw new Error("Part is currently referenced in maintenance entries or inventory. Please delete or update those records first.");
      }
      
      // 2. Proceed with deletion
      const { error } = await supabase
        .from("user_machines")
        .delete()
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Custom part deleted.");
      invalidateMachineQueries();
    },
    onError: (error) => {
      console.error("Error deleting custom part:", error);
      showError(error.message || "Failed to delete custom part.");
    }
  });

  const handleDeletePart = (item: CustomMachinePart) => {
    if (!window.confirm(`Are you sure you want to delete the custom part definition: ${item.part_model_label} (${item.machine_label})?`)) return;
    deleteMutation.mutate(item);
  };
  
  const totalMachines = allMachines.length;
  const defaultMachineCount = cpapMachines.length;
  const customPartCount = customParts.length;

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/settings">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Settings
              </Button>
            </Link>
            <header className="text-center flex-grow">
              <h1 className="text-4xl font-bold">Machine & Part Management</h1>
              <p className="text-xl text-muted-foreground">
                Define custom machines and parts not listed in the default catalog.
              </p>
            </header>
            <div className="w-[150px]">
              {/* Spacer to balance the header */}
            </div>
          </div>
          <main className="space-y-6">
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" /> Add Custom Part Definition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Click below to define a new machine or part model that will be available in the maintenance and inventory forms.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add New Custom Part
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2" /> Your Custom Parts ({customPartCount})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  These parts are available alongside {totalMachines - defaultMachineCount} default machines in the maintenance and inventory forms.
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
                                onClick={() => handleDeletePart(item)}
                                title="Delete Custom Part"
                                disabled={deleteMutation.isPending}
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
      </div>
      
      <AddCustomPartDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onPartAdded={invalidateMachineQueries}
      />
    </Layout>
  );
};

export default MachineManagement;