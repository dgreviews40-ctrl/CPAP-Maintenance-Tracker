"use client";

import React, { useEffect } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import DashboardTabs from "@/components/DashboardTabs";
import MaintenanceLog from "@/components/MaintenanceLog";
import Inventory from "@/components/Inventory";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon } from "lucide-react";

// Dashboard Components
import DashboardSummary from "@/components/DashboardSummary";
import InventoryAlert from "@/components/InventoryAlert";
import UpcomingTasks from "@/components/UpcomingTasks";
import PartTypeBreakdownChart from "@/components/PartTypeBreakdownChart";
import MachineHealthScore from "@/components/MachineHealthScore";
import MaintenanceTimelineChart from "@/components/MaintenanceTimelineChart"; // Replaced InventoryStatusChart


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
            {/* Overview Tab: Restored full dashboard view */}
            <TabsContent value="overview" className="space-y-6">
              <InventoryAlert />
              <DashboardSummary />
              
              {/* Upcoming Tasks now takes full width */}
              <UpcomingTasks />
              
              {/* Adjusted grid to only contain the remaining two components */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MachineHealthScore />
                <PartTypeBreakdownChart />
              </div>
              
              <MaintenanceTimelineChart /> {/* New Timeline Chart */}
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