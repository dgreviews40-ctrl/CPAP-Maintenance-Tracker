"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";
import { showError, showSuccess } from "@/utils/toast";

interface CustomFrequencyItem {
  id: string;
  unique_part_key: string;
  frequency_days: number;
}

// Map: unique_part_key -> frequency_days
type CustomFrequenciesMap = Record<string, number>;

export function useCustomFrequencies() {
  const { user, loading: authLoading } = useAuth();
  const [frequencies, setFrequencies] = useState<CustomFrequenciesMap>({});
  const [loading, setLoading] = useState(true);

  const fetchFrequencies = useCallback(async () => {
    if (!user) {
      setFrequencies({});
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase
      .from("custom_frequencies")
      .select("id, unique_part_key, frequency_days");

    if (error) {
      console.error("Error fetching custom frequencies:", error);
      showError("Failed to load custom frequencies.");
      setFrequencies({});
    } else if (data) {
      const map: CustomFrequenciesMap = {};
      data.forEach(item => {
        map[item.unique_part_key] = item.frequency_days;
      });
      setFrequencies(map);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchFrequencies();
    }
  }, [authLoading, fetchFrequencies]);

  const updateFrequency = useCallback(async (uniqueKey: string, days: number | null) => {
    if (!user) {
      showError("You must be logged in to save custom frequencies.");
      return false;
    }

    if (days === null || days <= 0) {
      // Delete the custom frequency entry
      const { error } = await supabase
        .from("custom_frequencies")
        .delete()
        .eq("user_id", user.id)
        .eq("unique_part_key", uniqueKey);

      if (error) {
        console.error("Error deleting custom frequency:", error);
        showError("Failed to reset frequency.");
        return false;
      }
      
      setFrequencies(prev => {
        const newFrequencies = { ...prev };
        delete newFrequencies[uniqueKey];
        return newFrequencies;
      });
      showSuccess("Frequency reset to default.");
      return true;
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

    if (error) {
      console.error("Error updating custom frequency:", error);
      showError("Failed to save frequency.");
      return false;
    }

    setFrequencies(prev => ({
      ...prev,
      [uniqueKey]: days,
    }));
    showSuccess("Frequency updated successfully!");
    return true;
  }, [user]);

  return { frequencies, loading, updateFrequency, fetchFrequencies };
}