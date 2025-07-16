//src/services/user.ts
import { api } from "./api";

// User profile (matches response_model=UserProfile)
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  pending_email?: string;
  role: string;
  verified: boolean;
  last_login?: string | null;
}

// Paginated list of users
export interface UserList {
  users: UserProfile[];
  total: number;
  page: number;
  per_page: number;
}

// List all users (admin only)
export async function listUsers(page = 1, per_page = 20, role?: string): Promise<UserList> {
  const params: Record<string, unknown> = { page, per_page };
  if (role) params.role = role;
  const res = await api.get<UserList>("/users", { params });
  return res.data;
}

// Get single user (admin or self)
export async function getUser(user_id: string): Promise<UserProfile> {
  const res = await api.get<UserProfile>(`/users/${user_id}`);
  return res.data;
}

// Update user (admin)
export async function updateUser(user_id: string, data: UserProfile): Promise<UserProfile> {
  const res = await api.put<UserProfile>(`/users/${user_id}`, data);
  return res.data;
}

// Delete user (admin)
export async function deleteUser(user_id: string): Promise<{ status: string; message: string }> {
  const res = await api.delete<{ status: string; message: string }>(`/users/${user_id}`);
  return res.data;
}
