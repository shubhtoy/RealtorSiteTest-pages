import "server-only";

import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/server-env";

/**
 * Studio authentication guard for the content/upload route handlers.
 *
 * Compares the request's `x-studio-password` header against the server-only
 * `STUDIO_PASSWORD` value (surfaced via {@link serverEnv}). On any mismatch — or
 * when no password is configured — a `401` JSON response is returned; on success
 * the function returns `null` so callers can proceed:
 *
 * ```ts
 * const unauthorized = requireStudioAuth(request);
 * if (unauthorized) return unauthorized;
 * ```
 *
 * A missing/blank `STUDIO_PASSWORD` denies all access rather than opening the
 * Studio endpoints (an empty configured password never authenticates).
 */
export function requireStudioAuth(request: Request): NextResponse | null {
  const provided = request.headers.get("x-studio-password") ?? "";
  const expected = serverEnv.studioPassword;

  if (expected.length === 0 || provided.length === 0 || provided !== expected) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  return null;
}
