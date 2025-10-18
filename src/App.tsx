"use client";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import { ProfileProvider } from "./hooks/useProfile";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import MachineManagement from "./pages/MachineManagement";
import Reports from "./pages/Reports";
import PartDetail from "./pages/PartDetail";
import NotFound from "./pages/NotFound"; // Added import
import ToastProvider from "./components/ToastProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ToastProvider />
        <AuthProvider>
          <ProfileProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Index />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/machine-management" element={<MachineManagement />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/part/:uniqueKey" element={<PartDetail />} />
              </Route>
              
              {/* Catch-all for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ProfileProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;