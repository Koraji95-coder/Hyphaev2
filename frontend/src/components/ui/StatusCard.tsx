import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "stable";
  trendValue: string;
  color: "primary" | "secondary" | "accent" | "success" | "warning" | "error";
  onClick?: () => void;
  variants?: any;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  color,
  onClick,
  variants,
}) => {
  const getColorClass = (type: "bg" | "text") => {
    const map = {
      primary: type === "bg" ? "bg-primary-500/20" : "text-primary-400",
      secondary: type === "bg" ? "bg-secondary-500/20" : "text-secondary-400",
      accent: type === "bg" ? "bg-accent-500/20" : "text-accent-400",
      success: type === "bg" ? "bg-success-500/20" : "text-success-400",
      warning: type === "bg" ? "bg-warning-500/20" : "text-warning-400",
      error: type === "bg" ? "bg-error-500/20" : "text-error-400",
    };
    return map[color];
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <ArrowUpRight size={16} className="text-success-400" />;
      case "down":
        return <ArrowDownRight size={16} className="text-error-400" />;
      case "stable":
        return <Minus size={16} className="text-gray-400" />;
    }
  };

  const getTrendClass = () => {
    switch (trend) {
      case "up":
        return "text-success-400";
      case "down":
        return "text-error-400";
      case "stable":
        return "text-gray-400";
    }
  };

  return (
    <motion.div
      className="bg-dark-200/80 backdrop-blur-sm rounded-xl border border-dark-100/50 shadow-lg p-5 cursor-pointer"
      variants={variants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${getColorClass("bg")}`}>
          {React.cloneElement(icon as React.ReactElement, {
            className: getColorClass("text"),
          })}
        </div>
        <div className="flex items-center">
          {getTrendIcon()}
          <span className={`ml-1 text-xs ${getTrendClass()}`}>
            {trendValue}
          </span>
        </div>
      </div>
      <div>
        <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );
};

export default StatusCard;
