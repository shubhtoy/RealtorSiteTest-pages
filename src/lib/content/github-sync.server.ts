import "server-only";

import { isGitHubSyncConfigured, serverEnv } from "@/lib/server-env";

/**
 * Commit a single file to the configured GitHub repository using the REST
 * "Create or update file contents" endpoint. This is how the Studio persists a
 * publish in production: committing `public/content.json` (or an uploaded asset)
 * to the deploy branch triggers a fresh Vercel build that serves the new state.
 *
 * Local development leaves GitHub sync unconfigured and writes to disk instead
 * (see the content store), so this module is a no-op path there.
 */

const GITHUB_API = "https://api.github.com";

export class GitHubSyncError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubSyncError";
    this.status = status;
  }
}

function repoParts(): { owner: string; repo: string } {
  const [owner, repo] = serverEnv.githubRepo.split("/");
  return { owner, repo };
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${serverEnv.githubToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "baba-flats-studio",
  };
}

/** Fetch the current blob SHA for a path, or null when the file does not exist. */
async function getFileSha(repoPath: string): Promise<string | null> {
  const { owner, repo } = repoParts();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(
    repoPath,
  )}?ref=${encodeURIComponent(serverEnv.githubBranch)}`;

  const response = await fetch(url, { headers: authHeaders(), cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new GitHubSyncError(
      `Failed to read ${repoPath} from GitHub (${response.status})`,
      response.status,
    );
  }
  const data = (await response.json()) as { sha?: string };
  return typeof data.sha === "string" ? data.sha : null;
}

export type CommitFileArgs = {
  /** Repo-relative path, e.g. "public/content.json". */
  repoPath: string;
  /** Raw file bytes. Strings are treated as UTF-8. */
  content: string | Buffer;
  /** Commit message. */
  message: string;
};

export type CommitResult = {
  commitSha: string;
  htmlUrl: string;
};

/**
 * Create or update a file in the repo on the deploy branch.
 *
 * @throws {GitHubSyncError} when sync is not configured or the API call fails.
 */
export async function commitFileToRepo({
  repoPath,
  content,
  message,
}: CommitFileArgs): Promise<CommitResult> {
  if (!isGitHubSyncConfigured()) {
    throw new GitHubSyncError("GitHub sync is not configured", 500);
  }

  const { owner, repo } = repoParts();
  const base64 = Buffer.isBuffer(content)
    ? content.toString("base64")
    : Buffer.from(content, "utf8").toString("base64");

  const sha = await getFileSha(repoPath);

  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(repoPath)}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      message,
      content: base64,
      branch: serverEnv.githubBranch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new GitHubSyncError(
      `GitHub commit failed for ${repoPath} (${response.status})${detail ? `: ${detail}` : ""}`,
      response.status,
    );
  }

  const data = (await response.json()) as {
    commit?: { sha?: string; html_url?: string };
  };
  return {
    commitSha: data.commit?.sha ?? "",
    htmlUrl: data.commit?.html_url ?? "",
  };
}
