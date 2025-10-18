"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showError, showSuccess } from "@/utils/toast";

interface CustomImage {
  unique_part_key: string;
  image_url: string;
}

const fetchCustomImages = async (userId: string | undefined): Promise<Record<string, string>> => {
  if (!userId) return {};

  const { data, error } = await supabase
    .from("part_images")
    .select("unique_part_key, image_url");

  if (error) {
    console.error("Error fetching custom images:", error);
    throw new Error("Failed to load custom images.");
  }

  const map: Record<string, string> = {};
  data.forEach(item => {
    map[item.unique_part_key] = item.image_url;
  });
  return map;
};

export function useCustomPartImages() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: customImages = {}, isLoading } = useQuery<Record<string, string>>({
    queryKey: ['customPartImages', user?.id],
    queryFn: () => fetchCustomImages(user?.id),
    enabled: !authLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: async ({ uniqueKey, imageUrl }: { uniqueKey: string, imageUrl: string | null }) => {
      if (!user) throw new Error("User not logged in.");

      if (!imageUrl) {
        // Delete the custom image entry
        const { error } = await supabase
          .from("part_images")
          .delete()
          .eq("user_id", user.id)
          .eq("unique_part_key", uniqueKey);

        if (error) throw error;
        return { action: 'deleted', uniqueKey };
      }

      // Upsert the new image URL
      const upsertData = {
        user_id: user.id,
        unique_part_key: uniqueKey,
        image_url: imageUrl,
      };

      const { error } = await supabase
        .from("part_images")
        .upsert([upsertData], { onConflict: 'unique_part_key' });

      if (error) throw error;
      return { action: 'updated', uniqueKey, imageUrl };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['customPartImages'] });
      queryClient.invalidateQueries({ queryKey: ['userParts'] });
      
      if (result.action === 'deleted') {
        showSuccess("Image reset to default.");
      } else {
        showSuccess("Image URL saved successfully!");
      }
    },
    onError: (error) => {
      console.error("Error updating custom image:", error);
      showError("Failed to save image URL.");
    },
  });

  const updateImage = useCallback(async (uniqueKey: string, imageUrl: string | null) => {
    if (!user) {
      showError("You must be logged in to save custom images.");
      return false;
    }
    try {
      await mutation.mutateAsync({ uniqueKey, imageUrl });
      return true;
    } catch {
      return false;
    }
  }, [user, mutation]);

  return { customImages, loading: isLoading, updateImage };
}