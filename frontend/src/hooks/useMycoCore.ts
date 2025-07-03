// src/hooks/useMycoCore.ts
import { useState, useEffect, useCallback } from "react";
import {
  getMycoCoreSnapshot,
  getMycoCoreAlerts,
} from "@/services/mycocore";
import { useAgentStream } from "@/hooks/useAgentStream";

export function useMycoCore() {
  const [snapshot, setSnapshot] = useState<any>(null);
  const [alerts,   setAlerts]   = useState<string[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // subscribe to live events
  const events = useAgentStream("/mycocore/stream");

  const fetchSnapshot = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await getMycoCoreSnapshot();
      setSnapshot(res);
    } catch (err: any) {
      setError(err.message || "Failed to fetch snapshot");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await getMycoCoreAlerts();
      setAlerts(res.alerts || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  // on mount, load both
  useEffect(() => {
    fetchSnapshot();
    fetchAlerts();
  }, [fetchSnapshot, fetchAlerts]);

  // whenever a new WS event comes in, update snapshot or alerts
  useEffect(() => {
    if (events.length === 0) return;
    const last = events[events.length - 1];

    switch (last.type) {
      case "snapshot":
      case "metrics":
        setSnapshot(last.data ?? last);
        break;
      case "alerts":
        setAlerts(last.data?.alerts ?? alerts);
        break;
      default:
        break;
    }
  }, [events]);

  return {
    snapshot,
    alerts,
    events,
    loading,
    error,
    fetchSnapshot,
    fetchAlerts,
  };
}
