"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAllMachines, Machine } from "@/hooks/use-all-machines";
import { Loader2, Settings, Package, CheckCircle, User } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const MachineConfiguration = () => {
  const { allMachines, loading } = useAllMachines();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (allMachines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" /> Machine Configurations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No machine configurations found. Add a maintenance entry or a custom machine part to start tracking.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Helper to determine if a machine is custom (by checking if any part is custom)
  const isMachineCustom = (machine: Machine) => {
    return machine.parts.some(partType => 
      partType.models.some(model => 
        model.reorder_info === 'N/A' || model.reorder_info === null
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" /> All Tracked Machine Configurations
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          A comprehensive list of all default and custom machines and their associated parts available for maintenance tracking.
        </p>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {allMachines.map((machine) => (
            <AccordionItem key={machine.value} value={machine.value}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="font-semibold text-lg">{machine.label}</span>
                  <Badge variant="secondary" className="ml-4">
                    {machine.parts.length} Part Types
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-muted/20 border-t">
                <div className="space-y-4">
                  {machine.parts.map((partType) => (
                    <div key={partType.value} className="border p-3 rounded-lg bg-card">
                      <h4 className="font-medium text-primary mb-2 flex items-center">
                        <Package className="h-4 w-4 mr-2" /> {partType.label}
                      </h4>
                      <Separator className="mb-2" />
                      <ul className="space-y-2 text-sm">
                        {partType.models.map((model) => {
                          const isCustom = model.reorder_info === 'N/A' || model.reorder_info === null;
                          const uniqueKey = `${machine.label}|${partType.label}|${model.label}`;
                          
                          return (
                            <li key={model.value} className="flex justify-between items-start">
                              <div className="flex flex-col">
                                <Link to={`/part/${encodeURIComponent(uniqueKey)}`} className="font-medium hover:underline">
                                  {model.label}
                                </Link>
                                <span className="text-xs text-muted-foreground">
                                  SKU: {model.reorder_info || 'N/A'}
                                </span>
                              </div>
                              <Badge 
                                variant={isCustom ? "outline" : "default"} 
                                className={cn(isCustom ? "border-dashed border-primary/50 text-primary/80" : "bg-green-600 hover:bg-green-700")}
                              >
                                {isCustom ? <User className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                                {isCustom ? "Custom Part" : "Default Part"}
                              </Badge>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default MachineConfiguration;