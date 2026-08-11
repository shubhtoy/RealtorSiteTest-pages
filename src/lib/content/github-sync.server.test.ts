import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * github-sync reads its config from the serverEnv snapshot, which is evaluated
 * once at module import. Each test therefore stubs process.env and imports the
 * module fresh via vi.resetModules() + dynamic import.
 */
async function loadModule() {
  vi.resetModules();
  return import("./github-sync.server");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("commitFileToRepo", () => {
  it("throws when GitHub sync is not configured", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");
    vi.stubEnv("GITHUB_REPO", "");
    const { commitFileToRepo, GitHubSyncError } = await loadModule();

    await expect(
      commitFileToRepo({ repoPath: "public/content.json", content: "{}", message: "x" }),
    ).rejects.toBeInstanceOf(GitHubSyncError);
  });

  it("GETs the current sha then PUTs base64 content with it", async () => {
    vi.stubEnv("GITHUB_TOKEN", "tok");
    vi.stubEnv("GITHUB_REPO", "owner/repo");
    vi.stubEnv("GITHUB_BRANCH", "main");

    const fetchMock = vi
      .fn()
      // getFileSha
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ sha: "abc123" }),
      })
      // PUT contents
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ commit: { sha: "def456", html_url: "https://gh/commit/def456" } }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { commitFileToRepo } = await loadModule();
    const result = await commitFileToRepo({
      repoPath: "public/content.json",
      content: "{}",
      message: "publish",
    });

    expect(result).toEqual({ commitSha: "def456", htmlUrl: "https://gh/commit/def456" });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [, putInit] = fetchMock.mock.calls[1];
    const putBody = JSON.parse(putInit.body as string);
    expect(putInit.method).toBe("PUT");
    expect(putBody.branch).toBe("main");
    expect(putBody.sha).toBe("abc123");
    expect(Buffer.from(putBody.content, "base64").toString("utf8")).toBe("{}");
  });

  it("omits sha when the file does not yet exist (404)", async () => {
    vi.stubEnv("GITHUB_TOKEN", "tok");
    vi.stubEnv("GITHUB_REPO", "owner/repo");

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ commit: { sha: "new", html_url: "u" } }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { commitFileToRepo } = await loadModule();
    await commitFileToRepo({ repoPath: "public/content.json", content: "{}", message: "m" });

    const putBody = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(putBody.sha).toBeUndefined();
  });

  it("throws GitHubSyncError with status when the PUT fails", async () => {
    vi.stubEnv("GITHUB_TOKEN", "tok");
    vi.stubEnv("GITHUB_REPO", "owner/repo");

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: false, status: 403, text: async () => "forbidden" });
    vi.stubGlobal("fetch", fetchMock);

    const { commitFileToRepo, GitHubSyncError } = await loadModule();
    await expect(
      commitFileToRepo({ repoPath: "public/content.json", content: "{}", message: "m" }),
    ).rejects.toMatchObject({ name: "GitHubSyncError", status: 403 });
    void GitHubSyncError;
  });
});
