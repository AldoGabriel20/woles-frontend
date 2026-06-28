/**
 * CSRF init proxy — calls GET /health on the backend to obtain a fresh
 * `csrf_token` cookie, then relays it to the browser as a localhost:3000
 * cookie. Must be called before any mutating auth request (login, register).
 */
import { type NextRequest } from "next/server";

const BACKEND_ORIGIN = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1"
).replace(/\/api\/v1\/?$/, ""); // e.g. "http://localhost:8080"

export async function GET(_req: NextRequest): Promise<Response> {
  try {
    const backendRes = await fetch(`${BACKEND_ORIGIN}/health`);

    // Build response with Set-Cookie headers in the constructor so they
    // are not silently dropped by Next.js.
    const resHeaders = new Headers({ "content-type": "application/json" });

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

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: resHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
}
