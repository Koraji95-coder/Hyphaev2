import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "./Navigation";
import Overview from "./Overview";
import Agents from "./agents";
import MemoryVault from "@/components/dashboard/panels/MemoryVault/index";
import PredictiveModels from "./PredictiveModels";
import Settings from "@/components/dashboard/panels/settings/SettingsIndex";
import { useAuth } from "@/hooks/useAuth";
import ParticleBackground from "@/components/ui/ParticleBackground";

type TabType = "overview" | "agents" | "memory" | "models" | "settings";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const { user } = useAuth();

  const tabComponents = {
    overview: <Overview onLogout={onLogout} />,
    agents:   <Agents />,
    memory:   <MemoryVault />,
    models:   <PredictiveModels />,
    settings: <Settings onLogout={onLogout} />,
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className="relative min-h-screen w-full flex flex-col"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <ParticleBackground variant="minimal" />

      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onLogout={onLogout}
        />

        <main className="flex-1 overflow-y-auto bg-dark-300/30 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="h-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {tabComponents[activeTab]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
};

export default Dashboard;
