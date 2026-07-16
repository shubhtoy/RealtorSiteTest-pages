// Client-side environment configuration for the Next.js surface.
//
// Vite's `import.meta.env` is not available under Next.js, so client env vars
// are read from `process.env.NEXT_PUBLIC_*`. These are statically inlined at
// build time, which means they MUST be referenced by their literal names
// (`process.env.NEXT_PUBLIC_FOO`) — never via a computed key — for the
// replacement to work. Every value has a safe fallback so the module resolves
// even when nothing is configured.

function clean(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const appEnv = {
  // The Next.js API route handlers are served same-origin under `/api/*`, so an
  // empty origin is the correct default (fetches like `/api/content/draft`
  // resolve against the current host). Override only to target a remote API.
  apiOrigin: clean(process.env.NEXT_PUBLIC_API_ORIGIN),
  // Shared-secret gate for the Studio, sent as the `x-studio-password` header
  // on content draft/publish calls. This is NEXT_PUBLIC_* so it ships to the
  // browser — treat it as a lightweight gate, NOT strong authentication. Its
  // value MUST match the server-only STUDIO_PASSWORD, or the server rejects
  // every Studio save/publish request with 401.
  studioPassword: clean(process.env.NEXT_PUBLIC_STUDIO_PASSWORD),
  apiTimeoutMs: toNumber(process.env.NEXT_PUBLIC_API_TIMEOUT_MS, 10000),
  // Optional keyless Google-reviews widget embed URL (an iframe src from a free
  // provider like Featurable / Trustindex / Elfsight). When set, the reviews
  // section renders this widget instead of calling the Places API.
  reviewsEmbedUrl: clean(process.env.NEXT_PUBLIC_REVIEWS_EMBED_URL),
} as const;
