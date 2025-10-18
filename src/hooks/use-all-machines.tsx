"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { cpapMachines } from "@/data/cpap-machines";
import { useQuery, QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

export interface PartModel {
  value: string;
  label: string;
  reorder_info: string;
}

export interface PartType {
  value: string;
  label: string;
  image_url?: string; // Added image_url
  models: PartModel[];
}

export interface Machine {
  value: string;
  label: string;
  parts: PartType[];
}

const fetchAllMachines = async (userId: string | undefined): Promise<Machine[]> => {
  // Start with a deep copy of hardcoded machines
  const machineMap = new Map<string, Machine>();
  cpapMachines.forEach(m => machineMap.set(m.label, JSON.parse(JSON.stringify(m))));

  if (!userId) {
    return Array.from(machineMap.values());
  }
  
  const { data, error } = await supabase
    .from("user_machines")
    .select("machine_label, part_type_label, part_model_label, reorder_info");

  if (error) {
    console.error("Error fetching custom machines:", error);
    // Fallback to just hardcoded machines
    return Array.from(machineMap.values());
  }

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
        image_url: "/placeholder.svg", // Default image for custom parts
        models: [],
      };
      machine.parts.push(partTypeEntry);
    }
    
    // Check if model already exists (to prevent duplicates if a default machine is customized)
    if (!partTypeEntry.models.some(m => m.label === partModelLabel)) {
      // Add custom model
      partTypeEntry.models.push({
        value: partModelValue,
        label: partModelLabel,
        reorder_info: item.reorder_info || 'N/A',
      });
    }
  });

  return Array.from(machineMap.values());
};

export function useAllMachines() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: allMachines = cpapMachines, isLoading, refetch } = useQuery<Machine[]>({
    queryKey: queryKeys.machines.all(user?.id || 'anonymous'),
    queryFn: () => fetchAllMachines(user?.id),
    enabled: !authLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { allMachines, loading: isLoading, refetchMachines: refetch };
}