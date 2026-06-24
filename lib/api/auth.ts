import apiClient from "./client";
import type { TokenPair, User, UserSession } from "./types";

// ─── Register ─────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  timezone?: string;
}

export interface RegisterResponse {
  tokens: TokenPair;
  user: User;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await apiClient.post<RegisterResponse>("/auth/register", data);
  return res.data;
}

// ─── Login ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  tokens: TokenPair;
  user?: User;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/auth/login", data);
  return res.data;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout", {});
}

// ─── Refresh token ────────────────────────────────────────────────────────────

export interface RefreshResponse {
  tokens: TokenPair;
}

export async function refreshToken(): Promise<RefreshResponse> {
  const res = await apiClient.post<RefreshResponse>("/auth/refresh", {});
  return res.data;
}

// ─── Get current user ─────────────────────────────────────────────────────────

export async function getMe(): Promise<User> {
  const res = await apiClient.get<{ user: User }>("/auth/me");
  return res.data.user;
}

// ─── Change password ──────────────────────────────────────────────────────────

export async function changePassword(data: {
  old_password: string;
  new_password: string;
}): Promise<void> {
  await apiClient.post("/auth/password/change", data);
}

// ─── OTP ──────────────────────────────────────────────────────────────────────

export async function requestOTP(phone: string): Promise<void> {
  await apiClient.post("/auth/otp/request", { phone });
}

export async function verifyOTP(data: {
  phone: string;
  otp: string;
}): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/auth/otp/verify", data);
  return res.data;
}

// ─── Password reset ───────────────────────────────────────────────────────────

export async function resetPasswordRequest(email: string): Promise<void> {
  await apiClient.post("/auth/password/reset/request", { email });
}

export async function resetPasswordConfirm(data: {
  token: string;
  new_password: string;
}): Promise<void> {
  await apiClient.post("/auth/password/reset/confirm", data);
}

// ─── 2FA ──────────────────────────────────────────────────────────────────────

export interface Enable2FAResponse {
  secret: string;
  totp_uri: string;
}

export async function enable2FA(): Promise<Enable2FAResponse> {
  const res = await apiClient.post<Enable2FAResponse>("/auth/2fa/enable", {});
  return res.data;
}

export async function verify2FA(totp_code: string): Promise<void> {
  await apiClient.post("/auth/2fa/verify", { totp_code });
}

export async function disable2FA(password: string): Promise<void> {
  await apiClient.post("/auth/2fa/disable", { password });
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function getSessions(): Promise<UserSession[]> {
  const res = await apiClient.get<{ sessions: UserSession[] }>("/auth/sessions");
  return res.data.sessions;
}

export async function revokeSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/auth/sessions/${sessionId}`);
}

export async function revokeAllSessions(): Promise<void> {
  await apiClient.delete("/auth/sessions");
}
