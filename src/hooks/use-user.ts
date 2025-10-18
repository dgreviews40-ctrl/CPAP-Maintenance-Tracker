"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth"; // Corrected import path

export const useUser = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // This hook is now largely redundant since useAuth provides the user object,
  // but we keep it for compatibility and to demonstrate fetching the user object directly if needed.
  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  return { user, loading };
};