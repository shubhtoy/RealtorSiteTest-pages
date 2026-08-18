import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { coerceEditableSiteDocument } from "@/lib/editable-content-store";
import { commitFileToRepo } from "@/lib/content/github-sync.server";
import { isGitHubSyncConfigured } from "@/lib/server-env";
import type { EditableSiteDocument } from "@/types/editable-content";

/**
 * Server-authoritative content store for the Studio publish route.
 *
 * The published document is `public/content.json` — the same file
 * `getSiteContent()` serves, so a publish is picked up without a rebuild.
 * Publishing is self-contained: the Studio client sends the full document
 * (there is no server-side draft), so it works on serverless and disk hosts
 * alike. All documents are coerced/validated before being written.
 */

const PUBLISHED_FILE = path.join(process.cwd(), "public", "content.json");
/** Repo-relative path of the published document (used for GitHub commits). */
const PUBLISHED_REPO_PATH = "public/content.json";

/** Thrown when an incoming document fails validation; routes map this to 400. */
export class ContentValidationError extends Error {
  readonly errors: string[];

  constructor(errors: string[]) {
    super(`Invalid content document: ${errors.join("; ")}`);
    this.name = "ContentValidationError";
    this.errors = errors;
  }
}

/**
 * Coerce + validate an untrusted document via `coerceEditableSiteDocument`,
 * throwing a typed {@link ContentValidationError} when it is not valid.
 */
function assertValidDocument(input: unknown): EditableSiteDocument {
  const { document, errors } = coerceEditableSiteDocument(input);
  if (!document) {
    throw new ContentValidationError(errors);
  }
  return document;
}

/**
 * Persist a published document. Dual-mode: commit `public/content.json` to the
 * deploy branch when GitHub sync is configured (production), otherwise write to
 * disk (local development / persistent host).
 */
async function persistPublished(document: EditableSiteDocument): Promise<void> {
  const serialized = `${JSON.stringify(document, null, 2)}\n`;

  if (isGitHubSyncConfigured()) {
    await commitFileToRepo({
      repoPath: PUBLISHED_REPO_PATH,
      content: serialized,
      message: "chore(content): publish site content via Studio",
    });
    return;
  }

  await mkdir(path.dirname(PUBLISHED_FILE), { recursive: true });
  await writeFile(PUBLISHED_FILE, serialized, "utf8");
}

/**
 * Validate and publish a caller-supplied document.
 *
 * @throws {ContentValidationError} when the document fails validation.
 */
export async function publishDocument(input: unknown): Promise<EditableSiteDocument> {
  const document = assertValidDocument(input);
  await persistPublished(document);
  return document;
}
