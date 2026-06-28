/**
 * Auth proxy route — forwards requests to the backend and relays Set-Cookie
 * headers so that `refresh_token` and `csrf_token` are stored on localhost:3000
 * (same origin as the Next.js app), making them visible to the proxy.ts middleware.
 *
 * Maps:  POST /api/auth/login   → POST http://backend/api/v1/auth/login
 *        POST /api/auth/refresh → POST http://backend/api/v1/auth/refresh
 *        etc.
 */
import { type NextRequest } from "next/server";

const BACKEND_API = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1"
).replace(/\/?$/, ""); // e.g. "http://localhost:8080/api/v1"

async function handler(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> },
): Promise<Response> {
  const { slug } = await context.params;
  const url = new URL(req.url);
  const backendUrl = `${BACKEND_API}/auth/${slug.join("/")}${url.search}`;

  // Build headers to forward to backend
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const authorization = req.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);

  // Forward cookies (refresh_token, csrf_token) from browser → backend
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  // Forward CSRF token header on mutating requests
  const csrfToken = req.headers.get("x-csrf-token");
  if (csrfToken) headers.set("x-csrf-token", csrfToken);

  const method = req.method;
  const body = method !== "GET" && method !== "HEAD" ? await req.text() : undefined;

  const backendRes = await fetch(backendUrl, { method, headers, body });

  // Parse response body
  const text = await backendRes.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = { message: text };
  }

  // Build response headers including relayed Set-Cookie headers.
  // Use the Response constructor (not NextResponse.json + append) so that
  // set-cookie headers are not silently dropped by Next.js.
  const resHeaders = new Headers({
    "content-type": "application/json",
  });

  const setCookies = backendRes.headers.getSetCookie?.() ?? [];
  if (setCookies.length === 0) {
    backendRes.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        resHeaders.append("set-cookie", value);
      }
    });
  } else {
    setCookies.forEach((c) => resHeaders.append("set-cookie", c));
  }

  return new Response(JSON.stringify(json), {
    status: backendRes.status,
    headers: resHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
export const PATCH = handler;
export const PUT = handler;
