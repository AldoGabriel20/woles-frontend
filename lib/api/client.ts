import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";
import { tokenStore } from "./token-store";

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

// ─── Axios instance ───────────────────────────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1",
  withCredentials: true, // required for HttpOnly refresh_token cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Attach Bearer token from in-memory store
    const token = tokenStore.get();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    // 2. Attach CSRF token on mutating methods
    const method = (config.method ?? "get").toLowerCase();
    if (MUTATING_METHODS.has(method)) {
      const csrfToken = Cookies.get("csrf_token");
      if (csrfToken) {
        config.headers.set("X-CSRF-Token", csrfToken);
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor — silent refresh on 401 ────────────────────────────

// Flag to prevent infinite retry loops while a refresh is in-flight.
let _isRefreshing = false;
let _refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(token: string) {
  _refreshSubscribers.forEach((cb) => cb(token));
  _refreshSubscribers = [];
}

function subscribeTokenRefresh(cb: (token: string) => void) {
  _refreshSubscribers.push(cb);
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const status: number | undefined = error.response?.status;
    const errorCode: string | undefined = error.response?.data?.error;

    // Only attempt refresh on 401, skip if:
    // - already retried this request
    // - the error is on the refresh endpoint itself
    // - the error is token_reused (session family revoked — must re-login)
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/api/auth/refresh") &&
      errorCode !== "token_reused"
    ) {
      if (_isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest._retry = true;
            if (originalRequest.headers) {
              (originalRequest.headers as Record<string, string>)[
                "Authorization"
              ] = `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        // Attempt silent refresh via the Next.js auth proxy (/api/auth/refresh)
        // so the new refresh_token cookie is stored on localhost:3000.
        const csrfToken = Cookies.get("csrf_token");
        const { data } = await axios.post<{
          tokens: { access_token: string };
        }>(
          "/api/auth/refresh",
          {},
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
            },
          },
        );

        const newToken = data.tokens.access_token;
        tokenStore.set(newToken);
        onTokenRefreshed(newToken);

        // Retry original request with the new token
        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)[
            "Authorization"
          ] = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        // Refresh failed — clear token and redirect to login
        tokenStore.clear();
        _refreshSubscribers = [];
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── Normalize API errors — extract backend message field ─────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendMessage: string | undefined = error?.response?.data?.message;
    if (backendMessage && error?.message !== backendMessage) {
      error.message = backendMessage;
    }
    return Promise.reject(error);
  },
);

export default apiClient;
