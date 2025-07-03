import React, { useState } from "react";
import type { AuthUser as User } from "@/services/auth";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Database,
  LineChart,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import Button from "../../ui/Button";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: User | null;    // now matches id:number
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

  const navigationItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={20} /> },
    { id: "agents", label: "Agents", icon: <Users size={20} /> },
    { id: "memory", label: "Memory Vault", icon: <Database size={20} /> },
    { id: "models", label: "Predictive Models", icon: <LineChart size={20} /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon size={20} /> },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Navigation Header */}
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
          onClick={toggleMobileMenu}
          className="p-2 rounded-md hover:bg-dark-100/50"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
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
                onClick={toggleMobileMenu}
                className="p-2 rounded-full hover:bg-dark-100/50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
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
                      <h3 className="font-medium text-white">
                        {user.username}
                      </h3>
                      <p className="text-xs text-gray-400">{user.role}</p>
                    </div>
                  </div>
                </div>
              )}

              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`
                      w-full flex items-center px-4 py-3 rounded-lg transition-colors
                      ${
                        activeTab === item.id
                          ? "bg-primary-500/20 text-primary-300"
                          : "text-gray-400 hover:bg-dark-100/50 hover:text-white"
                      }
                    `}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>

            <div className="p-4">
              <Button
                variant="ghost"
                fullWidth
                icon={<LogOut size={18} />}
                onClick={onLogout}
              >
                Log Out
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Desktop Sidebar */}
      <motion.aside
        className={`hidden md:flex flex-col ${isCollapsed ? "w-20" : "w-64"} bg-dark-200 border-r border-dark-100/50 transition-all duration-300 ease-in-out`}
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
      >
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "px-6"} h-16 border-b border-dark-100/50`}
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
                onClick={() => handleTabChange(item.id)}
                className={`
                  w-full ${isCollapsed ? "flex flex-col items-center justify-center py-3 px-0" : "flex items-center px-4 py-3"} 
                  rounded-lg transition-colors
                  ${
                    activeTab === item.id
                      ? "bg-primary-500/20 text-primary-300"
                      : "text-gray-400 hover:bg-dark-100/50 hover:text-white"
                  }
                `}
                whileHover={{ x: isCollapsed ? 0 : 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className={isCollapsed ? "mb-1" : "mr-3"}>
                  {item.icon}
                </span>
                {!isCollapsed && <span>{item.label}</span>}
                {isCollapsed && (
                  <span className="text-xs">{item.label.split(" ")[0]}</span>
                )}
              </motion.button>
            ))}
          </nav>
        </div>

        <div
          className={`p-4 border-t border-dark-100/50 ${isCollapsed ? "items-center justify-center" : ""}`}
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
            <div className="flex flex-col space-y-3">
              {user && (
                <motion.div
                  className="w-10 h-10 mx-auto rounded-full bg-primary-500/20 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-primary-300 font-medium">
                    {user?.username.charAt(0).toUpperCase()}
                  </span>
                </motion.div>
              )}
              <button
                onClick={onLogout}
                className="p-2 rounded-md hover:bg-dark-100/50 text-gray-400 hover:text-white flex items-center justify-center"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Button
              variant="ghost"
              fullWidth
              icon={<LogOut size={18} />}
              onClick={onLogout}
            >
              Log Out
            </Button>
          )}
        </div>

        <button
          onClick={toggleCollapse}
          className="absolute right-0 top-20 transform translate-x-1/2 bg-dark-200 border border-dark-100/50 rounded-full p-1.5 text-gray-400 hover:text-white"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </motion.aside>
    </>
  );
};

export default Navigation;
