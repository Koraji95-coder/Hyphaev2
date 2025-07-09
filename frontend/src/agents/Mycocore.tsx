// src/components/agents/MycoCore.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, AlertTriangle, Cpu, Brain } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMycoCore } from "@/hooks/useMycoCore";
import { useTerminal } from "@/contexts/TerminalContext";

type SystemEventType = "snapshot" | "metrics" | "alerts" | "safe_mode" | "ui";

interface SystemEvent {
  id: string;
  type: SystemEventType;
  message: string;
  timestamp: string;
}

const uniqueId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function MycoCore() {
  const { user } = useAuth();
  const { snapshot, alerts, events: coreEvents } = useMycoCore();
  const { lines: uiLines, clear: clearUi } = useTerminal();

  const [log, setLog] = useState<SystemEvent[]>([]);
  const [minimized, setMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1) on login, push a single “connected” message
  useEffect(() => {
    if (!user) return;
    setLog((existing) => [
      ...existing,
      {
        id: uniqueId("connect"),
        type: "snapshot",
        message: `🟢 WebSocket connected for ${user.username}`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [user]);

  // 2) append any new coreEvents, but skip duplicates
  useEffect(() => {
    if (coreEvents.length === 0) return;
    const last = coreEvents[coreEvents.length - 1];
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

    setLog((existing) => {
      const prev = existing[existing.length - 1]?.message;
      if (prev === message) return existing;
      return [
        ...existing,
        {
          id: uniqueId(last.type),
          type: last.type as SystemEventType,
          message,
          timestamp: last.timestamp,
        },
      ];
    });

    setIsTyping(true);
    const t = setTimeout(() => setIsTyping(false), 300);
    return () => clearTimeout(t);
  }, [coreEvents, snapshot, alerts]);

  // 3) drain any UI‐lines into the same log
  useEffect(() => {
    if (uiLines.length === 0) return;
    const now = new Date().toISOString();
    const entries = uiLines.map((msg) => ({
      id: uniqueId("ui"),
      type: "ui" as const,
      message: msg,
      timestamp: now,
    }));

    setLog((existing) => [...existing, ...entries]);
    clearUi();

    setIsTyping(true);
    const t = setTimeout(() => setIsTyping(false), 300);
    return () => clearTimeout(t);
  }, [uiLines, clearUi]);

  // auto scroll to bottom on new lines or typing indicator
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [log, isTyping]);

  const getIcon = (type: SystemEventType) => {
    switch (type) {
      case "snapshot":
      case "metrics":
        return <Cpu className="w-4 h-4 text-spore-400" />;
      case "alerts":
      case "safe_mode":
        return <AlertTriangle className="w-4 h-4 text-fungal-400" />;
      case "ui":
        return <Brain className="w-4 h-4 text-hyphae-400" />;
      default:
        return <Terminal className="w-4 h-4 text-hyphae-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        fixed bottom-4 right-4 w-80
        bg-black/80 backdrop-blur-md
        rounded-lg border border-green-700
        shadow-lg overflow-hidden
        ${minimized ? "h-12" : "h-96"}
      `}
    >
      {/* header */}
      <div
        className="flex items-center justify-between px-3 py-1 border-b border-green-600 cursor-pointer"
        onClick={() => setMinimized((v) => !v)}
      >
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-green-400" />
          <span className="text-green-300 font-semibold">
            MycoCore AI{user ? ` — ${user.username}` : ""}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            clearUi();
            setLog([]);
          }}
          title="Clear all"
          className="text-green-500 hover:text-green-400"
        >
          🧹
        </button>
      </div>

      {/* body */}
      <AnimatePresence>
        {!minimized && (
          <motion.div
            key="body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[calc(100%-2.5rem)]"
          >
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto px-3 py-2 font-mono text-xs text-green-200"
              style={{
                background:
                  "repeating-linear-gradient(0deg, transparent 0px, rgba(0,0,0,0.05) 1px)",
              }}
            >
              {log.map((evt) => (
                <motion.div
                  key={evt.id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="mb-1 bg-black/50 px-2 py-1 rounded"
                >
                  <div className="flex items-start space-x-2">
                    <div className="mt-0.5">{getIcon(evt.type)}</div>
                    <div>
                      <p className="text-green-100">{evt.message}</p>
                      <p className="text-green-600 text-[10px]">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="italic text-green-400 px-2 py-1">…typing</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
