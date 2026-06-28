"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import * as authApi from "@/lib/api/auth";
import { initCsrf } from "@/lib/api/csrf";
import { tokenStore } from "@/lib/api/token-store";
import type { User } from "@/lib/api/types";

// ─── Context shape ────────────────────────────────────────────────────────────

export interface AuthContextValue {
  /** The currently authenticated user, or null if unauthenticated. */
  user: User | null;
  /** The in-memory access token, or null if unauthenticated. */
  accessToken: string | null;
  /** True while the initial silent-refresh attempt is in progress. */
  isLoading: boolean;
  /** Convenience flag: true when user is non-null and not loading. */
  isAuthenticated: boolean;

  /** Log in with email + password. Stores the access token in memory. */
  login: (email: string, password: string) => Promise<void>;
  /** Log out the current user. Clears token and redirects to /login. */
  logout: () => Promise<void>;
  /**
   * Silently refresh the access token using the HttpOnly refresh-token cookie.
   * Called automatically on mount; can also be invoked manually.
   */
  refreshAccessToken: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Store token in both memory-store and local state. */
  const _applyToken = useCallback((token: string) => {
    tokenStore.set(token);
    setAccessToken(token);
  }, []);

  /** Wipe token from both memory-store and local state. */
  const _clearToken = useCallback(() => {
    tokenStore.clear();
    setAccessToken(null);
  }, []);

  // ── refreshAccessToken ────────────────────────────────────────────────────

  const refreshAccessToken = useCallback(async () => {
    const res = await authApi.refreshToken();
    _applyToken(res.tokens.access_token);

    // Fetch user profile if we don't have it yet.
    if (!user) {
      const me = await authApi.getMe();
      setUser(me);
    }
  }, [_applyToken, user]);

  // ── Auto-refresh on mount ─────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // Ensure the CSRF cookie is set before any POST request.
        await initCsrf();
        const res = await authApi.refreshToken();
        if (cancelled) return;
        _applyToken(res.tokens.access_token);

        const me = await authApi.getMe();
        if (cancelled) return;
        setUser(me);
      } catch {
        // No valid refresh token — user is unauthenticated; stay on current page.
        if (!cancelled) {
          _clearToken();
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── login ─────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      _applyToken(res.tokens.access_token);

      // Login may return the user directly; fall back to /auth/me.
      if (res.user) {
        setUser(res.user);
      } else {
        const me = await authApi.getMe();
        setUser(me);
      }
    },
    [_applyToken]
  );

  // ── logout ────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort — clear client state regardless of server response.
    } finally {
      _clearToken();
      setUser(null);
      router.push("/login");
    }
  }, [_clearToken, router]);

  // ── Context value ─────────────────────────────────────────────────────────

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isLoading,
      isAuthenticated: !isLoading && user !== null,
      login,
      logout,
      refreshAccessToken,
    }),
    [user, accessToken, isLoading, login, logout, refreshAccessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
