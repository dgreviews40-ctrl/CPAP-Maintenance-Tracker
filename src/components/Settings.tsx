"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">This section will contain user and application configuration settings.</p>
      </CardContent>
    </Card>
  );
};

export default Settings;