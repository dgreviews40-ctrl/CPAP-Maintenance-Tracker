"use client";

import { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "./Header";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col font-sans antialiased">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Toaster />
      </div>
    </TooltipProvider>
  );
};

export default Layout;