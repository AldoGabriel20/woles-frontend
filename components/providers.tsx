"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ToastProvider } from "@/components/ui/toast";

/**
 * Client-side provider tree for the dashboard.
 *
 * Wraps children with:
 * - QueryClientProvider  — TanStack Query v5
 * - AuthProvider         — in-memory auth state (TASK-025)
 *
 * Must be a "use client" component so it can use useState for QueryClient
 * instantiation (required to avoid shared state across SSR requests).
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,    // 1 min — avoids waterfall refetches on navigation
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
