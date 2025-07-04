// src/services/auth.ts
import { api } from "./api";

// ——————————————————————————————————————————————————————————————
// 1) Interfaces
// ——————————————————————————————————————————————————————————————

/**
 * Represents a registered or fetched user profile.
 */
export interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  verified?: boolean;
  pin_verified?: boolean;
  avatar?: string;    // add if you want avatars
}


/**
 * Result of a successful login.
 */
export interface AuthResult {
  id: number;
  username: string;
  role: string;
  token: string;
  pin_verified: boolean;
}

// ——————————————————————————————————————————————————————————————
// 2) Auth Endpoints
// ——————————————————————————————————————————————————————————————

/**
 * Register a new user.
 * POST /auth/register
 */
export async function registerUser(data: { username: string; email: string; password: string; pin: string }): Promise<User> {
  const res = await api.post<User>("/auth/register", data);
  return res.data;
}

/**
 * Log in an existing user and set the auth header on success.
 * POST /auth/login
 */
export async function login(credentials: { username: string; password: string; code?: string }): Promise<AuthResult> {
  const res = await api.post<AuthResult>("/auth/login", credentials);
  api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
  return res.data;
}

/**
 * Log out the current user and clear the auth header.
 * POST /auth/logout
 */
export async function logout(): Promise<void> {
  await api.post("/auth/logout");
  delete api.defaults.headers.common["Authorization"];
}

/**
 * Fetch the currently authenticated user’s profile.
 * GET /auth/me
 */
export async function getProfile(): Promise<User> {
  const res = await api.get<User>("/auth/me");
  return res.data;
}

/**
 * Refresh the access token via refresh cookie and update the auth header.
 * POST /auth/refresh
 */
export async function refreshToken(): Promise<string> {
  const res = await api.post<{ access_token: string }>("/auth/refresh");
  const token = res.data.access_token;
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  return token;
}

/**
 * Auto-login using refresh cookie; returns basic user info.
 * GET /auth/auto_login
 */
export async function autoLogin(): Promise<{ username: string; role: string }> {
  const res = await api.get<{ username: string; role: string }>("/auth/auto_login");
  return res.data;
}

/**
 * Set a new PIN for the authenticated user.
 * POST /auth/set_pin
 */
export async function setPin(pin: string): Promise<{ success: boolean; message: string }> {
  const res = await api.post<{ success: boolean; message: string }>("/auth/set_pin", { pin });
  return res.data;
}

/**
 * Verify the user’s PIN.
 * POST /auth/verify_pin
 */
export async function verifyPin(pin: string): Promise<{ success: boolean }> {
  const res = await api.post<{ success: boolean }>("/auth/verify_pin", { pin });
  return res.data;
}

/**
 * Change the user’s PIN.
 * POST /auth/change_pin
 */
export async function changePin(old_pin: string, new_pin: string): Promise<{ success: boolean; message: string }> {
  const res = await api.post<{ success: boolean; message: string }>("/auth/change_pin", { old_pin, new_pin });
  return res.data;
}

/**
 * Verify a user’s email address via token.
 * GET /auth/verify_email?token={token}
 */
export async function verifyEmail(token: string, email?: string): Promise<{ message: string }> {
  const params: Record<string, string> = { token };
  if (email) params.email = email;
  const query = new URLSearchParams(params).toString();
  const res = await api.get<{ message: string }>(`/auth/verify_email?${query}`);
  return res.data;
}

/**
 * Check if the current JWT is authenticated.
 * GET /auth/status
 */
export async function getAuthStatus(): Promise<{ status: string; username: string; role: string }> {
  const res = await api.get<{ status: string; username: string; role: string }>("/auth/status");
  return res.data;
}

/**
 * Admin-only access test.
 * GET /auth/admin_only
 */
export async function adminCheck(): Promise<{ message: string }> {
  const res = await api.get<{ message: string }>("/auth/admin_only");
  return res.data;
}

/**
 * Request a password reset email.
 * POST /auth/password-reset/request
 */
export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>("/auth/password-reset/request", { email });
  return res.data;
}

/**
 * Verify password reset token and set new password.
 * POST /auth/password-reset/verify
 */
export async function verifyResetToken(token: string, new_password: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>("/auth/password-reset/verify", { token, new_password });
  return res.data;
}

export type { User as AuthUser } from "./auth";