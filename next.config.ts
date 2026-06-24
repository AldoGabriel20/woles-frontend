import type { NextConfig } from "next";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// Derive the API origin (scheme + host only, no path)
const apiOrigin = (() => {
  try {
    return new URL(API_BASE).origin;
  } catch {
    return "http://localhost:8080";
  }
})();

const CSP = [
  "default-src 'self'",
  // Scripts: self + Next.js inline scripts (nonce would be better but requires
  // per-request nonces; unsafe-inline is an acceptable tradeoff for an SSR app
  // that does not serve user-supplied HTML)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // Styles: self + inline (Tailwind injects critical CSS at runtime)
  "style-src 'self' 'unsafe-inline'",
  // Images: self + data URIs (avatar previews) + API origin
  `img-src 'self' data: blob: ${apiOrigin}`,
  // Fonts served from same origin
  "font-src 'self'",
  // API XHR/fetch only to our own origin and the Go backend
  `connect-src 'self' ${apiOrigin}`,
  // No plugins, objects, or embeds
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Prevent framing (also enforced via X-Frame-Options)
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
