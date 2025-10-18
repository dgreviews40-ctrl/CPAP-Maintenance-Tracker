"use client";

import React, { useEffect } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import DashboardTabs from "@/components/DashboardTabs";
import MaintenanceSchedule from "@/components/MaintenanceSchedule"; // Use MaintenanceSchedule for Overview
import MaintenanceLog from "@/components/MaintenanceLog"; // Use MaintenanceLog for Maintenance tab
import Inventory from "@/components/Inventory"; // Use Inventory for Inventory tab
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon } from "lucide-react";

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
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', 'overview');
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  }, [searchParams, navigate, location.pathname]);

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <DashboardTabs /> 

          <div className="mt-6">
            {/* Overview Tab: Contains the schedule and low inventory widget */}
            <TabsContent value="overview">
              <MaintenanceSchedule />
            </TabsContent>
            
            {/* Maintenance Tab: Contains the form and the list/tracker */}
            <TabsContent value="maintenance">
              <MaintenanceLog />
            </TabsContent>
            
            {/* Inventory Tab: Contains the full inventory management */}
            <TabsContent value="inventory">
              <Inventory />
            </TabsContent>
            
            {/* Settings Tab: Contains a link to the main settings page */}
            <TabsContent value="settings">
              <div className="flex justify-center p-10">
                <Link to="/settings">
                  <Button size="lg">
                    <SettingsIcon className="h-5 w-5 mr-2" /> Go to Settings Hub
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;