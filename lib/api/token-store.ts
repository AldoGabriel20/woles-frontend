/**
 * In-memory token store.
 *
 * Access tokens are kept in memory (never in localStorage/sessionStorage) to
 * prevent XSS-based token theft. The AuthContext (TASK-025) calls `set` after a
 * successful login/refresh and `clear` on logout.
 */

let _accessToken: string | null = null;

export const tokenStore = {
  get: (): string | null => _accessToken,
  set: (token: string): void => {
    _accessToken = token;
  },
  clear: (): void => {
    _accessToken = null;
  },
};
