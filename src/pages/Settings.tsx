"use client";

import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { User, Wrench, BarChart3, Bell, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import NotificationCenter from "@/components/NotificationCenter";
import FrequencyManagement from "@/components/FrequencyManagement";
import { Button } from "@/components/ui/button"; // Import Button

interface SettingLinkProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SettingLink = ({ to, icon, title, description }: SettingLinkProps) => (
  <Link to={to} className="block hover:bg-muted/50 transition-colors rounded-lg">
    <div className="flex items-center p-4">
      <div className="p-3 bg-primary/10 text-primary rounded-full mr-4">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  </Link>
);

const Settings = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
            <header className="text-center flex-grow">
              <h1 className="text-4xl font-bold">Application Settings</h1>
              <p className="text-xl text-muted-foreground">
                Configure your account, machines, and preferences.
              </p>
            </header>
            <div className="w-[150px]">
              {/* Spacer to balance the header */}
            </div>
          </div>
          <main className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account & Machine Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <SettingLink
                  to="/profile"
                  icon={<User className="h-5 w-5" />}
                  title="User Profile"
                  description="Update your name, email, and avatar."
                />
                <Separator />
                <SettingLink
                  to="/machine-management"
                  icon={<Wrench className="h-5 w-5" />}
                  title="Machine & Part Management"
                  description="Add custom CPAP machines and parts."
                />
              </CardContent>
            </Card>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Advanced Maintenance Settings</h2>
              <div className="space-y-6">
                <FrequencyManagement />
                <NotificationCenter />
              </div>
            </section>
            
            <Card>
              <CardHeader>
                <CardTitle>Data & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <SettingLink
                  to="/analytics"
                  icon={<BarChart3 className="h-5 w-5" />}
                  title="Reports & Analytics"
                  description="View usage charts, inventory status, and replacement history."
                />
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;