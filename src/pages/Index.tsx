"use client";

import MaintenanceTracker from "@/components/MaintenanceTracker";

const Index = () => {
  return (
    <div className="container mx-auto p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold">CPAP Maintenance Tracker</h1>
        <p className="text-xl text-muted-foreground">
          Keep your CPAP machine running smoothly.
        </p>
      </header>
      <main>
        <MaintenanceTracker />
      </main>
    </div>
  );
};

export default Index;