"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PartManagement = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Part Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This section will allow you to view and manage details about specific CPAP parts, including their recommended replacement schedules and reorder information.
        </p>
        <div className="mt-4 p-4 border rounded-lg bg-secondary">
          <h3 className="font-semibold mb-2">Coming Soon:</h3>
          <ul className="list-disc list-inside text-sm text-secondary-foreground">
            <li>View all parts associated with your tracked machines.</li>
            <li>Customize replacement frequencies per part.</li>
            <li>Direct links to reorder parts based on SKU.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartManagement;