"use client";

import Layout from "@/components/Layout";
import PartDetailView from "@/components/PartDetailView";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PartDetail = () => {
  const { uniqueKey } = useParams<{ uniqueKey: string }>();

  if (!uniqueKey) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <Card>
            <CardHeader><CardTitle>Error</CardTitle></CardHeader>
            <CardContent>Invalid part key provided.</CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Decode the key for display purposes (keys use '|' separator)
  const [machineLabel, partTypeLabel, modelLabel] = uniqueKey.split('|');
  const partTitle = `${modelLabel} (${machineLabel} - ${partTypeLabel})`;

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
            <header className="text-center flex-grow">
              <h1 className="text-4xl font-bold">Part Detail View</h1>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto truncate" title={partTitle}>
                {partTitle}
              </p>
            </header>
            <div className="w-[150px]">
              {/* Spacer to balance the header */}
            </div>
          </div>
          <main>
            <PartDetailView uniqueKey={uniqueKey} />
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default PartDetail;