import { appEnv } from "@/config/env";

const GITHUB_TOKEN_KEY = "baba.github.token";

export class GitHubCms {
  static getToken(): string {
    return localStorage.getItem(GITHUB_TOKEN_KEY) ?? "";
  }

  static setToken(token: string) {
    localStorage.setItem(GITHUB_TOKEN_KEY, token.trim());
  }

  static clearToken() {
    localStorage.removeItem(GITHUB_TOKEN_KEY);
  }

  static hasToken(): boolean {
    return this.getToken().length > 0;
  }

  /**
   * Publish content.json to the GitHub repo.
   * Uses the GitHub Contents API to create/update the file.
   */
  static async publish(document: unknown): Promise<{ ok: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) return { ok: false, error: "GitHub token not configured" };

    const { githubRepo, githubBranch, githubContentPath } = appEnv;
    const apiUrl = `https://api.github.com/repos/${githubRepo}/contents/${githubContentPath}`;

    try {
      // Get current file SHA (needed for updates)
      let sha: string | undefined;
      const getRes = await fetch(`${apiUrl}?ref=${githubBranch}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" },
      });
      if (getRes.ok) {
        const existing = await getRes.json();
        sha = existing.sha;
      } else if (getRes.status !== 404) {
        return { ok: false, error: `GitHub API error: ${getRes.status}` };
      }

      // Commit the file
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(document, null, 2))));
      const body: Record<string, unknown> = {
        message: `chore: update site content via Studio`,
        content,
        branch: githubBranch,
      };
      if (sha) body.sha = sha;

      const putRes = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}));
        return { ok: false, error: (err as { message?: string }).message || `HTTP ${putRes.status}` };
      }

      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Network error" };
    }
  }

  /**
   * Fetch the published content.json from the repo (raw).
   */
  static async fetchPublished(): Promise<{ ok: boolean; data?: unknown; error?: string }> {
    const { githubRepo, githubBranch, githubContentPath } = appEnv;
    const rawUrl = `https://raw.githubusercontent.com/${githubRepo}/${githubBranch}/${githubContentPath}`;

    try {
      const res = await fetch(rawUrl, { cache: "no-store" });
      if (res.status === 404) return { ok: true, data: null };
      if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
      const data = await res.json();
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Network error" };
    }
  }

  /**
   * Upload a file to public/uploads/ in the GitHub repo.
   * Returns the public URL path (e.g. /uploads/filename.jpg).
   */
  static async uploadFile(file: File): Promise<{ ok: boolean; url?: string; error?: string }> {
    const token = this.getToken();
    if (!token) return { ok: false, error: "GitHub token not configured" };

    const { githubRepo, githubBranch } = appEnv;
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 50);
    const fileName = `${baseName}-${Date.now()}.${ext}`;
    const filePath = `public/uploads/${fileName}`;
    const apiUrl = `https://api.github.com/repos/${githubRepo}/contents/${filePath}`;

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const content = btoa(binary);

      const putRes = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `upload: ${fileName}`,
          content,
          branch: githubBranch,
        }),
      });

      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}));
        return { ok: false, error: (err as { message?: string }).message || `HTTP ${putRes.status}` };
      }

      return { ok: true, url: `/uploads/${fileName}` };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Upload failed" };
    }
  }

  /**
   * Upload multiple files, returns array of results.
   */
  static async uploadFiles(files: File[]): Promise<Array<{ ok: boolean; url?: string; originalName: string; error?: string }>> {
    const results = [];
    for (const file of files) {
      const result = await this.uploadFile(file);
      results.push({ ...result, originalName: file.name });
    }
    return results;
  }
}
