import { api } from "./api";

// --- Types ---
export interface VerifyRequest {
  code: string;
  type?: "pin" | "totp";
}

export interface VerifyResponse {
  success: boolean;
  message?: string;
  attempts_remaining?: number;
}

export interface TotpSetupResponse {
  secret: string;
  uri: string;
  qr_code: string; // base64 PNG string
}

export interface VerifyStats {
  success_count: number;
  failure_count: number;
  locked_users: number;
  timestamp: string;
}

// --- API Calls ---

// Verify TOTP or PIN code (default to TOTP for now)
export async function verifyCode(data: VerifyRequest): Promise<VerifyResponse> {
  const res = await api.post<VerifyResponse>("/verify", data);
  return res.data;
}

// Setup TOTP 2FA (returns QR, secret, uri)
export async function setupVerification(): Promise<TotpSetupResponse> {
  const res = await api.post<TotpSetupResponse>("/verify/setup");
  return res.data;
}

// Get verification stats (admin or user)
export async function getVerifyStats(): Promise<VerifyStats> {
  const res = await api.get<VerifyStats>("/verify/stats");
  return res.data;
}
