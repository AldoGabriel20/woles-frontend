import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "./AuthContext";

/**
 * Returns the AuthContext value.
 *
 * @throws {Error} if used outside of `<AuthProvider>`.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
