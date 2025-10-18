"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { showError, showSuccess } from "@/utils/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Map: unique_part_key -> frequency_days
type CustomFrequenciesMap = Record<string, number>;

const fetchFrequencies = async (userId: string | undefined): Promise<CustomFrequenciesMap> => {
  if (!userId) return {};

  const { data, error } = await supabase
    .from("custom_frequencies")
    .select("unique_part_key, frequency_days");

  if (error) {
    console.error("Error fetching custom frequencies:", error);
    throw new Error("Failed to load custom frequencies.");
  }

  const map: CustomFrequenciesMap = {};
  data.forEach(item => {
    map[item.unique_part_key] = item.frequency_days;
  });
  return map;
};

export function useCustomFrequencies() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: frequencies = {}, isLoading } = useQuery<CustomFrequenciesMap>({
    queryKey: ['customFrequencies', user?.id],
    queryFn: () => fetchFrequencies(user?.id),
    enabled: !authLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: async ({ uniqueKey, days }: { uniqueKey: string, days: number | null }) => {
      if (!user) throw new Error("User not logged in.");

      if (days === null || days <= 0) {
        // Delete the custom frequency entry
        const { error } = await supabase
          .from("custom_frequencies")
          .delete()
          .eq("user_id", user.id)
          .eq("unique_part_key", uniqueKey);

        if (error) throw error;
        return { action: 'deleted', uniqueKey };
      }

      // Upsert the new frequency
      const upsertData = {
        user_id: user.id,
        unique_part_key: uniqueKey,
        frequency_days: days,
      };

      const { error } = await supabase
        .from("custom_frequencies")
        .upsert([upsertData], { onConflict: 'user_id, unique_part_key' });

      if (error) throw error;
      return { action: 'updated', uniqueKey, days };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['customFrequencies'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceHistory'] });
      
      if (result.action === 'deleted') {
        showSuccess("Frequency reset to default.");
      } else {
        showSuccess("Frequency updated successfully!");
      }
    },
    onError: (error) => {
      console.error("Error updating custom frequency:", error);
      showError("Failed to save frequency.");
    },
  });

  const updateFrequency = useCallback(async (uniqueKey: string, days: number | null) => {
    if (!user) {
      showError("You must be logged in to save custom frequencies.");
      return false;
    }
    try {
      await mutation.mutateAsync({ uniqueKey, days });
      return true;
    } catch {
      return false;
    }
  }, [user, mutation]);

  return { frequencies, loading: isLoading, updateFrequency };
}