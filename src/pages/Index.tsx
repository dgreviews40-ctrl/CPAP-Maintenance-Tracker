"use client";

import React, { useEffect } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import DashboardTabs from "@/components/DashboardTabs";
import Overview from "@/components/Overview";
import MaintenanceLog from "@/components/MaintenanceLog";
import Inventory from "@/components/Inventory";
import Settings from "@/components/Settings";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const activeTab = searchParams.get('tab') || 'overview';

  // Function to handle tab change by updating URL
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // Ensure default tab is set in URL on initial load
  useEffect(() => {
    if (!searchParams.get('tab')) {
      // Use replace to avoid polluting history with the default tab
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', 'overview');
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  }, [searchParams, navigate, location.pathname]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Tabs component manages the context, using URL state */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* DashboardTabs now only renders the TabsList and Triggers */}
        <DashboardTabs /> 

        <div className="mt-6">
          <TabsContent value="overview">
            <Overview />
          </TabsContent>
          <TabsContent value="maintenance">
            <MaintenanceLog />
          </TabsContent>
          <TabsContent value="inventory">
            <Inventory />
          </TabsContent>
          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Index;