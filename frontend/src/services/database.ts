// services/database.ts
import { api } from "./api";

// ———————————————————————————————————————————————————————————————————————————————
// 1) Types
// ———————————————————————————————————————————————————————————————————————————————
export interface ConnectionParams {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface ConnectionCreate {
  name: string;
  params: ConnectionParams;
}

export interface ConnectionOut {
  id: string;           // uuid
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  ssl: boolean;
  // if your Pydantic model also returns created_at:
  created_at?: string;
}

export interface StructureItem {
  id: string;
  parentId: string | null;
  label: string;
}

export interface TableRow { [key: string]: any; }
export interface TableData { rows: TableRow[]; }

export interface DatabaseMetrics {
  databaseSize: string;
  tables: number;
  activeConnections: number;
  uptime: string;
  queriesPerSecond: number;
  cacheHitRatio: number;
}

// ———————————————————————————————————————————————————————————————————————————————
// 2) Endpoints
// ———————————————————————————————————————————————————————————————————————————————

/**
 * GET /api/connections
 */
export async function listDbConnections(): Promise<ConnectionOut[]> {
  const res = await api.get<ConnectionOut[]>("/connections");
  return res.data;
}

/**
 * POST /api/connections
 */
export async function createDbConnection(data: ConnectionCreate): Promise<ConnectionOut> {
  const res = await api.post<ConnectionOut>("/connections", data);
  return res.data;
}

/**
 * POST /api/structure
 */
export async function getDbStructure(params: ConnectionParams): Promise<{ items: StructureItem[] }> {
  const res = await api.post<{ items: StructureItem[] }>("/structure", params);
  return res.data;
}

/**
 * GET /api/database/{database}/schema/{schema}/table/{table}
 */
export async function getTableData(
  database: string,
  schema: string,
  table: string
): Promise<TableData> {
  const res = await api.get<TableData>(`/database/${database}/schema/${schema}/table/${table}`);
  return res.data;
}

/**
 * GET /api/metrics/database
 */
export async function getDbMetrics(): Promise<DatabaseMetrics> {
  const res = await api.get<DatabaseMetrics>("/metrics/database");
  return res.data;
}
