"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Image } from "lucide-react";

const MachineList = ({ machines }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {machines.map((machine) => (
        <Card key={machine.id} className="overflow-hidden">
          <CardContent>
            <div className="relative h-48">
              {machine.image ? (
                <img
                  src={machine.image}
                  alt={machine.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/400x225?text=No+Image";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Image className="w-8 h-8" />
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {machine.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MachineList;