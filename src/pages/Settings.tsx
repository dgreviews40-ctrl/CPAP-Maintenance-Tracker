"use client";

import Layout from "@/components/Layout";
import ProfileForm from "@/components/ProfileForm";

const Settings = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold">Account Settings</h1>
          <p className="text-xl text-muted-foreground">
            Update your profile and preferences.
          </p>
        </header>
        <main className="w-full max-w-4xl mx-auto">
          <ProfileForm />
        </main>
      </div>
    </Layout>
  );
};

export default Settings;