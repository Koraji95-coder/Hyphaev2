import { useState } from "react";
import { listPlugins, executePlugin, executePluginChain } from "@/services/plugins";

export function usePlugins() {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchPlugins() {
    setLoading(true);
    setError(null);
    try {
      const res = await listPlugins();
      setPlugins(res);
    } catch (err: any) {
      setError(err?.message || "Failed to list plugins");
    } finally {
      setLoading(false);
    }
  }

  async function runPlugin(name: string, input: any, traceId?: string) {
    setLoading(true);
    setError(null);
    try {
      return await executePlugin(name, input, traceId);
    } catch (err: any) {
      setError(err?.message || "Plugin execution failed");
    } finally {
      setLoading(false);
    }
  }

  async function runPluginChain(chain: any[], metadata?: any) {
    setLoading(true);
    setError(null);
    try {
      return await executePluginChain(chain, metadata);
    } catch (err: any) {
      setError(err?.message || "Plugin chain execution failed");
    } finally {
      setLoading(false);
    }
  }

  return { plugins, fetchPlugins, runPlugin, runPluginChain, loading, error };
}
