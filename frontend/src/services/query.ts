import { api } from "./api";

// (Optional) Define the QueryOut interface if you don’t have it yet
export interface QueryOut {
  id: string | number;
  user_id: string | number;
  query: string;
  timestamp: string;
  // ...add any other fields from your backend QueryHistory/QueryOut
}

// Fetch recent queries (admin-only)
export async function getRecentQueries(limit = 10): Promise<QueryOut[]> {
  const res = await api.get<QueryOut[]>("/queries/recent", { params: { limit } });
  return res.data;
}
