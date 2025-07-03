// src/components/dashboard/panels/settings/SettingsIndex.tsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Shield,
  Zap,
  Package,
  Cloud,
  HelpCircle,
  LogOut,
} from "lucide-react";
import Button from "../../../ui/Button";
import AccountSettings from "./AccountSettings";
import SecuritySettings from "./SecuritySettings";
import NotificationSettings from "./NotificationSettings";

interface SettingsProps {
  onLogout: () => void;
}

const SettingsIndex: React.FC<SettingsProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("account");

  const tabs = [
    { id: "account", label: "Account", icon: <User size={18} /> },
    { id: "security", label: "Security", icon: <Lock size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "privacy", label: "Privacy", icon: <Shield size={18} /> },
    { id: "performance", label: "Performance", icon: <Zap size={18} /> },
    { id: "plugins", label: "Plugins", icon: <Package size={18} /> },
    { id: "cloud", label: "Cloud Sync", icon: <Cloud size={18} /> },
    { id: "help", label: "Help & Support", icon: <HelpCircle size={18} /> },
  ];

  const renderTabPanel = () => {
    switch (activeTab) {
      case "account":
        return <AccountSettings />;
      case "security":
        return <SecuritySettings />;
      case "notifications":
        return <NotificationSettings />;
      default:
        return (
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <div
              className={`p-4 rounded-full bg-${activeTab === "plugins" ? "secondary" : "primary"}-500/20 mb-4`}
            >
              {tabs.find((tab) => tab.id === activeTab)?.icon}
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              {tabs.find((tab) => tab.id === activeTab)?.label} Settings
            </h3>
            <p className="text-gray-400 max-w-md mb-6">
              This settings panel is under development. Check back soon for more
              options.
            </p>
            <Button variant="primary">Coming Soon</Button>
          </div>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <motion.div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div className="lg:col-span-1">
          <div className="bg-dark-200/80 rounded-xl border border-dark-100/50 shadow-lg overflow-hidden">
            <div className="p-4 border-b border-dark-100/50">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <SettingsIcon size={18} className="mr-2 text-primary-400" />
                Settings
              </h2>
            </div>
            <div className="p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? "bg-primary-500/20 text-primary-300"
                      : "text-gray-400 hover:bg-dark-100/50 hover:text-white"
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
              <div className="mt-4 p-2">
                <Button
                  variant="ghost"
                  fullWidth
                  icon={<LogOut size={18} />}
                  onClick={onLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="lg:col-span-3">
          <div className="bg-dark-200/80 rounded-xl border border-dark-100/50 shadow-lg overflow-hidden">
            <div className="p-4 border-b border-dark-100/50">
              <h2 className="text-lg font-semibold text-white flex items-center">
                {tabs.find((tab) => tab.id === activeTab)?.icon}
                <span className="ml-2">
                  {tabs.find((tab) => tab.id === activeTab)?.label} Settings
                </span>
              </h2>
            </div>
            {renderTabPanel()}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SettingsIndex;
