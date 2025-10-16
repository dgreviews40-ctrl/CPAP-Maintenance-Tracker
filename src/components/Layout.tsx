"use client";

import { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <TooltipProvider>
      <main className="min-h-screen font-sans antialiased">
        {children}
      </main>
      <Toaster />
    </TooltipProvider>
  );
};

export default Layout;