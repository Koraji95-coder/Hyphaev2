//frontend/src/services/plugins.ts

import { api } from "./api";

// Plugin info as returned by /plugins/list
export interface PluginInfo {
  name: string;
  description?: string;
  version?: string;
  [key: string]: unknown; // for future extensibility
}

// Result from executing a plugin
export interface PluginExecutionResult {
  status: string; // "ok" | "error"
  result: unknown;    // the actual result, structure varies by plugin
  trace_id?: string;
}

// Result from executing a chain of plugins
export interface PluginChainResult {
  status: string; // usually "ok"
  results: Array<{
    plugin: string;
    status: string;
    result?: unknown;
    error?: string;
    timestamp: string;
  }>;
  metadata?: Record<string, unknown>;
}


// 1. List all available plugins
export async function listPlugins(): Promise<PluginInfo[]> {
  const res = await api.get<{ status: string; plugins: PluginInfo[] }>("/plugins/list");
  return res.data.plugins;
}

// 2. Execute a single plugin
export async function executePlugin(
  name: string,
  input: Record<string, unknown>,
  traceId?: string
): Promise<PluginExecutionResult> {
  const headers = traceId ? { "X-Trace-ID": traceId } : {};
  const res = await api.post<PluginExecutionResult>(
    "/plugins/execute",
    { name, input },
    { headers }
  );
  return res.data;
}

// 3. Execute a chain of plugins
export async function executePluginChain(
  plugins: Array<{ name: string; input: Record<string, unknown> }>,
  metadata?: Record<string, unknown>
): Promise<PluginChainResult> {
  const res = await api.post<PluginChainResult>(
    "/plugins/chain",
    { plugins, metadata: metadata || {} }
  );
  return res.data;
}