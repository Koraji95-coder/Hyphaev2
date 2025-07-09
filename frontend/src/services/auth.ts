// src/services/auth.ts
import { api } from "./api";

// ——————————————————————————————————————————————————————————————
// 1) Interfaces
// ——————————————————————————————————————————————————————————————

export interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  verified?: boolean;
  pin_verified?: boolean;
  avatar?: string;
}

export interface AuthResult {
  id: number;
  username: string;
  role: string;
  access_token: string;
  pin_verified: boolean;
}

// ——————————————————————————————————————————————————————————————
// 2) Auth Endpoints
// ——————————————————————————————————————————————————————————————

export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
  pin: string;
}): Promise<User> {
  const res = await api.post<User>("/auth/register", data);
  return res.data;
}

export async function login(credentials: {
  username: string;
  password: string;
}): Promise<AuthResult> {
  const res = await api.post<AuthResult>("/auth/login", credentials);
  const { access_token } = res.data;
  api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
  return res.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
  delete api.defaults.headers.common["Authorization"];
}

export async function getProfile<T = any>(): Promise<T> {
  const res = await api.get<T>("/auth/me");
  return res.data;
}

export async function refreshToken(): Promise<{ access_token: string }> {
  const res = await api.post<{ access_token: string }>("/auth/refresh");
  api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`;
  return res.data;
}

export async function autoLogin(): Promise<{ username: string; role: string }> {
  const res = await api.get<{ username: string; role: string }>("/auth/auto_login");
  return res.data;
}

export async function setPin(pin: string): Promise<{ success: boolean; message: string }> {
  const res = await api.post<{ success: boolean; message: string }>("/auth/set_pin", { pin });
  return res.data;
}

export async function verifyPin(pin: string): Promise<{ success: boolean }> {
  const res = await api.post<{ success: boolean }>("/auth/verify_pin", { pin });
  return res.data;
}

export async function changePin(
  old_pin: string,
  new_pin: string
): Promise<{ success: boolean; message: string }> {
  const res = await api.post<{ success: boolean; message: string }>("/auth/change_pin", {
    old_pin,
    new_pin,
  });
  return res.data;
}

export async function verifyEmail(
  token: string,
  email?: string
): Promise<{ message: string }> {
  const params: Record<string, string> = { token };
  if (email) params.email = email;
  const q = new URLSearchParams(params).toString();
  const res = await api.get<{ message: string }>(`/auth/verify_email?${q}`);
  return res.data;
}

export async function getAuthStatus(): Promise<{ status: string; username: string; role: string }> {
  const res = await api.get<{ status: string; username: string; role: string }>("/auth/status");
  return res.data;
}

export async function adminCheck(): Promise<{ message: string }> {
  const res = await api.get<{ message: string }>("/auth/admin_only");
  return res.data;
}

export async function requestPasswordReset(
  email: string
): Promise<{ message: string; username: string }> {
  const res = await api.post<{ message: string; username: string }>(
    "/auth/password-reset/request",
    { email }
  );
  return res.data;
}

export async function verifyResetToken(
  token: string,
  new_password: string
): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>("/auth/password-reset/verify", {
    token,
    new_password,
  });
  return res.data;
}
