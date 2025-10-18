"use client";

import { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "./Header";
import { MadeWithDyad } from "./made-with-dyad"; // Import the component

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col font-sans antialiased">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="border-t border-border mt-8">
          <MadeWithDyad />
        </footer>
        <Toaster />
      </div>
    </TooltipProvider>
  );
};

export default Layout;