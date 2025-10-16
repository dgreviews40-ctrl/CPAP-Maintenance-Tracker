"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";

interface Machine {
  id: number | string;
  name: string;
  description: string;
  image?: string;
}

interface MachineListProps {
  machines: Machine[];
}

const MachineList = ({ machines = [] }: MachineListProps) => {
  if (!machines || machines.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No machines to display.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {machines.map((machine) => (
        <Card key={machine.id} className="overflow-hidden flex flex-col">
          <div className="relative h-48 w-full bg-muted">
            {machine.image ? (
              <img
                src={machine.image}
                alt={machine.name}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // prevent infinite loop
                  target.src = "https://via.placeholder.com/400x225?text=Image+Not+Found";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Image className="w-12 h-12" />
              </div>
            )}
          </div>
          <CardHeader>
            <CardTitle className="text-lg">{machine.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              {machine.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MachineList;