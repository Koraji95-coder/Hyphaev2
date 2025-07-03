// src/hooks/useSystemState.ts
import { useState, useCallback } from "react";
import type {
  SystemState,
  MemoryState,
  MemoryEntry,
} from "@/services/state";
import {
  getSystemState,
  getMemoryState,
  getUserMemoryChain,
  getUserMemoryValue,
  clearUserMemoryValue,
} from "@/services/state";

export function useSystemState() {
  const [state,    setState]    = useState<SystemState | null>(null);
  const [memState, setMemState] = useState<MemoryState  | null>(null);
  const [chain,    setChain]    = useState<MemoryEntry[]>([]);
  const [value,    setValue]    = useState<any>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const fetchSystemState = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getSystemState();
      setState(s);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMemoryState = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const m = await getMemoryState();
      setMemState(m);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserChain = useCallback(async (user: string) => {
    setLoading(true);
    setError(null);
    try {
      const c = await getUserMemoryChain(user);
      setChain(c);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMemoryValue = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const v = await getUserMemoryValue(key);
      setValue(v);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMemoryValue = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      await clearUserMemoryValue(key);
      setValue(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    state,
    memState,
    chain,
    value,
    loading,
    error,
    fetchSystemState,
    fetchMemoryState,
    fetchUserChain,
    fetchMemoryValue,
    removeMemoryValue,
  };
}
