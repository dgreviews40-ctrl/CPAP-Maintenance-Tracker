"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { cpapMachines } from "@/data/cpap-machines";

interface PartModel {
  value: string;
  label: string;
  reorder_info: string;
}

interface PartType {
  value: string;
  label: string;
  models: PartModel[];
}

interface Machine {
  value: string;
  label: string;
  parts: PartType[];
}

export function useAllMachines() {
  const { user, loading: authLoading } = useAuth();
  const [allMachines, setAllMachines] = useState<Machine[]>(cpapMachines);
  const [loading, setLoading] = useState(true);

  const fetchCustomMachines = useCallback(async () => {
    if (!user) {
      setAllMachines(cpapMachines);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase
      .from("user_machines")
      .select("machine_label, part_type_label, part_model_label, reorder_info");

    if (error) {
      console.error("Error fetching custom machines:", error);
      // Fallback to just hardcoded machines
      setAllMachines(cpapMachines);
      setLoading(false);
      return;
    }

    // Start with a deep copy of hardcoded machines
    const machineMap = new Map<string, Machine>();
    cpapMachines.forEach(m => machineMap.set(m.label, JSON.parse(JSON.stringify(m))));

    // Process custom data
    data.forEach(item => {
      const machineLabel = item.machine_label;
      const partTypeLabel = item.part_type_label;
      const partModelLabel = item.part_model_label;
      
      const machineValue = machineLabel.toLowerCase().replace(/\s/g, '-');
      const partTypeValue = partTypeLabel.toLowerCase().replace(/\s/g, '-');
      const partModelValue = partModelLabel.toLowerCase().replace(/\s/g, '-');

      if (!machineMap.has(machineLabel)) {
        // New custom machine
        machineMap.set(machineLabel, {
          value: machineValue,
          label: machineLabel,
          parts: [],
        });
      }

      const machine = machineMap.get(machineLabel)!;
      let partTypeEntry = machine.parts.find(p => p.label === partTypeLabel);

      if (!partTypeEntry) {
        partTypeEntry = {
          value: partTypeValue,
          label: partTypeLabel,
          models: [],
        };
        machine.parts.push(partTypeEntry);
      }
      
      // Add custom model
      partTypeEntry.models.push({
        value: partModelValue,
        label: partModelLabel,
        reorder_info: item.reorder_info || 'N/A',
      });
    });

    setAllMachines(Array.from(machineMap.values()));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchCustomMachines();
    }
  }, [authLoading, fetchCustomMachines]);

  return { allMachines, loading, refetchMachines: fetchCustomMachines };
}