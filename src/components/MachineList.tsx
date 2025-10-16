"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


const MachineList = () => {
  const machines = [
    {
      id: "philips",
      name: "Philips Respironics DreamStation",
      description: "Advanced CPAP machine with smart sleep tracking and noise reduction.",
      image: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Philips_DreamStation_2017.jpg"
    },
    {
      id: "medtronic",
      name: "Medtronic S90",
      description: "Smart CPAP with adaptive pressure and built-in sleep tracking.",
      image: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Medtronic_S90.jpg"
    },
    {
      id: "resmed",
      name: "ResMed S9",
      description: "High-quality CPAP with advanced airflow control and comfort features.",
      image: "https://upload.wikimedia.org/wikipedia/commons/5/5e/ResMed_S9.jpg"
    },
    {
      id: "dual",
      name: "Dual CPAP Machine",
      description: "Dual-purpose CPAP with adjustable pressure settings and portability.",
      image: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Dual_CPAP_Machine.jpg"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {machines.map((machine) => (
        <Card key={machine.id} className="overflow-hidden">
          <CardHeader>
            <CardTitle>{machine.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <img src={machine.image} alt={machine.name} className="w-full h-48 object-cover" />
            <p className="mt-2 text-sm text-muted-foreground">{machine.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MachineList;