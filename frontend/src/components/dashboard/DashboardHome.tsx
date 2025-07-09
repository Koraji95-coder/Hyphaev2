import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Users, Zap, Clock, Brain } from "lucide-react";
import StatusCard      from "@/components/ui/StatusCard";
import RecentActivity  from "@/components/widgets/RecentActivity";
import SystemMetrics   from "@/components/widgets/SystemMetrics";
import WeatherWidget   from "@/components/widgets/WeatherWidget";

const DashboardHome: React.FC = () => {
  const { user } = useAuth();

  // Sample system status for cards
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

  // Animation variants
  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden:  { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full h-full overflow-y-auto px-4 py-6 md:px-10 md:py-10">
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <motion.h1
          className="text-2xl md:text-3xl font-bold text-white mb-2"
          variants={itemVariants}
        >
          System Overview
        </motion.h1>
        <motion.p className="text-gray-400" variants={itemVariants}>
          Welcome back, {user?.username || "Operator"}. Here’s where you left off.
        </motion.p>
      </motion.div>

      {/* Status Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
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

      {/* Metrics & Weather */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
      >
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <SystemMetrics />
        </motion.div>
        <motion.div variants={itemVariants}>
          <WeatherWidget />
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 mb-8"
      >
        <motion.div variants={itemVariants}>
          <RecentActivity />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
