import React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  Minus,
  TrendingDown,
} from "lucide-react";
import Button from "@/components/ui/Button";

interface ModelData {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  lastTrained: string;
  status: string;
  version: string;
  agent: string;
  trend: string;
  color: string;
}

interface ModelCardProps {
  model: ModelData;
  index: number;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, index }) => {
  const getColorClass = (type: "bg" | "text" | "border") => {
    switch (model.color) {
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
      default:
        return type === "bg"
          ? "bg-primary-500/20"
          : type === "text"
            ? "text-primary-400"
            : "border-primary-500/30";
    }
  };

  const getStatusClass = () => {
    switch (model.status) {
      case "active":
        return "bg-success-500/20 text-success-300";
      case "inactive":
        return "bg-gray-500/20 text-gray-400";
      case "training":
        return "bg-warning-500/20 text-warning-300";
      case "error":
        return "bg-error-500/20 text-error-300";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTrendIcon = () => {
    switch (model.trend) {
      case "up":
        return <TrendingUp size={14} className="mr-1 text-success-400" />;
      case "down":
        return <TrendingDown size={14} className="mr-1 text-error-400" />;
      case "stable":
        return <Minus size={14} className="mr-1 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="bg-dark-200/80 backdrop-blur-sm rounded-xl border border-dark-100/50 shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start">
            <div className={`p-2.5 rounded-lg ${getColorClass("bg")} mr-4`}>
              <RefreshCw size={18} className={getColorClass("text")} />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{model.name}</h3>
              <div className="flex items-center space-x-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${getStatusClass()}`}
                >
                  {model.status === "training" ? "Training..." : model.status}
                </span>
                <span className="text-xs text-gray-400">
                  {model.type} Model
                </span>
                <span className="text-xs text-gray-400">{model.version}</span>
              </div>
            </div>
          </div>
          <span className="text-xs bg-dark-300/70 px-2 py-1 rounded-lg text-gray-400">
            {model.agent}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-dark-300/50 rounded-lg p-3 border border-dark-100/30">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs text-gray-400">Accuracy</h4>
              <div className="flex items-center text-xs">
                {getTrendIcon()}
                <span
                  className={`
                  ${
                    model.trend === "up"
                      ? "text-success-400"
                      : model.trend === "down"
                        ? "text-error-400"
                        : "text-gray-400"
                  }
                `}
                >
                  {model.trend === "up"
                    ? "+1.2%"
                    : model.trend === "down"
                      ? "-0.8%"
                      : "0%"}
                </span>
              </div>
            </div>
            <div className="text-lg font-bold text-white">
              {model.accuracy}%
            </div>
            <div className="w-full bg-dark-100/50 rounded-full h-1.5 mt-2">
              <div
                className={`h-1.5 rounded-full ${
                  model.accuracy > 95
                    ? "bg-success-500"
                    : model.accuracy > 85
                      ? "bg-primary-500"
                      : model.accuracy > 75
                        ? "bg-warning-500"
                        : "bg-error-500"
                }`}
                style={{ width: `${model.accuracy}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-dark-300/50 rounded-lg p-3 border border-dark-100/30">
            <h4 className="text-xs text-gray-400 mb-1">Training History</h4>
            <div className="flex items-end h-12">
              {Array.from({ length: 7 }).map((_, i) => {
                const height = 30 + Math.random() * 70;
                return (
                  <div key={i} className="flex-1 flex items-end mx-0.5">
                    <div
                      className={`w-full rounded-sm ${getColorClass("bg")}`}
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Last trained {model.lastTrained}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">
            {model.status === "training" ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-3 w-3 text-warning-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Training in progress (68%)...
              </span>
            ) : (
              `Utilization: ${40 + Math.floor(Math.random() * 40)}%`
            )}
          </span>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />}>
              Retrain
            </Button>
            <Button variant="ghost" size="sm" icon={<ArrowUpRight size={14} />}>
              Details
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ModelCard;
