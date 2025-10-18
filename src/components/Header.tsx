"use client";

import { Wind, Settings } from "lucide-react";
import UserNav from "./UserNav";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom"; // Import Link

const Header = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Wind className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-xl font-bold text-foreground">
            CPAP Maintenance Tracker
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
};

export default Header;