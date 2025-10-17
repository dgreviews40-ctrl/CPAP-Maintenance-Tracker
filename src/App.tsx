"use client";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute element={<Index />} />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;