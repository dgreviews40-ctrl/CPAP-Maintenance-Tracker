"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Loader2, Bell } from "lucide-react";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { showSuccess, showError } from "@/utils/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAllMachines, Machine } from "@/hooks/use-all-machines"; // Import Machine type from the hook file
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomFrequency {
  id: string;
  unique_part_key: string;
  frequency_days: number;
  created_at: string;
}

const fetchCustomFrequencies = async (userId: string | undefined): Promise<CustomFrequency[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from("custom_frequencies")
    .select("*")
    .order("unique_part_key", { ascending: true });

  if (error) {
    console.error("Error fetching custom frequencies:", error);
    throw new Error("Failed to load custom frequencies.");
  }
  return data as CustomFrequency[];
};

const FrequencySettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Use the imported Machine type for the hook return value
  const { allMachines } = useAllMachines() as { allMachines: Machine[] };
  
  const { data: customFrequencies = [], isLoading: loading } = useQuery<CustomFrequency[]>({
    queryKey: ['customFrequencies', user?.id],
    queryFn: () => fetchCustomFrequencies(user?.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [selectedPartKey, setSelectedPartKey] = useState("");
  const [frequencyDays, setFrequencyDays] = useState("");

  const invalidateFrequencyQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['customFrequencies'] });
    queryClient.invalidateQueries({ queryKey: ['maintenanceSchedule'] }); // Invalidate schedule to reflect changes
  }, [queryClient]);

  const addMutation = useMutation({
    mutationFn: async (newItem: Omit<CustomFrequency, 'id' | 'created_at'>) => {
      const { error } = await supabase
        .from("custom_frequencies")
        .insert([{ ...newItem, user_id: user?.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Custom frequency added successfully!");
      // Reset form
      setSelectedPartKey("");
      setFrequencyDays("");
      setIsAdding(false);
      invalidateFrequencyQueries();
    },
    onError: (error) => {
      console.error("Error adding custom frequency:", error);
      if ((error as any).code === '23505') { // Unique constraint violation
        showError("A custom frequency for this part already exists. Please delete the existing one first.");
      } else {
        showError("Failed to add custom frequency.");
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("custom_frequencies")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Custom frequency deleted.");
      invalidateFrequencyQueries();
    },
    onError: (error) => {
      console.error("Error deleting custom frequency:", error);
      showError("Failed to delete custom frequency.");
    }
  });

  const handleAddFrequency = () => {
    const days = parseInt(frequencyDays, 10);
    if (!user || !selectedPartKey || isNaN(days) || days <= 0) {
      showError("Please select a part and enter a valid frequency (days > 0).");
      return;
    }

    const newItem = {
      unique_part_key: selectedPartKey,
      frequency_days: days,
    };
    
    addMutation.mutate(newItem as Omit<CustomFrequency, 'id' | 'created_at'>);
  };

  const getPartDetails = (key: string) => {
    const [machineLabel, partTypeLabel, partModelLabel] = key.split("::");
    return { machineLabel, partTypeLabel, partModelLabel };
  };

  // Flatten the nested machine structure into a list of unique parts
  const availableParts = allMachines.flatMap(machine => 
    machine.parts.flatMap(partType => 
      partType.models.map(model => ({
        key: `${machine.label}::${partType.label}::${model.label}`,
        label: `${machine.label} - ${partType.label} (${model.label})`,
      }))
    )
  );

  // Use a local variable to ensure it's an array before mapping
  const currentFrequencies = Array.isArray(customFrequencies) ? customFrequencies : [];
  
  const partsWithCustomFrequency = new Set(currentFrequencies.map(f => f.unique_part_key));
  const partsForSelection = availableParts.filter(p => !partsWithCustomFrequency.has(p.key));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" /> Custom Maintenance Frequencies
        </CardTitle>
        <CardDescription>
          Override the default maintenance schedule for specific machine parts. This affects the 'Maintenance Schedule' view.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-4">
          <Button onClick={() => setIsAdding(!isAdding)} className="mb-4">
            {isAdding ? "Hide Form" : "Add New Custom Frequency"}
          </Button>
          
          {isAdding && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="partSelect">Machine Part</Label>
                  <Select value={selectedPartKey} onValueChange={setSelectedPartKey}>
                    <SelectTrigger id="partSelect">
                      <SelectValue placeholder="Select a machine part" />
                    </SelectTrigger>
                    <SelectContent>
                      {partsForSelection.length === 0 ? (
                        <SelectItem value="none" disabled>All parts have a custom frequency set.</SelectItem>
                      ) : (
                        partsForSelection.map(part => (
                          <SelectItem key={part.key} value={part.key}>
                            {part.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="frequencyDays">Frequency (Days)</Label>
                  <Input
                    id="frequencyDays"
                    type="number"
                    min="1"
                    value={frequencyDays}
                    onChange={(e) => setFrequencyDays(e.target.value)}
                    placeholder="e.g., 90"
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddFrequency} 
                disabled={!selectedPartKey || !frequencyDays || addMutation.isPending || partsForSelection.length === 0}
              >
                {addMutation.isPending ? "Saving..." : "Save Custom Frequency"}
              </Button>
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold mt-6">Current Custom Frequencies</h3>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : currentFrequencies.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No custom maintenance frequencies defined.
          </p>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine</TableHead>
                  <TableHead>Part Type</TableHead>
                  <TableHead>Part Model</TableHead>
                  <TableHead className="w-[150px]">Frequency (Days)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Use the guaranteed array variable */}
                {currentFrequencies.map((item) => {
                  const { machineLabel, partTypeLabel, partModelLabel } = getPartDetails(item.unique_part_key);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{machineLabel}</TableCell>
                      <TableCell>{partTypeLabel}</TableCell>
                      <TableCell>{partModelLabel}</TableCell>
                      <TableCell>{item.frequency_days}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(item.id)}
                          title="Delete Custom Frequency"
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
    </Card>
  );
};

export default FrequencySettings;