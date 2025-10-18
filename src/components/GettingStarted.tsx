"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Sparkles } from "lucide-react";

interface GettingStartedProps {
  onSeedClick: () => void;
  isSeeding: boolean;
}

const GettingStarted = ({ onSeedClick, isSeeding }: GettingStartedProps) => {
  return (
    <Card className="mb-8 bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Info className="h-5 w-5 mr-2 text-primary" />
          Welcome! Your Dashboard is Ready
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          To see your charts and timeline in action, you can either add your first maintenance record below or load some sample data to explore the features.
        </p>
        <Button onClick={onSeedClick} disabled={isSeeding}>
          <Sparkles className="h-4 w-4 mr-2" />
          {isSeeding ? "Loading..." : "Load Sample Data"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GettingStarted;