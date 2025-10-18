"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Loader2 } from "lucide-react";
import { useUserParts } from "@/hooks/use-user-parts"; // Remove this line
import { useCustomFrequencies } from "@/hooks/use-custom-frequencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ... rest of the component