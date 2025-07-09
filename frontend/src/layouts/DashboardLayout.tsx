// src/layouts/DashboardLayout.tsx
import React, { useState, useEffect, useRef } from "react";               // ← added useEffect
import Navigation from "@/components/dashboard/panels/Navigation";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { motion } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { TerminalProvider, useTerminal } from "@/contexts/TerminalContext";  // ← added useTerminal
import MycoCore from "@/agents/Mycocore";
import type { AuthUser as User } from "@/services/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const BootLogger: React.FC = () => {
  const { push } = useTerminal();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    push("Initializing Hyphae dashboard...");
    const t1 = setTimeout(
      () => push("Loading modules: Overview, Metrics, Weather"),
      800
    );
    const t2 = setTimeout(() => push("System monitors active"), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [push]);
  return null;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, logout, loading } = useAuth();
  const navigationUser = user as User | null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white font-mono">
        Loading…
      </div>
    );
  }

  return (
    <TerminalProvider>
      <BootLogger />

      <motion.div
        className="min-h-screen pb-40 bg-black text-white font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <ParticleBackground variant="minimal" />

        <div className="flex h-full">
          <Navigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={navigationUser}
            onLogout={logout}
          />
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto border border-emerald-800 rounded-md bg-black px-6 py-8 shadow-lg">
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
          </main>
        </div>

        {/* unified system/UI console + MycoCore events */}
        <MycoCore />
      </motion.div>
    </TerminalProvider>
  );
};

export default DashboardLayout;
