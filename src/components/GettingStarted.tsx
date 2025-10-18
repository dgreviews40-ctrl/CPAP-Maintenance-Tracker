"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ArrowDown } from "lucide-react";

const GettingStarted = () => {
  return (
    <Card className="mb-8 bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Info className="h-5 w-5 mr-2 text-primary" />
          Welcome! Let's Get Started
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-muted-foreground">
          Your dashboard is ready. To see your charts and timeline, you'll need to add at least one maintenance record.
        </p>
        <p className="font-semibold flex items-center">
          Use the "Add New Maintenance Entry" form below to log your first part replacement.
          <ArrowDown className="h-5 w-5 ml-2 animate-bounce" />
        </p>
      </CardContent>
    </Card>
  );
};

export default GettingStarted;