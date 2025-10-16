"use client";

import { Wind } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <Wind className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-xl font-bold text-foreground">
          CPAP Maintenance Tracker
        </h1>
      </div>
    </header>
  );
};

export default Header;