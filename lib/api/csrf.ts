import axios from "axios";
import Cookies from "js-cookie";

/**
 * Initialise the CSRF double-submit cookie by calling the Next.js CSRF proxy
 * route (GET /api/csrf), which in turn calls GET /health on the backend and
 * relays the `csrf_token` Set-Cookie header so it is stored on localhost:3000
 * (same origin as the app and the proxy.ts middleware).
 *
 * Call this once on app mount and once on auth page mount (login, register)
 * before any mutating request is sent.
 *
 * The call is idempotent: if the cookie already exists it returns early.
 */
export async function initCsrf(): Promise<void> {
  // Skip if the cookie is already present (e.g. after a previous page load).
  if (Cookies.get("csrf_token")) return;

  try {
    // Same-origin URL so the cookie is stored on localhost:3000.
    await axios.get("/api/csrf", { withCredentials: true });
  } catch {
    // Best-effort — the POST will fail with csrf_invalid if this doesn't work,
    // which gives the user a clear error rather than a silent hang.
  }
}
