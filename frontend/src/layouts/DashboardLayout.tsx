// src/layouts/DashboardLayout.tsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/dashboard/panels/Navigation";
import { motion } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import MycoCore from "@/agents/mycocore/Mycocore";
import type { UserProfile } from "@/services/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  __debug?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const instanceId = React.useRef(Math.random().toString(36).slice(2, 10));
  React.useEffect(() => {
    console.log("[DEBUG] DashboardLayout mounted, id:", instanceId.current);
    return () => {
      console.log("[DEBUG] DashboardLayout unmounted, id:", instanceId.current);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<string>("overview");
  const { user, logout, loading } = useAuth();
  const navigationUser = user as UserProfile | null;
  const location = useLocation();

  function handleLogout() {
    if (user?.id != null) {
      sessionStorage.removeItem(`mycocore-connected-${user.id}`);
    }
    logout();
  }

  useEffect(() => {
    const seg = location.pathname.split("/")[1] || "overview";
    setActiveTab(seg);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white font-mono">
        Loading…
      </div>
    );
  }

  return (
    <motion.div
      className="relative flex min-h-screen bg-gray-900 text-white font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Sidebar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={navigationUser}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto flex justify-center">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      <ErrorBoundary>
        <MycoCore />
      </ErrorBoundary>
    </motion.div>
  );
};

export default DashboardLayout;
