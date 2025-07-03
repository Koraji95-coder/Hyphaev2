// src/components/dashboard/panels/MemoryVault/index.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import MemoryEnginesPanel from "./MemoryEnginesPanel";
import MemoryGraphVisualizer from "./MemoryGraphVisualizer";
import MemoryChainViewer from "@/components/dashboard/panels/MemoryVault/MemoryChainViewer";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import { Search, Plus } from "lucide-react";

const MemoryVault: React.FC = () => {
  const { user } = useAuth();
  const [activeEngine, setActiveEngine] = useState("semantic");

  const handleExportJSON = () => {
    // You can wire this into subcomponents later if needed
    console.log("Exporting memory JSON...");
  };

  const handleClearAll = () => {
    console.log("Clearing memory data...");
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <motion.div initial="hidden" animate="visible">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Memory Vault
            </h1>
            <p className="text-gray-400">Explore and manage memory systems</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search indices..."
                className="pl-10 pr-4 py-2 bg-dark-300/70 border border-dark-100/50 rounded-lg text-white placeholder-gray-500 w-full md:w-64"
              />
            </div>
            <Button variant="primary" size="sm" icon={<Plus size={16} />}>
              New Index
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MemoryEnginesPanel
          activeEngine={activeEngine}
          onChange={setActiveEngine}
        />
        <MemoryGraphVisualizer activeEngine={activeEngine} />
      </div>

      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            🧬 Memory Timeline
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleExportJSON}>
              Export JSON
            </Button>
            <Button size="sm" variant="ghost" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>
        </div>
        <div className="bg-dark-300/50 p-4 rounded-xl border border-dark-100/40 max-h-[500px] overflow-y-auto">
          <MemoryChainViewer user={user?.username || "system"} />
        </div>
      </div>
    </div>
  );
};

export default MemoryVault;
