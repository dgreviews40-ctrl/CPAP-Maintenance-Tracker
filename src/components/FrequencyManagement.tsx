"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wrench, Loader2 } from "lucide-react";
import { useUserParts } from "@/hooks/use-user-parts";
import { useCustomFrequencies } from "@/hooks/use-custom-frequencies"; // Import the new hook

// Helper to get default frequency (copied from MaintenanceForm for consistency)
const getMaintenanceFrequencyDays = (partTypeLabel: string): number | null => {
  const lowerCaseLabel = partTypeLabel.toLowerCase();
  
  if (lowerCaseLabel.includes("filter")) {
    if (lowerCaseLabel.includes("disposable")) return 30;
    if (lowerCaseLabel.includes("reusable")) return 90;
    return 30; 
  }
  
  if (lowerCaseLabel.includes("tubing") || lowerCaseLabel.includes("hose")) {
    return 90;
  }
  
  if (lowerCaseLabel.includes("mask") || lowerCaseLabel.includes("cushion") || lowerCaseLabel.includes("pillow")) {
    return 30;
  }

  if (lowerCaseLabel.includes("chamber") || lowerCaseLabel.includes("tank")) {
    return 180;
  }

  if (lowerCaseLabel.includes("headgear") || lowerCaseLabel.includes("frame")) {
    return 180;
  }

  return null;
};

const FrequencyManagement = () => {
  const { userParts, loading: loadingParts } = useUserParts();
  const { frequencies, loading: loadingFrequencies, updateFrequency } = useCustomFrequencies();
  
  // Local state to manage input values before saving (improves UX)
  const [inputFrequencies, setInputFrequencies] = useState<Record<string, number | string>>({});

  useEffect(() => {
    // Initialize local input state from fetched frequencies
    const initialInputs: Record<string, number | string> = {};
    userParts.forEach(part => {
      initialInputs[part.uniqueKey] = frequencies[part.uniqueKey] || "";
    });
    setInputFrequencies(initialInputs);
  }, [userParts, frequencies]);

  const handleInputChange = (uniqueKey: string, value: string) => {
    setInputFrequencies(prev => ({
      ...prev,
      [uniqueKey]: value,
    }));
  };

  const handleSave = async (uniqueKey: string) => {
    const value = inputFrequencies[uniqueKey];
    const days = Number(value);
    
    if (days > 0) {
      await updateFrequency(uniqueKey, days);
    } else {
      // If input is cleared or invalid, reset to default (delete entry)
      await updateFrequency(uniqueKey, null);
      setInputFrequencies(prev => {
        const newInputs = { ...prev };
        newInputs[uniqueKey] = "";
        return newInputs;
      });
    }
  };
  
  const handleReset = async (uniqueKey: string) => {
    await updateFrequency(uniqueKey, null);
    setInputFrequencies(prev => ({
      ...prev,
      [uniqueKey]: "",
    }));
  };

  const loading = loadingParts || loadingFrequencies;

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2" /> Part Replacement Frequency Customization
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2" /> Part Replacement Frequency Customization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Start by adding a maintenance entry or a spare part to your inventory. Once you use a part, it will appear here for customization.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wrench className="h-5 w-5 mr-2" /> Part Replacement Frequency Customization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">
          Below is a list of parts you have used or tracked in your inventory. You can override the default replacement frequency (in days) for any part.
        </p>

        <div className="space-y-6">
          {userParts.map((part) => {
            const defaultDays = getMaintenanceFrequencyDays(part.partTypeLabel);
            const currentInputValue = inputFrequencies[part.uniqueKey] ?? "";
            const isCustom = frequencies.hasOwnProperty(part.uniqueKey);

            return (
              <div key={part.uniqueKey} className="border p-4 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-2">
                  <h4 className="font-semibold">{part.modelLabel} ({part.partTypeLabel})</h4>
                  <p className="text-sm text-muted-foreground">
                    Machine: {part.machineLabel}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    SKU: {part.reorderInfo}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor={`default-${part.uniqueKey}`} className="text-xs">Default Frequency</Label>
                  <Input
                    id={`default-${part.uniqueKey}`}
                    value={defaultDays ? `${defaultDays} days` : "N/A"}
                    disabled
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`custom-${part.uniqueKey}`} className="text-xs">Custom Frequency (Days)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id={`custom-${part.uniqueKey}`}
                      type="number"
                      placeholder={defaultDays ? `Override ${defaultDays}` : "Enter days"}
                      value={currentInputValue}
                      onChange={(e) => handleInputChange(part.uniqueKey, e.target.value)}
                      min="1"
                    />
                    <Button 
                      variant={isCustom ? "destructive" : "default"}
                      onClick={() => isCustom ? handleReset(part.uniqueKey) : handleSave(part.uniqueKey)}
                      disabled={!currentInputValue && !isCustom}
                      title={isCustom ? "Reset to default" : "Save Custom Frequency"}
                    >
                      {isCustom ? "Reset" : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default FrequencyManagement;