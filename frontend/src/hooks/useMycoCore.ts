// src/hooks/useMycoCore.ts
import { useState, useEffect, useCallback } from "react";
import {
  getMycoCoreSnapshot,
  getMycoCoreAlerts,
  MycoCoreSnapshot,
} from "@/services/mycocore";
import { useAgentStream } from "@/hooks/useAgentStream";

export function useMycoCore() {
  // Strict types!
  const [snapshot, setSnapshot] = useState<MycoCoreSnapshot | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // stream of *all* events from the server
  const { events, isConnected, error: wsError } = useAgentStream("/mycocore/stream");

  const fetchSnapshot = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMycoCoreSnapshot();
      setSnapshot(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMycoCoreAlerts();
      setAlerts(Array.isArray(res.alerts) ? res.alerts : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // initial load
  useEffect(() => {
    fetchSnapshot();
    fetchAlerts();
  }, [fetchSnapshot, fetchAlerts]);

  // React to WS *alerts* only
  useEffect(() => {
    if (!isConnected || wsError || !events.length) return;
    const last = events[events.length - 1];
    if (!last || typeof last !== "object") return;

    switch (last.type) {
      case "alerts":
        setAlerts(Array.isArray(last.data?.alerts) ? last.data.alerts : alerts);
        break;
      // system_metrics is ignored here by design
    }
  }, [events, isConnected, wsError, alerts]);

  return {
    snapshot,        // you can still expose it, but it will not be updated by WS
    alerts,
    events,
    loading,
    error,
    fetchSnapshot,
    fetchAlerts,
    isConnected,
    wsError,
  };
}
