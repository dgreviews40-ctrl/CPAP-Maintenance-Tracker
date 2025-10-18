"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { parseMaintenanceMachineString } from "@/utils/parts";

export interface UserPart {
  uniqueKey: string;
  machineLabel: string;
  partTypeLabel: string;
  modelLabel: string;
}

const useUserParts = () => {
  const [userParts, setUserParts] = useState<UserPart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserParts = async () => {
      const { data, error } = await supabase
        .from("maintenance_entries")
        .select("machine")
        .order("last_maintenance", { ascending: false });

      if (error) {
        console.error("Error fetching maintenance entries:", error);
        setLoading(false);
        return;
      }

      const uniquePartsMap = new Map<string, UserPart>();

      data.forEach((entry) => {
        const { machineLabel, partTypeLabel, modelLabel } = parseMaintenanceMachineString(entry.machine);
        if (!machineLabel || !partTypeLabel || !modelLabel) return;

        const uniqueKey = `${machineLabel}|${partTypeLabel}|${modelLabel}`;
        if (!uniquePartsMap.has(uniqueKey)) {
          uniquePartsMap.set(uniqueKey, {
            uniqueKey,
            machineLabel,
            partTypeLabel,
            modelLabel
          });
        }
      });

      setUserParts(Array.from(uniquePartsMap.values()));
      setLoading(false);
    };

    fetchUserParts();
  }, []);

  return { userParts, loading };
};

export default useUserParts;