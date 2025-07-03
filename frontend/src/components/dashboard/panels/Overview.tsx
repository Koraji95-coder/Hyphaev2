// src/pages/Overview.tsx
import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Users,
  Zap,
  Clock,
  ArrowUpRight,
  Brain,
  AlertTriangle,
} from "lucide-react";
import StatusCard      from "@/components/ui/StatusCard";
import RecentActivity  from "@/components/widgets/RecentActivity";
import SystemMetrics   from "@/components/widgets/SystemMetrics";
import WeatherWidget   from "@/components/widgets/WeatherWidget";

interface OverviewProps {
  onLogout: () => void;
}

const Overview: React.FC<OverviewProps> = ({ onLogout }) => {
  const systemStatus = {
    activeAgents:    3,
    totalAgents:     5,
    memoryUsage:     72,
    cpuUsage:        48,
    uptime:          "5d 12h 37m",
    activeProcesses: 8,
    pendingTasks:    2,
    warnings:        1,
  };

  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden:  { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-8">
        <motion.h1 className="text-2xl lg:text-3xl font-bold text-white mb-2" variants={itemVariants}>
          System Overview
        </motion.h1>
        <motion.p className="text-gray-400" variants={itemVariants}>
          HyphaeOS is operating at optimal parameters
        </motion.p>
      </motion.div>

      {/* Top cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatusCard
          title="Agents Active"
          value={`${systemStatus.activeAgents}/${systemStatus.totalAgents}`}
          icon={<Users size={20} />}
          trend="up"
          trendValue="20%"
          color="primary"
          variants={itemVariants}
        />
        <StatusCard
          title="Memory Usage"
          value={`${systemStatus.memoryUsage}%`}
          icon={<Brain size={20} />}
          trend="up"
          trendValue="8%"
          color="secondary"
          variants={itemVariants}
        />
        <StatusCard
          title="CPU Allocation"
          value={`${systemStatus.cpuUsage}%`}
          icon={<Zap size={20} />}
          trend="down"
          trendValue="5%"
          color="accent"
          variants={itemVariants}
        />
        <StatusCard
          title="System Uptime"
          value={systemStatus.uptime}
          icon={<Clock size={20} />}
          trend="stable"
          trendValue="0%"
          color="success"
          variants={itemVariants}
        />
      </motion.div>

      {/* Metrics + Weather */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <SystemMetrics />
        </motion.div>
        <motion.div variants={itemVariants}>
          <WeatherWidget />
        </motion.div>
      </motion.div>

      {/* Activity + Alerts */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <RecentActivity />
        </motion.div>

        <motion.div variants={itemVariants} className="bg-dark-200/80 backdrop-blur-sm rounded-xl p-6 border border-dark-100/50 shadow-lg">
          <div className="flex justify-end mb-4">
            <button
              onClick={onLogout}
              className="text-sm px-4 py-2 rounded-lg bg-error-500/20 hover:bg-error-500/30 text-error-300 transition-colors"
            >
              Logout
            </button>
          </div>
          {/* Alerts panel */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">System Alerts</h2>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                systemStatus.warnings > 0
                  ? "bg-warning-500/20 text-warning-300"
                  : "bg-success-500/20 text-success-300"
              }`}
            >
              {systemStatus.warnings} Warnings
            </span>
          </div>
          {/* Sample alerts */}
          <div className="space-y-3">
            {/* ... your individual alert cards here ... */}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Overview;
