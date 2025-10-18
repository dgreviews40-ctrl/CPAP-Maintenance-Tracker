"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Overview = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">This section will display key metrics and upcoming maintenance tasks.</p>
      </CardContent>
    </Card>
  );
};

export default Overview;