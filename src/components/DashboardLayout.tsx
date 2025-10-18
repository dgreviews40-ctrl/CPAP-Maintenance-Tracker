"use client";

import { PropsWithChildren, ReactNode } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "react-resizable-panels";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardLayoutProps extends PropsWithChildren {
  sidebar: ReactNode;
}

const DashboardLayout = ({ children, sidebar }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    // On mobile, stack the sidebar content above the main content
    return (
      <div className="flex flex-col space-y-6">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          {sidebar}
        </div>
        <div className="p-4">{children}</div>
      </div>
    );
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[calc(100vh-120px)] w-full border rounded-lg"
    >
      <ResizablePanel defaultSize={70} minSize={50}>
        <ScrollArea className="h-full p-6">
          {children}
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
        <ScrollArea className="h-full p-6 bg-muted/20">
          <div className="space-y-6">
            {sidebar}
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default DashboardLayout;