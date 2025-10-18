"use client";

import Layout from "@/components/Layout";
import ProfileForm from "@/components/ProfileForm";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Profile = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/settings">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Settings
              </Button>
            </Link>
            <header className="text-center flex-grow">
              <h1 className="text-4xl font-bold">User Profile</h1>
              <p className="text-xl text-muted-foreground">
                Update your personal information.
              </p>
            </header>
            <div className="w-[150px]">
              {/* Spacer to balance the header */}
            </div>
          </div>
          <main>
            <ProfileForm />
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;