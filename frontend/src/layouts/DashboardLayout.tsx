//src/layouts/DashboardLayout.tsx
import React, { useState } from "react";
import Navigation from "@/components/dashboard/panels/Navigation";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { motion } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import type { AuthUser as User } from "@/services/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, logout } = useAuth();

  // Cast user to match Navigation component's User type
  const navigationUser = user as User | null;

  return (
    <motion.div
      className="min-h-screen bg-black text-white font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ParticleBackground variant="minimal" />

      <div className="flex">
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={navigationUser}
          onLogout={logout}
        />
        <main className="flex-1 flex items-start justify-center p-8">
          <div className="w-full max-w-4xl border border-emerald-800 rounded-md bg-black px-6 py-8 shadow-lg">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default DashboardLayout;
