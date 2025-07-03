// src/components/dashboard/panels/MemoryVault/MemoryGraphVisualizer.tsx
import React from "react";
import { RefreshCw, Layers, Search } from "lucide-react";
import { motion } from "framer-motion";

type Node = {
  id: string;
  label: string;
  category: string;
  size: number;
  connections: number;
};

const generateIndexData = (): Node[] => {
  const categories = ["entities", "concepts", "relations", "facts", "rules"];
  return Array.from({ length: 20 }).map((_, i) => ({
    id: `node-${i}`,
    label: `Memory Cluster ${i + 1}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    size: Math.floor(Math.random() * 100) + 20,
    connections: Math.floor(Math.random() * 8) + 1,
  }));
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "entities":
      return "bg-primary-500/40";
    case "concepts":
      return "bg-secondary-500/40";
    case "relations":
      return "bg-accent-500/40";
    case "facts":
      return "bg-success-500/40";
    case "rules":
      return "bg-warning-500/40";
    default:
      return "bg-gray-500/40";
  }
};

const MemoryGraphVisualizer: React.FC<{ activeEngine: string }> = ({
  activeEngine,
}) => {
  const indexData = generateIndexData();

  return (
    <motion.div className="lg:col-span-2">
      <div className="bg-dark-200/80 rounded-xl border border-dark-100/50 shadow-lg h-full">
        <div className="p-4 border-b border-dark-100/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Layers size={18} className="mr-2 text-secondary-400" />
            Knowledge Structure
          </h2>
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span>
              Engine: <span className="text-white">{activeEngine}</span>
            </span>
            <button className="hover:text-white">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 h-[500px] relative overflow-hidden">
          {indexData.map((node, index) => {
            const x = 30 + (index % 5) * 120;
            const y = 30 + Math.floor(index / 5) * 100;
            return (
              <motion.div
                key={node.id}
                className="absolute"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${node.size}px`,
                  height: `${node.size}px`,
                }}
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  opacity: 0.85,
                  transition: { delay: index * 0.03 },
                }}
                whileHover={{ scale: 1.1, opacity: 1 }}
              >
                <div
                  className={`w-full h-full rounded-full ${getCategoryColor(node.category)} flex items-center justify-center`}
                >
                  <span className="text-xs text-white font-medium">
                    {node.connections}
                  </span>
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs text-gray-400">
                  {node.category}
                </div>
              </motion.div>
            );
          })}
          <div className="absolute bottom-4 left-4 right-4 bg-dark-200/90 rounded-lg border border-dark-100/50 p-3 text-xs text-gray-400 flex items-center">
            <Search size={14} className="mr-2" />
            Hover over nodes to see details. Click to expand connections.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MemoryGraphVisualizer;
