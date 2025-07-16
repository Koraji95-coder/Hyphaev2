// src/agents/mycocore/MycoCore.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import MycoCoreEventBus, { MycoCoreEvent, MycoCoreEventType } from "./eventBus";
import { Terminal, Mail, AlertTriangle, Lock, Key, Download, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type SystemEventType = MycoCoreEventType | "log";
interface SystemEvent {
  id: string;
  type: SystemEventType;
  message: string;
  timestamp: string;
}

const IMPORTANT_TYPES: SystemEventType[] = [
  "auth_success", "auth_error", "email", "email_verified",
  "warning", "alert", "log", "username",
];

const uniqueId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function toCSV(rows: SystemEvent[]): string {
  if (!rows.length) return "";
  const header = Object.keys(rows[0]).join(",");
  const csvRows = rows.map(evt =>
    [evt.type, `"${evt.message.replace(/"/g, '""')}"`, evt.timestamp, evt.id]
      .join(",")
  );
  return [header, ...csvRows].join("\r\n");
}

export default function MycoCore() {
  const { user } = useAuth();
  const [log, setLog] = useState<SystemEvent[]>([]);
  const [minimized, setMinimized] = useState(false);
  const [search, setSearch] = useState("");
  const logRef = useRef<SystemEvent[]>([]);
  const recentEventKeysRef = useRef<Set<string>>(new Set());

  // Deduplication
  function isDuplicate(evt: MycoCoreEvent) {
    const ts = evt.timestamp ? evt.timestamp.slice(0, 19) : '';
    const key = `${evt.type}|${evt.message}|${ts}`;
    if (recentEventKeysRef.current.has(key)) return true;
    recentEventKeysRef.current.add(key);
    if (recentEventKeysRef.current.size > 100) {
      const keys = Array.from(recentEventKeysRef.current);
      recentEventKeysRef.current = new Set(keys.slice(-100));
    }
    return false;
  }

  // Load/save to localStorage (by user)
  useEffect(() => {
    if (user?.id) {
      try {
        const saved = localStorage.getItem(`mycocore-log-${user.id}`);
        if (saved) setLog(JSON.parse(saved));
      } catch { setLog([]); }
    }
  }, [user?.id]);
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`mycocore-log-${user.id}`, JSON.stringify(log));
    }
    logRef.current = log;
  }, [log, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let unsubscribed = false;
    const unsub = MycoCoreEventBus.subscribe((evt: MycoCoreEvent) => {
      if (unsubscribed) return;
      if (!IMPORTANT_TYPES.includes(evt.type as SystemEventType)) return;
      if (isDuplicate(evt)) return;
      const type = evt.type as SystemEventType;
      const id = uniqueId(type);
      setLog(existing => [
        ...existing,
        { id, type, message: evt.message, timestamp: evt.timestamp || new Date().toISOString() }
      ].slice(-100));
    });
    return () => {
      unsubscribed = true;
      unsub();
    };
  }, [user?.id]);

  // Clear
  const handleClear = () => {
    setLog([]);
    if (user?.id) localStorage.removeItem(`mycocore-log-${user.id}`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const filtered = filteredLog();
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mycocore_log_${user?.username || "user"}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 500);
  };

  // Filtered log
  const filteredLog = useCallback(() => {
    if (!search) return log;
    const q = search.toLowerCase();
    return log.filter(evt =>
      evt.type.toLowerCase().includes(q) ||
      evt.message.toLowerCase().includes(q) ||
      evt.timestamp.toLowerCase().includes(q) ||
      evt.id.toLowerCase().includes(q)
    );
  }, [search, log]);

  const getIcon = useCallback((type: SystemEventType) => {
    switch (type) {
      case "email": return <Mail className="w-4 h-4 text-blue-400" />;
      case "email_verified": return <Mail className="w-4 h-4 text-green-400" />;
      case "warning":
      case "alert": return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "auth_success": return <Terminal className="w-4 h-4 text-green-400" />;
      case "auth_error": return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "password": return <Lock className="w-4 h-4 text-purple-400" />;
      case "pin": return <Key className="w-4 h-4 text-orange-400" />;
      default: return <Terminal className="w-4 h-4 text-green-400" />;
    }
  }, []);

  return (
    <div className={`
      fixed bottom-4 right-4 z-50 w-96
      bg-black/80 backdrop-blur-md rounded-lg
      border border-green-700 shadow-lg overflow-hidden
      ${minimized ? "h-12" : "h-[30rem]"}
    `}>
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
        <div className="flex items-center space-x-2">
          <button title="Export CSV"
            className="text-green-400 hover:text-green-300"
            onClick={e => { e.stopPropagation(); handleExportCSV(); }}
          >
            <Download className="w-4 h-4 inline" /> Export
          </button>
          <button title="Clear all"
            className="text-green-400 hover:text-green-300"
            onClick={e => { e.stopPropagation(); handleClear(); }}>
            🧹
          </button>
        </div>
      </div>
      {!minimized && (
        <>
          <div className="px-3 py-2 border-b border-green-700 flex items-center bg-black">
            <Search className="w-4 h-4 mr-2 text-green-400" />
            <input
              className="w-full bg-black text-green-100 border-none outline-none"
              placeholder="Filter log…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="h-[calc(100%-5rem)] overflow-y-auto px-3 py-2 font-mono text-xs text-green-200">
            {filteredLog().length === 0 ? (
              <div className="text-green-600">No matching log entries.</div>
            ) : filteredLog().map(evt =>
              <div key={evt.id} className="mb-1 bg-black/50 px-2 py-1 rounded">
                <div className="flex items-start space-x-2">
                  <div className="mt-0.5">{getIcon(evt.type)}</div>
                  <div>
                    <p className="text-green-100">{evt.message}</p>
                    <div className="flex text-green-600 text-[10px] space-x-2">
                      <span>{evt.type}</span>
                      <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                      <span>{evt.id.slice(-6)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
