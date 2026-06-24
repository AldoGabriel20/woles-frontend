import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (formerly middleware) — protects dashboard routes.
 *
 * The `refresh_token` cookie is HttpOnly and is readable here because this
 * runs on the server edge before any page is rendered.
 *
 * Auth logic:
 * - Routes under /dashboard/* require a valid `refresh_token` cookie.
 * - If the cookie is absent, redirect to /login (with `next` param for
 *   post-login redirect).
 * - Public routes (/login, /register, /forgot-password, /reset-password) and
 *   Next.js internals (_next/*, api/*, public assets) pass through freely.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    const hasRefreshToken = request.cookies.has("refresh_token");

    if (!hasRefreshToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *   - /_next/static  (static assets)
     *   - /_next/image   (image optimisation)
     *   - /api/*         (API routes inside Next.js — not our Go backend)
     *   - /favicon.ico, /robots.txt, /sitemap.xml, etc.
     *   - Files with extensions (e.g. .png, .svg, .woff2)
     */
    "/((?!_next/static|_next/image|api/|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|css|js|map)$).*)",
  ],
};
