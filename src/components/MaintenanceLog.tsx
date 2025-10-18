"use client";

import MaintenanceTracker from "@/components/MaintenanceTracker";

const MaintenanceLog = () => {
  // Note: MaintenanceTracker handles both adding entries and listing the log.
  return (
    <div id="log">
      <MaintenanceTracker />
    </div>
  );
};

export default MaintenanceLog;