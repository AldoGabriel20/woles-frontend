import axios from "axios";
import Cookies from "js-cookie";
import apiClient from "./client";
import type { TokenPair, User, UserSession } from "./types";

// ─── Auth proxy client ────────────────────────────────────────────────────────
// Routes login / register / refresh / logout through the Next.js API proxy at
// /api/auth/* so that Set-Cookie responses (refresh_token, csrf_token) are
// stored on localhost:3000 — the same origin the proxy.ts middleware reads.
const _MUTATING = new Set(["post", "put", "patch", "delete"]);

const authProxyClient = axios.create({
  baseURL: "/api/auth",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

authProxyClient.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toLowerCase();
  if (_MUTATING.has(method)) {
    const csrfToken = Cookies.get("csrf_token");
    if (csrfToken) config.headers.set("X-CSRF-Token", csrfToken);
  }
  return config;
});

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
  const res = await authProxyClient.post<RegisterResponse>("/register", data);
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
  const res = await authProxyClient.post<LoginResponse>("/login", data);
  return res.data;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await authProxyClient.post("/logout", {});
}

// ─── Refresh token ────────────────────────────────────────────────────────────

export interface RefreshResponse {
  tokens: TokenPair;
}

export async function refreshToken(): Promise<RefreshResponse> {
  const res = await authProxyClient.post<RefreshResponse>("/refresh", {});
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
