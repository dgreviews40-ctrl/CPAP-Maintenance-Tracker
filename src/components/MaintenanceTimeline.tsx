"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar } from "lucide-react";
import { useUserParts } from "@/hooks/use-user-parts"; // Fixed import
import { parseMaintenanceMachineString } from "@/utils/parts";
import { differenceInDays, format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

// ... rest of the component