import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  RefreshCw,
  Download,
  TrendingUp,
  Clock,
  Zap,
  FileText,
} from "lucide-react";
import Button from "@/components/ui/Button";
import ModelCard from "@/components/widgets/ModelCard";
import LineGraph from "@/components/widgets/LineGraph";

const PredictiveModels: React.FC = () => {
  const [activeTimeframe, setActiveTimeframe] = useState("week");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  // Sample models data
  const modelsData = [
    {
      id: "model-1",
      name: "Predictive Response Generator",
      type: "Language",
      accuracy: 94.2,
      lastTrained: "2d ago",
      status: "active",
      version: "v2.4.1",
      agent: "Neuroweave",
      trend: "up",
      color: "primary",
    },
    {
      id: "model-2",
      name: "Data Pattern Analyzer",
      type: "Analytics",
      accuracy: 88.7,
      lastTrained: "5d ago",
      status: "active",
      version: "v1.8.3",
      agent: "SporeLink",
      trend: "up",
      color: "secondary",
    },
    {
      id: "model-3",
      name: "Creative Composition Engine",
      type: "Generative",
      accuracy: 91.5,
      lastTrained: "3d ago",
      status: "training",
      version: "v1.2.7",
      agent: "RootBloom",
      trend: "stable",
      color: "accent",
    },
    {
      id: "model-4",
      name: "Anomaly Detection System",
      type: "Security",
      accuracy: 97.1,
      lastTrained: "1d ago",
      status: "active",
      version: "v3.0.2",
      agent: "Neuroweave",
      trend: "up",
      color: "primary",
    },
  ];

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <motion.div
        className="mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <motion.div variants={itemVariants}>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Predictive Models
            </h1>
            <p className="text-gray-400">
              Manage, monitor, and train agent intelligence models
            </p>
          </motion.div>

          <motion.div
            className="mt-4 md:mt-0 flex space-x-3"
            variants={itemVariants}
          >
            <Button variant="ghost" size="sm" icon={<Download size={16} />}>
              Export
            </Button>
            <Button variant="primary" size="sm" icon={<RefreshCw size={16} />}>
              Train All
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="bg-dark-200/80 backdrop-blur-sm rounded-xl border border-dark-100/50 shadow-lg p-4"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
              <LineChart size={20} />
            </div>
            <span className="text-xs text-success-400 bg-success-500/10 px-2 py-0.5 rounded-full flex items-center">
              <TrendingUp size={12} className="mr-1" /> +2.4%
            </span>
          </div>
          <h3 className="text-sm text-gray-400">Average Accuracy</h3>
          <p className="text-2xl font-bold text-white">92.8%</p>
          <div className="mt-2 text-xs text-gray-500">Across all models</div>
        </motion.div>

        <motion.div
          className="bg-dark-200/80 backdrop-blur-sm rounded-xl border border-dark-100/50 shadow-lg p-4"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-secondary-500/20 text-secondary-400">
              <Clock size={20} />
            </div>
            <span className="text-xs text-gray-400 bg-dark-300/50 px-2 py-0.5 rounded-full">
              Last 24h
            </span>
          </div>
          <h3 className="text-sm text-gray-400">Training Sessions</h3>
          <p className="text-2xl font-bold text-white">17</p>
          <div className="mt-2 text-xs text-gray-500">3 currently running</div>
        </motion.div>

        <motion.div
          className="bg-dark-200/80 backdrop-blur-sm rounded-xl border border-dark-100/50 shadow-lg p-4"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-accent-500/20 text-accent-400">
              <BarChartIcon size={20} />
            </div>
            <span className="text-xs text-warning-400 bg-warning-500/10 px-2 py-0.5 rounded-full flex items-center">
              <Zap size={12} className="mr-1" /> High
            </span>
          </div>
          <h3 className="text-sm text-gray-400">Inference Requests</h3>
          <p className="text-2xl font-bold text-white">1,428</p>
          <div className="mt-2 text-xs text-gray-500">42/min avg rate</div>
        </motion.div>

        <motion.div
          className="bg-dark-200/80 backdrop-blur-sm rounded-xl border border-dark-100/50 shadow-lg p-4"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-success-500/20 text-success-400">
              <PieChartIcon size={20} />
            </div>
            <span className="text-xs text-success-400 bg-success-500/10 px-2 py-0.5 rounded-full flex items-center">
              <FileText size={12} className="mr-1" /> 4 Types
            </span>
          </div>
          <h3 className="text-sm text-gray-400">Active Models</h3>
          <p className="text-2xl font-bold text-white">
            {modelsData.filter((m) => m.status === "active").length}
          </p>
          <div className="mt-2 text-xs text-gray-500">1 in training</div>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="lg:col-span-2 bg-dark-200/80 backdrop-blur-sm rounded-xl border border-dark-100/50 shadow-lg overflow-hidden"
          variants={itemVariants}
        >
          <div className="p-4 border-b border-dark-100/50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <LineChart size={18} className="mr-2 text-primary-400" />
              Performance Metrics
            </h2>

            <div className="flex items-center mt-3 sm:mt-0">
              <div className="bg-dark-300/70 rounded-lg p-1 flex space-x-1">
                <button
                  className={`px-3 py-1 text-xs rounded-md ${
                    activeTimeframe === "day"
                      ? "bg-primary-500/30 text-primary-300"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTimeframe("day")}
                >
                  Day
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-md ${
                    activeTimeframe === "week"
                      ? "bg-primary-500/30 text-primary-300"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTimeframe("week")}
                >
                  Week
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-md ${
                    activeTimeframe === "month"
                      ? "bg-primary-500/30 text-primary-300"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTimeframe("month")}
                >
                  Month
                </button>
              </div>

              <button className="ml-3 p-1.5 rounded-lg hover:bg-dark-100/50 text-gray-400 hover:text-white">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <div className="p-4">
            <LineGraph timeframe={activeTimeframe} />
          </div>
        </motion.div>

        <motion.div
          className="bg-dark-200/80 backdrop-blur-sm rounded-xl border border-dark-100/50 shadow-lg overflow-hidden"
          variants={itemVariants}
        >
          <div className="p-4 border-b border-dark-100/50">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <RefreshCw size={18} className="mr-2 text-secondary-400" />
              Training Queue
            </h2>
          </div>

          <div className="p-4">
            <div className="space-y-3">
              {modelsData.slice(0, 3).map((model, index) => (
                <div
                  key={model.id}
                  className="p-3 rounded-lg bg-dark-300/50 border border-dark-100/30 flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-3 ${
                        index === 0
                          ? "bg-success-500 animate-pulse"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {model.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Agent: {model.agent}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs">
                    <span
                      className={`px-2 py-1 rounded-md ${
                        index === 0
                          ? "bg-success-500/20 text-success-300"
                          : "bg-dark-100/50 text-gray-400"
                      }`}
                    >
                      {index === 0 ? "In Progress" : `Scheduled`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-lg bg-secondary-500/10 border border-secondary-500/20">
              <div className="flex items-start">
                <Zap size={18} className="text-secondary-400 mr-3 mt-1" />
                <div>
                  <h3 className="font-medium text-white mb-1">Auto-Training</h3>
                  <p className="text-sm text-gray-400">
                    Model retraining is scheduled based on performance metrics
                    and data drift detection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="mb-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex items-center justify-between"
          variants={itemVariants}
        >
          <h2 className="text-xl font-semibold text-white">Model Management</h2>
          <Button variant="ghost" size="sm" icon={<RefreshCw size={16} />}>
            Refresh
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {modelsData.map((model, index) => (
          <ModelCard key={model.id} model={model} index={index} />
        ))}
      </motion.div>
    </div>
  );
};

export default PredictiveModels;
