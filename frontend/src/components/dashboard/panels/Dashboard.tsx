import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "./Navigation";
import Overview from "./Overview";
import MemoryVault from "@/components/dashboard/panels/MemoryVault/index";
import Settings from "@/components/dashboard/panels/settings/SettingsIndex";
import Neuroweave from "@/agents/Neuroweave";
import Sporelink from "@/agents/Sporelink";
import Rootbloom from "@/agents/Rootbloom";
import { useAuth } from "@/hooks/useAuth";
import ParticleBackground from "@/components/ui/ParticleBackground";

type TabType =
  | "overview"
  | "neuroweave"
  | "sporelink"
  | "rootbloom"
  | "memory"
  | "settings";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const { user } = useAuth();

  const tabComponents = {
    overview: <Overview onLogout={onLogout} />,
    neuroweave: <Neuroweave />,
    sporelink: <Sporelink />,
    rootbloom: <Rootbloom />,
    memory: <MemoryVault />,
    settings: <Settings onLogout={onLogout} />,
  };

  return (
    <motion.div
      className="relative min-h-screen w-full flex flex-col font-mono bg-black"
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <ParticleBackground variant="minimal" />
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Navigation (sidebar) */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onLogout={onLogout}
        />

        {/* Main Glass Content */}
        <main className="flex-1 overflow-y-auto flex justify-center items-center bg-dark-300/30 backdrop-blur-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="w-full max-w-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-dark-300/80 backdrop-blur-2xl border border-dark-100/40 shadow-xl rounded-2xl p-8 min-h-[80vh]">
                {tabComponents[activeTab]}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
};

export default Dashboard;
