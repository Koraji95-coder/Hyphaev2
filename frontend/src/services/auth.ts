// src/services/auth.ts
import { api } from "./api";
import { AxiosError } from "axios";

//
// ——————————————————————————————————————————————————————————————
// 1) Shared response interfaces
// ——————————————————————————————————————————————————————————————
export interface AuthResult {
  id: number;
  username: string;
  role: string;
  access_token: string;
  pin_verified: boolean;
}

export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  pending_email?: string;
  role: string;
  verified?: boolean;
  pin_verified?: boolean;
  avatar?: string;
}

export interface SimpleMessage {
  message: string;
}

//
// ——————————————————————————————————————————————————————————————
// 2) Standard auth endpoints
// ——————————————————————————————————————————————————————————————
export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
  pin: string;
}): Promise<UserProfile> {
  const res = await api.post<UserProfile>("/auth/register", data);
  return res.data;
}

export async function login(credentials: {
  username: string;
  password: string;
}): Promise<AuthResult> {
  try {
    const res = await api.post<AuthResult>("/auth/login", credentials);
    if (!res.data || !res.data.access_token) {
      throw new Error("Invalid or missing access token in login response");
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`;
    localStorage.setItem("auth_access_token", res.data.access_token);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      throw new Error("Invalid username or password. Please try again.");
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
  delete api.defaults.headers.common["Authorization"];
  localStorage.removeItem("auth_access_token");
}

export async function getProfile(): Promise<UserProfile> {
  const res = await api.get<UserProfile>("/auth/me");
  return res.data;
}

export async function refreshToken(): Promise<{ access_token: string }> {
  try {
    const res = await api.post<{ access_token: string }>("/auth/refresh");
    if (!res.data || !res.data.access_token) {
      throw new Error("Invalid or missing access token in refresh response");
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`;
    localStorage.setItem("auth_access_token", res.data.access_token);
    return res.data;
  } catch (error) {
    console.error("Refresh token failed:", error);
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("auth_access_token");
    throw new Error("Failed to refresh token. Please log in again.");
  }
}

export async function autoLogin(): Promise<{ username: string; role: string }> {
  const res = await api.get<{ username: string; role: string }>("/auth/auto_login");
  return res.data;
}

export async function setPin(pin: string): Promise<SimpleMessage> {
  const res = await api.post<SimpleMessage>("/auth/set_pin", { pin });
  return res.data;
}

export async function verifyPin(pin: string): Promise<{ success: boolean }> {
  const res = await api.post<{ success: boolean }>("/auth/verify_pin", { pin });
  return res.data;
}

export async function changePin(
  old_pin: string,
  new_pin: string
): Promise<SimpleMessage> {
  const res = await api.post<SimpleMessage>("/auth/change_pin", {
    old_pin,
    new_pin,
  });
  return res.data;
}

export async function changePassword(
  old_password: string,
  new_password: string
): Promise<SimpleMessage> {
  const res = await api.post<SimpleMessage>("/auth/change_password", {
    old_password,
    new_password,
  });
  return res.data;
}

export async function verifyEmail(
  token: string,
  email?: string
): Promise<VerifyEmailResponse> {
  const params: Record<string, string> = { token };
  if (email) params.email = email;
  try {
    const res = await api.get<SimpleMessage>(
      `/auth/verify_email?${new URLSearchParams(params)}`
    );
    return { message: res.data.message, success: true };
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    const errorDetail = axiosError.response?.data?.detail?.toLowerCase() || "";
    if (errorDetail.includes("already verified")) {
      return { message: "This email was already verified. You may log in.", success: true };
    } else if (errorDetail.includes("invalid") || errorDetail.includes("expired")) {
      return {
        message: "Verification failed. The link may be invalid or expired.",
        success: false,
      };
    }
    return {
      message: "An error occurred. Please try again or contact support.",
      success: false,
      error: axiosError.message,
    };
  }
}

export async function getAuthStatus(): Promise<{
  status: string;
  username: string;
  role: string;
}> {
  const res = await api.get<{
    status: string;
    username: string;
    role: string;
  }>("/auth/status");
  return res.data;
}

export async function adminCheck(): Promise<SimpleMessage> {
  const res = await api.get<SimpleMessage>("/auth/admin_only");
  return res.data;
}

export async function requestPasswordReset(email: string): Promise<SimpleMessage> {
  const res = await api.post<SimpleMessage>("/auth/password-reset/request", { email });
  return res.data;
}

export function checkResetToken(token: string) {
  return api.get<SimpleMessage>("/auth/password-reset/check", {
    params: { token },
  });
}

export function confirmResetPassword(token: string, new_password: string) {
  return api.post<SimpleMessage>("/auth/password-reset/confirm", {
    token,
    new_password,
  });
}

export async function changeUsername(
  new_username: string
): Promise<SimpleMessage> {
  const res = await api.post<SimpleMessage>("/auth/change_username", {
    new_username,
  });
  return res.data;
}

export async function changeEmail(new_email: string): Promise<SimpleMessage> {
  try {
    const res = await api.post<SimpleMessage>("/auth/change_email", {
      new_email,
    });
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await refreshToken();
      const res = await api.post<SimpleMessage>("/auth/change_email", {
        new_email,
      });
      return res.data;
    }
    throw error;
  }
}

export async function verifyEmailChange(token: string): Promise<SimpleMessage> {
  const res = await api.get<SimpleMessage>("/auth/verify_email_change", { params: { token } });
  return res.data;
}

export async function cancelPendingEmail(): Promise<SimpleMessage> {
  const res = await api.post<SimpleMessage>("/auth/cancel_pending_email");
  return res.data;
}

export async function resendVerification(): Promise<SimpleMessage> {
  const res = await api.post<SimpleMessage>("/auth/resend_verification");
  return res.data;
}

export interface VerifyEmailResponse {
  message: string;
  success: boolean;
  error?: string;
}