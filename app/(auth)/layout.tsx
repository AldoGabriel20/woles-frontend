import type { ReactNode } from "react";

/**
 * (auth) route group layout.
 *
 * Centered page layout: full-screen emerald-tinted background with the
 * auth card centred both vertically and horizontally.
 * No Providers here — auth pages don't need AuthContext or QueryClient.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      {children}
    </div>
  );
}
