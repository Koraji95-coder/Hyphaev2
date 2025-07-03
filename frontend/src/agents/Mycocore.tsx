// src/components/agents/MycoCore.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, AlertTriangle, Cpu, Brain } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMycoCore } from "@/hooks/useMycoCore";

type SystemEventType =
  | "snapshot"
  | "metrics"
  | "alerts"
  | "safe_mode";

interface SystemEvent {
  id: string;
  type: SystemEventType;
  message: string;
  timestamp: string;
}

const MycoCore: React.FC = () => {
  const { user } = useAuth();
  const { snapshot, alerts, events } = useMycoCore();
  const [log, setLog] = useState<SystemEvent[]>([]);
  const [minimized, setMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 🎉 Add a “connected” banner once, when `user` first appears
  useEffect(() => {
    if (!user) return;
    setLog((l) => [
      ...l,
      {
        id: `connect-${Date.now()}`,
        type: "snapshot",
        message: `🟢 WebSocket connected for ${user.username}`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [user]);

  // 🚀 Every time the WS or REST data updates, append a new line
  useEffect(() => {
    if (events.length === 0) return;
    const last = events[events.length - 1];
    let message = "";

    switch (last.type) {
      case "snapshot":
      case "metrics":
        message = `📊 Metrics: CPU ${snapshot?.cpu_usage}% · RAM ${snapshot?.memory_usage}%`;
        break;
      case "alerts":
        message = alerts.length
          ? `⚠️ Alerts: ${alerts.join(", ")}`
          : `✅ No active alerts`;
        break;
      case "safe_mode":
        message = `🔒 Safe mode ${last.data?.status}`;
        break;
    }

    setLog((l) => [
      ...l,
      {
        id: `${last.timestamp}-${last.type}`,
        type: last.type as SystemEventType,
        message,
        timestamp: last.timestamp,
      },
    ]);
  }, [events, snapshot, alerts]);

  // 📜 Auto-scroll to bottom on new entry
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log]);

  const getIcon = (type: SystemEventType) => {
    switch (type) {
      case "snapshot":
      case "metrics":
        return <Cpu className="w-4 h-4 text-spore-400" />;
      case "alerts":
      case "safe_mode":
        return <AlertTriangle className="w-4 h-4 text-fungal-400" />;
      default:
        return <Brain className="w-4 h-4 text-hyphae-400" />;
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`
        fixed bottom-4 right-4 w-96
        bg-dark-200/90 backdrop-blur-md
        rounded-xl border border-hyphae-500/20
        shadow-lg overflow-hidden
        ${minimized ? "h-12" : "h-96"}
      `}
    >
      {/* Header */}
      <div
        className="p-3 border-b border-hyphae-500/20 flex items-center justify-between cursor-pointer"
        onClick={() => setMinimized((v) => !v)}
      >
        <div className="flex items-center">
          <Terminal className="w-5 h-5 text-hyphae-400 mr-2" />
          <span className="text-white font-medium">
            MycoCore Console{user ? ` – ${user.username}` : ""}
          </span>
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-fungal-500" />
          <div className="w-2 h-2 rounded-full bg-spore-500" />
          <div className="w-2 h-2 rounded-full bg-hyphae-500" />
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {!minimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[calc(100%-3rem)]"
          >
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto p-4 font-mono text-sm space-y-3"
            >
              {log.map((evt) => (
                <motion.div
                  key={evt.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-start space-x-3"
                >
                  <div className="mt-1">{getIcon(evt.type)}</div>
                  <div>
                    <p className="text-gray-300">{evt.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MycoCore;
