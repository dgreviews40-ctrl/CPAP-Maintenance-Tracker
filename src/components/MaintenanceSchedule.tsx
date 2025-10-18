"use client";

import MaintenanceTracker from "@/components/MaintenanceTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MaintenanceSchedule = () => {
  return (
    <div id="tracker">
      <MaintenanceTracker />
    </div>
  );
};

export default MaintenanceSchedule;