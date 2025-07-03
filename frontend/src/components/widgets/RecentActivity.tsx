import React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  MessageSquare,
  Zap,
  RefreshCw,
  FileText,
  Database,
} from "lucide-react";

const RecentActivity: React.FC = () => {
  // Sample activity data
  const activityData = [
    {
      id: 1,
      agent: "Neuroweave",
      action: "completed a dialogue task",
      time: "2 min ago",
      icon: <MessageSquare size={16} />,
      color: "primary",
    },
    {
      id: 2,
      agent: "SporeLink",
      action: "processed analytics report",
      time: "15 min ago",
      icon: <FileText size={16} />,
      color: "secondary",
    },
    {
      id: 3,
      agent: "System",
      action: "performed memory optimization",
      time: "45 min ago",
      icon: <Database size={16} />,
      color: "accent",
    },
    {
      id: 4,
      agent: "RootBloom",
      action: "generated creative content",
      time: "1h ago",
      icon: <Zap size={16} />,
      color: "success",
    },
    {
      id: 5,
      agent: "Neuroweave",
      action: "scheduled system maintenance",
      time: "3h ago",
      icon: <RefreshCw size={16} />,
      color: "primary",
    },
  ];

  const getAgentColor = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary-500/20 text-primary-400";
      case "secondary":
        return "bg-secondary-500/20 text-secondary-400";
      case "accent":
        return "bg-accent-500/20 text-accent-400";
      case "success":
        return "bg-success-500/20 text-success-400";
      case "warning":
        return "bg-warning-500/20 text-warning-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="bg-dark-200/80 backdrop-blur-sm rounded-xl border border-dark-100/50 shadow-lg overflow-hidden h-full">
      <div className="p-4 border-b border-dark-100/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <button className="p-1.5 rounded-lg hover:bg-dark-100/50 text-gray-400 hover:text-white">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          {activityData.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="flex"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative mr-4 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full ${getAgentColor(activity.color)} flex items-center justify-center`}
                >
                  {activity.icon}
                </div>
                {index < activityData.length - 1 && (
                  <div className="absolute top-8 bottom-0 left-1/2 w-0.5 -ml-px h-full bg-dark-100/50"></div>
                )}
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      <span className={`text-${activity.color}-400`}>
                        {activity.agent}
                      </span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                  <button className="p-1 rounded-full hover:bg-dark-100/50 text-gray-400 hover:text-white">
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-2 pt-2 border-t border-dark-100/50 text-center">
          <button className="text-sm text-primary-400 hover:text-primary-300">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
