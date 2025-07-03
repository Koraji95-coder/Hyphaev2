// src/components/dashboard/panels/MemoryVault/MemoryEnginesPanel.tsx
import React from "react";
import {
  RefreshCw,
  Database,
  HardDrive,
  Layers,
  FolderTree,
} from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  activeEngine: string;
  onChange: (engineId: string) => void;
};

const memoryEngines = [
  {
    id: "semantic",
    name: "Semantic Network",
    type: "primary",
    size: "14.8 GB",
    nodes: 1485000,
  },
  {
    id: "episodic",
    name: "Episodic Memory",
    type: "secondary",
    size: "8.2 GB",
    nodes: 724000,
  },
  {
    id: "procedural",
    name: "Procedural Knowledge",
    type: "auxiliary",
    size: "5.4 GB",
    nodes: 392000,
  },
  {
    id: "associative",
    name: "Associative Graph",
    type: "experimental",
    size: "2.1 GB",
    nodes: 148000,
  },
];

const getEngineTypeColor = (type: string) => {
  switch (type) {
    case "primary":
      return "bg-primary-500/20 text-primary-400";
    case "secondary":
      return "bg-secondary-500/20 text-secondary-400";
    case "auxiliary":
      return "bg-accent-500/20 text-accent-400";
    case "experimental":
      return "bg-warning-500/20 text-warning-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
};

const MemoryEnginesPanel: React.FC<Props> = ({ activeEngine, onChange }) => (
  <motion.div className="lg:col-span-1">
    <div className="bg-dark-200/80 rounded-xl border border-dark-100/50 shadow-lg overflow-hidden">
      <div className="p-4 border-b border-dark-100/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <Database size={18} className="mr-2 text-primary-400" />
          Memory Engines
        </h2>
        <button className="p-1.5 rounded-lg hover:bg-dark-100/50 text-gray-400 hover:text-white">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {memoryEngines.map((engine) => (
          <motion.div
            key={engine.id}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              activeEngine === engine.id
                ? "bg-dark-100/70 border-primary-500/30"
                : "bg-dark-300/50 border-dark-100/30 hover:bg-dark-100/30"
            }`}
            onClick={() => onChange(engine.id)}
            whileHover={{ x: 2 }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-white">{engine.name}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${getEngineTypeColor(engine.type)}`}
              >
                {engine.type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3 text-sm text-white">
              <div className="flex items-center text-sm">
                <HardDrive size={14} className="text-gray-400 mr-2" />
                {engine.size}
              </div>
              <div className="flex items-center">
                <Layers size={14} className="text-gray-400 mr-2" />
                {engine.nodes.toLocaleString()}
              </div>
            </div>
          </motion.div>
        ))}

        <div className="mt-4 p-4 rounded-lg bg-primary-500/10 border border-primary-500/20">
          <div className="flex items-start">
            <FolderTree size={18} className="text-primary-400 mr-3 mt-1" />
            <div>
              <h3 className="font-medium text-white mb-1">Index Explorer</h3>
              <p className="text-sm text-gray-400">
                Select a memory engine to visualize its knowledge structure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default MemoryEnginesPanel;
