"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Loader2, Save, RotateCcw } from "lucide-react";
import { useUserParts } from "@/hooks/use-user-parts";
import { useCustomFrequencies } from "@/hooks/use-custom-frequencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMaintenanceFrequencyDays } from "@/utils/frequency";
import { showSuccess, showError } from "@/utils/toast";
import { useDataRefresh } from "@/contexts/DataRefreshContext";

interface PartFrequencyState {
  [uniqueKey: string]: number | null; // null means reset/use default
}

const FrequencyManagement = () => {
  const { userParts, loading: loadingParts, refetchUserParts } = useUserParts();
  const { frequencies: customFrequencies, loading: loadingCustomFrequencies, updateFrequency } = useCustomFrequencies();
  const { refreshData } = useDataRefresh();
  
  // State to hold temporary input changes before saving
  const [localFrequencies, setLocalFrequencies] = useState<PartFrequencyState>({});
  const [isSaving, setIsSaving] = useState(false);

  const loading = loadingParts || loadingCustomFrequencies;

  // Combine part data with current frequency settings
  const partsWithFrequency = useMemo(() => {
    return userParts.map(part => {
      const defaultDays = getMaintenanceFrequencyDays(part.partTypeLabel);
      const currentCustomDays = customFrequencies[part.uniqueKey] || null;
      
      // Determine the frequency shown in the input field (local change overrides DB)
      const inputDays = localFrequencies[part.uniqueKey] !== undefined 
        ? localFrequencies[part.uniqueKey] 
        : currentCustomDays;

      return {
        ...part,
        defaultDays,
        currentCustomDays,
        inputDays,
      };
    }).sort((a, b) => a.machineLabel.localeCompare(b.machineLabel));
  }, [userParts, customFrequencies, localFrequencies]);

  const handleInputChange = (key: string, value: string) => {
    const numValue = value === "" ? null : parseInt(value, 10);
    
    if (numValue !== null && (isNaN(numValue) || numValue <= 0)) {
      // Ignore invalid input
      return;
    }

    setLocalFrequencies(prev => ({
      ...prev,
      [key]: numValue,
    }));
  };

  const handleSave = async (partKey: string, days: number | null) => {
    setIsSaving(true);
    
    const success = await updateFrequency(partKey, days);
    
    if (success) {
      // Clear local state for this key upon successful save
      setLocalFrequencies(prev => {
        const newState = { ...prev };
        delete newState[partKey];
        return newState;
      });
      refreshData(); // Refresh dashboard/tracker data
    }
    setIsSaving(false);
  };
  
  const handleReset = (partKey: string) => {
    // Resetting means setting the value to null (which triggers deletion in updateFrequency)
    handleSave(partKey, null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2" /> Frequency Management
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (userParts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2" /> Frequency Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No parts are currently tracked in your maintenance entries or inventory. Add an entry in the Maintenance Tracker tab first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wrench className="h-5 w-5 mr-2" /> Frequency Management
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Override the default replacement frequency (in days) for specific parts. This will affect future maintenance calculations.
        </p>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Machine / Part</TableHead>
                <TableHead className="w-[100px] text-center">Default (Days)</TableHead>
                <TableHead className="w-[100px] text-center">Current Custom (Days)</TableHead>
                <TableHead className="w-[150px]">Set New Frequency (Days)</TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partsWithFrequency.map((part) => {
                const isModified = part.inputDays !== part.currentCustomDays;
                const isDefault = part.currentCustomDays === null;
                
                return (
                  <TableRow key={part.uniqueKey}>
                    <TableCell className="font-medium">
                      {part.modelLabel}
                      <span className="text-xs text-muted-foreground block">({part.machineLabel} - {part.partTypeLabel})</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {part.defaultDays || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {part.currentCustomDays || 'Default'}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder={part.currentCustomDays ? String(part.currentCustomDays) : String(part.defaultDays || 30)}
                        value={part.inputDays === null ? "" : part.inputDays}
                        onChange={(e) => handleInputChange(part.uniqueKey, e.target.value)}
                        min="1"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {isModified && part.inputDays !== null ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleSave(part.uniqueKey, part.inputDays)}
                          disabled={isSaving || part.inputDays === null || part.inputDays <= 0}
                        >
                          <Save className="h-4 w-4 mr-2" /> Save
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReset(part.uniqueKey)}
                          disabled={isSaving || isDefault}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" /> Reset
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FrequencyManagement;