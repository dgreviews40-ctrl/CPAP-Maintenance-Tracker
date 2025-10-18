"use client";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import Settings from "./pages/Settings";
import Inventory from "./pages/Inventory";
import MachineManagement from "./pages/MachineManagement";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client"; // Import queryClient

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Use ProtectedRoute as a wrapper for routes that require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/machine-management" element={<MachineManagement />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;