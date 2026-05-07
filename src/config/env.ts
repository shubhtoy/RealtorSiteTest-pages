const rawEnv = import.meta.env as Record<string, string | undefined>;

function clean(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const appEnv = {
  apiOrigin: clean(rawEnv.VITE_API_ORIGIN) || "http://localhost:8787",
  studioPassword: clean(rawEnv.VITE_STUDIO_PASSWORD),
  apiTimeoutMs: toNumber(rawEnv.VITE_API_TIMEOUT_MS, 10000),
  githubRepo: clean(rawEnv.VITE_GITHUB_REPO) || "shubhtoy/RealtorSiteTest-pages",
  githubBranch: clean(rawEnv.VITE_GITHUB_BRANCH) || "main",
  githubContentPath: clean(rawEnv.VITE_GITHUB_CONTENT_PATH) || "public/content.json",
} as const;
