// src/components/dashboard/panels/Navigation.tsx
import React, { useState } from "react";
import type { UserProfile as User } from "@/services/auth";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Database,
  Brain,
  Flower2,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogout,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { id: "neuroweave", label: "Neuroweave", icon: <Brain size={20} />, path: "/neuroweave" },
    { id: "sporelink", label: "Sporelink", icon: <Users size={20} />, path: "/sporelink" },
    { id: "rootbloom", label: "Rootbloom", icon: <Flower2 size={20} />, path: "/rootbloom" },
    { id: "memory", label: "Memory Vault", icon: <Database size={20} />, path: "/memory" },
    { id: "settings", label: "Settings", icon: <SettingsIcon size={20} />, path: "/settings" },
  ];

  const handleTabChange = (tabId: string, path: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-dark-200 border-b border-dark-100/50">
        <div className="flex items-center">
          <motion.div
            className="w-8 h-8 rounded-md bg-primary-500/20 flex items-center justify-center mr-3"
            whileHover={{ scale: 1.05 }}
          >
            <LayoutDashboard size={18} className="text-primary-400" />
          </motion.div>
          <h1 className="font-bold text-white text-lg">HyphaeOS</h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen((o) => !o)}
          className="p-2 rounded-md hover:bg-dark-100/50"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          className="md:hidden fixed inset-0 bg-dark-400/90 z-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-dark-100/50"
              >
                <ChevronLeft size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {user && (
                <div className="mb-6 p-4 bg-dark-200 rounded-lg">
                  <div className="flex items-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center mr-3">
                        <span className="text-primary-300 font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-white">{user.username}</h3>
                      <p className="text-xs text-gray-400">{user.role}</p>
                    </div>
                  </div>
                </div>
              )}
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleTabChange(item.id, item.path)}
                    className={`
                      w-full flex items-center px-4 py-3 rounded-lg transition-colors
                      ${
                        activeTab === item.id
                          ? "bg-primary-500/20 text-primary-300"
                          : "text-gray-400 hover:bg-dark-100/50 hover:text-white"
                      }
                    `}
                    whileHover={{ x: 5 }}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>
            <div className="p-4">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
              >
                <LogOut size={18} className="mr-2" />
                Log Out
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Desktop Sidebar */}
      <motion.aside
        className={`hidden md:flex flex-col ${
          isCollapsed ? "w-20" : "w-64"
        } bg-dark-200 border-r border-dark-100/50 transition-all duration-300 ease-in-out`}
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
      >
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "px-6"
          } h-16 border-b border-dark-100/50`}
        >
          {isCollapsed ? (
            <motion.div
              className="w-10 h-10 rounded-md bg-primary-500/20 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <LayoutDashboard size={20} className="text-primary-400" />
            </motion.div>
          ) : (
            <div className="flex items-center">
              <motion.div
                className="w-10 h-10 rounded-md bg-primary-500/20 flex items-center justify-center mr-3"
                whileHover={{ scale: 1.05 }}
              >
                <LayoutDashboard size={20} className="text-primary-400" />
              </motion.div>
              <h1 className="font-bold text-white text-lg">HyphaeOS</h1>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className={`space-y-1 ${isCollapsed ? "px-3" : "px-4"}`}>
            {navigationItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleTabChange(item.id, item.path)}
                className={`
                  w-full ${
                    isCollapsed
                      ? "flex flex-col items-center justify-center py-3 px-0"
                      : "flex items-center px-4 py-3"
                  } rounded-lg transition-colors
                  ${
                    activeTab === item.id
                      ? "bg-primary-500/20 text-primary-300"
                      : "text-gray-400 hover:bg-dark-100/50 hover:text-white"
                  }
                `}
                whileHover={{ x: isCollapsed ? 0 : 5 }}
              >
                <span className={isCollapsed ? "mb-1" : "mr-3"}>{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
                {isCollapsed && (
                  <span className="text-xs">{item.label.split(" ")[0]}</span>
                )}
              </motion.button>
            ))}
          </nav>
        </div>

        <div
          className={`p-4 border-t border-dark-100/50 ${
            isCollapsed ? "items-center justify-center" : ""
          }`}
        >
          {user && !isCollapsed && (
            <div className="flex items-center mb-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center mr-3">
                  <span className="text-primary-300 font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-medium text-white">{user.username}</h3>
                <p className="text-xs text-gray-400">{user.role}</p>
              </div>
            </div>
          )}

          {isCollapsed ? (
            <button
              onClick={onLogout}
              className="p-2 rounded-md hover:bg-dark-100/50 text-gray-400 hover:text-white flex items-center justify-center"
            >
              <LogOut size={20} />
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut size={18} className="mr-2" />
              Log Out
            </button>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed((v) => !v)}
          className="absolute right-0 top-20 transform translate-x-1/2 bg-dark-200 border border-dark-100/50 rounded-full p-1.5 text-gray-400 hover:text-white"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </motion.aside>
    </>
  );
};

export default Navigation;
