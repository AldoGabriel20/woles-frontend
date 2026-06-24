import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (formerly middleware) — protects all authenticated app routes.
 *
 * The `refresh_token` cookie is HttpOnly and is readable here because this
 * runs on the server edge before any page is rendered.
 *
 * Auth logic:
 * - All routes are assumed protected UNLESS they match a public prefix.
 * - Public routes: /, /login, /register, /verify, and SEO landing pages.
 * - If no `refresh_token` cookie is present on a protected route, redirect
 *   to /login (with `next` param for post-login redirect).
 */

/**
 * Path prefixes that are publicly accessible without authentication.
 * Everything else requires a valid refresh_token cookie.
 */
const PUBLIC_PREFIXES = [
  "/",          // exact match handled below
  "/login",
  "/register",
  "/verify",
  // SEO landing pages (app/(public)/)
  "/whatsapp-reminder",
  "/reminder-pajak-mobil",
  "/reminder-stnk",
  "/reminder-passport",
  "/reminder-sim",
  "/reminder-servis-mobil",
  "/reminder-subscription",
];

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => prefix !== "/" && pathname.startsWith(prefix),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isPublic(pathname)) {
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
