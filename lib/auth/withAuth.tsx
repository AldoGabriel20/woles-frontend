"use client";

import { useEffect, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";

/**
 * Higher-order component that gates access to `Component` behind authentication.
 *
 * - If the auth state is still loading, renders nothing (avoids flash).
 * - If the user is not authenticated, redirects to `/login`.
 * - Otherwise renders `Component` with all its original props.
 *
 * Usage:
 * ```tsx
 * export default withAuth(DashboardPage);
 * ```
 */
export function withAuth<P extends object>(Component: ComponentType<P>) {
  function AuthGuard(props: P) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace("/login");
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  }

  // Preserve the display name for easier debugging.
  const displayName = Component.displayName ?? Component.name ?? "Component";
  AuthGuard.displayName = `withAuth(${displayName})`;

  return AuthGuard;
}
