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
  // Must match the server-only STUDIO_PASSWORD so the Studio can authenticate
  // its content/draft/publish calls via the `x-studio-password` header.
  studioPassword: clean(process.env.NEXT_PUBLIC_STUDIO_PASSWORD),
  apiTimeoutMs: toNumber(process.env.NEXT_PUBLIC_API_TIMEOUT_MS, 10000),
  githubRepo: clean(process.env.NEXT_PUBLIC_GITHUB_REPO) || "shubhtoy/RealtorSiteTest-pages",
  githubBranch: clean(process.env.NEXT_PUBLIC_GITHUB_BRANCH) || "main",
  githubContentPath: clean(process.env.NEXT_PUBLIC_GITHUB_CONTENT_PATH) || "public/content.json",
} as const;
