// src/hooks/useDatabase.ts
import { useState, useCallback } from "react";
import {
  listDbConnections,
  createDbConnection,
  getDbStructure,
  getDbMetrics,
} from "@/services/database";
import type {
  ConnectionOut,
  ConnectionCreate,
  ConnectionParams,
  StructureItem,
  DatabaseMetrics,
} from "@/services/database";

export function useDatabase() {
  const [connections, setConnections] = useState<ConnectionOut[]>([]);
  const [structure, setStructure]   = useState<StructureItem[]>([]);
  const [metrics, setMetrics]       = useState<DatabaseMetrics | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // 1) List all saved connections
  const listConnections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const conns = await listDbConnections();
      setConnections(conns);
    } catch (err: any) {
      setError(err.message || "Could not load connections");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2) Create a new connection
  const createConnection = useCallback(
    async (data: ConnectionCreate) => {
      setLoading(true);
      setError(null);
      try {
        const newConn = await createDbConnection(data);
        setConnections((prev) => [...prev, newConn]);
        return newConn;
      } catch (err: any) {
        setError(err.message || "Could not create connection");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 3) Fetch structure for a given connection
  const inspectStructure = useCallback(
    async (params: ConnectionParams) => {
      setLoading(true);
      setError(null);
      try {
        const { items } = await getDbStructure(params);
        setStructure(items);
        return items;
      } catch (err: any) {
        setError(err.message || "Could not get structure");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 4) Fetch overall database metrics
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const m = await getDbMetrics();
      setMetrics(m);
    } catch (err: any) {
      setError(err.message || "Could not get metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    connections,
    structure,
    metrics,
    loading,
    error,
    listConnections,
    createConnection,
    inspectStructure,
    fetchMetrics,
  };
}
