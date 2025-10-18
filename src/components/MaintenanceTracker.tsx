"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user"; // Fixed import
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, subDays, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const MaintenanceTracker = () => {
  const { user } = useUser(); // Correctly imported
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  
  // ... rest of the component code