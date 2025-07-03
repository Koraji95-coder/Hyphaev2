// src/components/agents/Agents.tsx
import React from "react";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  ArrowUpRight,
  Zap,
  Brain,
  Database,
  MessageSquare,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Settings,
} from "lucide-react";
import Button from "@/components/ui/Button";

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: "active" | "inactive" | "error" | "warning";
  memoryUsage: number;
  cpuUsage: number;
  uptime: string;
  activeTokens: number;
  color: "primary" | "secondary" | "accent";
  avatar?: string;
}

// Sample data — swap this out for your real API hook later
const agentData: Agent[] = [
  {
    id: "neuroweave-01",
    name: "Neuroweave",
    role: "General Intelligence",
    description:
      "Multi-purpose reasoning and dialog agent with broad capabilities.",
    status: "active",
    memoryUsage: 38,
    cpuUsage: 42,
    uptime: "4d 7h",
    activeTokens: 682430,
    color: "primary",
    avatar: "https://randomuser.me/api/portraits/women/54.jpg",
  },
  {
    id: "sporelink-02",
    name: "SporeLink",
    role: "Data Analysis",
    description:
      "Specialized in data processing, statistics, and visualization.",
    status: "active",
    memoryUsage: 26,
    cpuUsage: 31,
    uptime: "2d 14h",
    activeTokens: 421092,
    color: "secondary",
    avatar: "https://randomuser.me/api/portraits/men/40.jpg",
  },
  {
    id: "rootbloom-03",
    name: "RootBloom",
    role: "Creative Generation",
    description: "Expert in content creation, writing, and creative tasks.",
    status: "inactive",
    memoryUsage: 0,
    cpuUsage: 0,
    uptime: "0h",
    activeTokens: 0,
    color: "accent",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, staggerChildren: 0.1 },
  },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
};

const getStatusColor = (status: Agent["status"]) => {
  switch (status) {
    case "active":
      return "bg-success-500";
    case "inactive":
      return "bg-gray-500";
    case "error":
      return "bg-error-500";
    case "warning":
      return "bg-warning-500";
  }
};

const getAgentColorClass = (
  color: Agent["color"],
  type: "bg" | "text" | "border"
) => {
  switch (color) {
    case "primary":
      return type === "bg"
        ? "bg-primary-500/20"
        : type === "text"
        ? "text-primary-400"
        : "border-primary-500/30";
    case "secondary":
      return type === "bg"
        ? "bg-secondary-500/20"
        : type === "text"
        ? "text-secondary-400"
        : "border-secondary-500/30";
    case "accent":
      return type === "bg"
        ? "bg-accent-500/20"
        : type === "text"
        ? "text-accent-400"
        : "border-accent-500/30";
  }
};

const Agents: React.FC = () => {
  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <motion.div
        className="mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <motion.div variants={itemVariants}>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Agent Management
            </h1>
            <p className="text-gray-400">
              Manage, monitor and configure your multi-agent system
            </p>
          </motion.div>

          <motion.div
            className="mt-4 md:mt-0 flex space-x-3"
            variants={itemVariants}
          >
            <Button variant="ghost" size="sm" icon={<RefreshCw size={16} />}>
              Refresh
            </Button>
            <Button variant="primary" size="sm" icon={<UserIcon size={16} />}>
              New Agent
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Agent Cards */}
      <motion.div
        className="grid grid-cols-1 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {agentData.map((agent) => (
          <motion.div
            key={agent.id}
            className="bg-dark-200/80 backdrop-blur-sm rounded-xl border border-dark-100/50 shadow-lg overflow-hidden"
            variants={itemVariants}
          >
            <div className="p-6 md:flex">
              {/* Avatar */}
              <div
                className={`hidden md:flex md:w-1/5 items-center justify-center p-6 ${getAgentColorClass(
                  agent.color,
                  "bg"
                )}`}
              >
                {agent.avatar ? (
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-24 h-24 rounded-full border-4 border-dark-300/50"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-dark-200 flex items-center justify-center text-4xl font-bold text-white">
                    {agent.name[0]}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="md:w-4/5 p-0 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start">
                  <div className="flex-1">
                    {/* Title + status */}
                    <div className="flex items-center mb-2">
                      {agent.avatar && (
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="md:hidden w-10 h-10 rounded-full mr-3"
                        />
                      )}
                      <div>
                        <div className="flex items-center">
                          <h2 className="text-xl font-bold text-white mr-3">
                            {agent.name}
                          </h2>
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${getStatusColor(
                              agent.status
                            )} mr-1.5`}
                          />
                          <span className="text-xs text-gray-400 capitalize">
                            {agent.status}
                          </span>
                        </div>
                        <p
                          className={`text-sm ${getAgentColorClass(
                            agent.color,
                            "text"
                          )}`}
                        >
                          {agent.role}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-400 mb-4">{agent.description}</p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {/* Memory */}
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-lg ${getAgentColorClass(
                            agent.color,
                            "bg"
                          )} mr-3`}
                        >
                          <Brain
                            size={16}
                            className={getAgentColorClass(agent.color, "text")}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Memory</p>
                          <p className="text-sm font-medium text-white">
                            {agent.memoryUsage}%
                          </p>
                        </div>
                      </div>

                      {/* CPU */}
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-lg ${getAgentColorClass(
                            agent.color,
                            "bg"
                          )} mr-3`}
                        >
                          <Zap
                            size={16}
                            className={getAgentColorClass(agent.color, "text")}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">CPU</p>
                          <p className="text-sm font-medium text-white">
                            {agent.cpuUsage}%
                          </p>
                        </div>
                      </div>

                      {/* Tokens */}
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-lg ${getAgentColorClass(
                            agent.color,
                            "bg"
                          )} mr-3`}
                        >
                          <Database
                            size={16}
                            className={getAgentColorClass(agent.color, "text")}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Tokens</p>
                          <p className="text-sm font-medium text-white">
                            {agent.activeTokens > 0
                              ? agent.activeTokens.toLocaleString()
                              : "-"}
                          </p>
                        </div>
                      </div>

                      {/* Uptime */}
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-lg ${getAgentColorClass(
                            agent.color,
                            "bg"
                          )} mr-3`}
                        >
                          <RefreshCw
                            size={16}
                            className={getAgentColorClass(agent.color, "text")}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Uptime</p>
                          <p className="text-sm font-medium text-white">
                            {agent.uptime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-3 mt-4 lg:mt-0 lg:ml-6">
                    {agent.status === "active" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<PauseCircle size={16} />}
                      >
                        Pause
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<PlayCircle size={16} />}
                      >
                        Start
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<MessageSquare size={16} />}
                    >
                      Chat
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Settings size={16} />}
                    >
                      Config
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className={`px-6 py-3 border-t ${getAgentColorClass(
                agent.color,
                "border"
              )} bg-dark-300/30`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${getStatusColor(
                      agent.status
                    )} mr-1.5`}
                  />
                  <span className="text-sm text-gray-400">
                    {agent.status === "active"
                      ? "Agent is running and processing tasks"
                      : "Agent is currently inactive"}
                  </span>
                </div>
                <button className="text-xs flex items-center text-primary-400 hover:text-primary-300">
                  View Details <ArrowUpRight size={12} className="ml-1" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Agents;
