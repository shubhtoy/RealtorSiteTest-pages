import "server-only";

import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { serverEnv, validateServerEnv } from "@/lib/server-env";

/** Length-aware constant-time string comparison (no early exit on mismatch). */
function safeEqual(a: string, b: string): boolean {
  const aBytes = Buffer.from(a, "utf8");
  const bBytes = Buffer.from(b, "utf8");
  if (aBytes.length !== bBytes.length) {
    // Compare equal-length buffers anyway to keep timing uniform, then fail.
    timingSafeEqual(aBytes, aBytes);
    return false;
  }
  return timingSafeEqual(aBytes, bBytes);
}

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
  // Fail-fast on server misconfiguration: throws in production when
  // STUDIO_PASSWORD is unset (surfaced as a 500), warns in development. Runs
  // here so every protected route (draft/publish/upload) shares one check.
  validateServerEnv();

  const provided = request.headers.get("x-studio-password") ?? "";
  const expected = serverEnv.studioPassword;

  if (expected.length === 0 || provided.length === 0 || !safeEqual(provided, expected)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  return null;
}
