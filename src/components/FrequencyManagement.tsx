"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import { Wrench } from "lucide-react";
import { useUserParts } from "@/hooks/use-user-parts"; // Import the new hook

// Define the structure for custom frequency settings
interface CustomFrequency {
  [uniqueKey: string]: number; // uniqueKey maps to custom days
}

const LOCAL_STORAGE_KEY = "cpap_custom_frequencies";

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
  const { userParts, loading } = useUserParts(); // Use the new hook
  const [customFrequencies, setCustomFrequencies] = useState<CustomFrequency>({});

  // 1. Load custom frequencies from local storage
  useEffect(() => {
    try {
      const storedFrequencies = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedFrequencies) {
        setCustomFrequencies(JSON.parse(storedFrequencies));
      }
    } catch (e) {
      console.error("Could not load custom frequencies from local storage", e);
    }
  }, []);

  // 2. Handle frequency change and save to local storage
  const handleFrequencyChange = useCallback((uniqueKey: string, days: number | string) => {
    const newDays = Number(days);
    
    setCustomFrequencies(prev => {
      const newFrequencies = { ...prev };
      if (newDays > 0) {
        newFrequencies[uniqueKey] = newDays;
      } else {
        delete newFrequencies[uniqueKey];
      }
      
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newFrequencies));
        showSuccess("Frequency updated!");
      } catch (e) {
        showError("Failed to save frequency.");
        console.error("Failed to save to local storage", e);
      }
      
      return newFrequencies;
    });
  }, []);

  if (loading) {
    return <p className="text-center">Loading user part data...</p>;
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
            const currentCustomDays = customFrequencies[part.uniqueKey] || "";

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
                      value={currentCustomDays}
                      onChange={(e) => handleFrequencyChange(part.uniqueKey, e.target.value)}
                      min="1"
                    />
                    {currentCustomDays && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleFrequencyChange(part.uniqueKey, "")}
                        title="Reset to default"
                      >
                        Reset
                      </Button>
                    )}
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