"use client";

import Layout from "@/components/Layout";
import MachineConfiguration from "@/components/MachineConfiguration";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";

const MachineConfigurationPage = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/settings">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Settings
              </Button>
            </Link>
            <header className="text-center flex-grow">
              <h1 className="text-4xl font-bold">Machine Configurations</h1>
              <p className="text-xl text-muted-foreground">
                View all default and custom machines and their parts.
              </p>
            </header>
            <div className="w-[150px]">
              {/* Spacer to balance the header */}
            </div>
          </div>
          <main>
            <MachineConfiguration />
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default MachineConfigurationPage;