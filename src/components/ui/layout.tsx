"use client";

import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {children}
    </main>
  );
};