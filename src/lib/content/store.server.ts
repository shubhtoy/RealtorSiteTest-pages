import "server-only";

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { resolveSiteContent } from "@/lib/content/resolve-site-content";
import { coerceEditableSiteDocument } from "@/lib/editable-content-store";
import type { EditableSiteDocument } from "@/types/editable-content";

/**
 * Server-authoritative content store for the Studio route handlers.
 *
 * - Published document: `public/content.json` — the same file
 *   `getSiteContent()` serves, so a publish is picked up without a rebuild.
 * - Draft document: `.data/draft.json` — repo-root `.data/` (git-ignored), the
 *   same directory the contact route logs submissions to.
 *
 * All persisted documents are coerced/validated through the shared
 * editable-content helpers, so neither file can be written in a structurally
 * invalid state.
 */

const DRAFT_FILE = path.join(process.cwd(), ".data", "draft.json");
const PUBLISHED_FILE = path.join(process.cwd(), "public", "content.json");

/** Thrown when an incoming document fails validation; routes map this to 400. */
export class ContentValidationError extends Error {
  readonly errors: string[];

  constructor(errors: string[]) {
    super(`Invalid content document: ${errors.join("; ")}`);
    this.name = "ContentValidationError";
    this.errors = errors;
  }
}

/** Thrown when publish is attempted with no draft on disk; routes map this to 400. */
export class DraftNotFoundError extends Error {
  constructor() {
    super("Draft document not found. Save a draft before publishing.");
    this.name = "DraftNotFoundError";
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Coerce + validate an untrusted document via `coerceEditableSiteDocument`
 * (which runs `validateEditableSiteDocument` internally), throwing a typed
 * {@link ContentValidationError} when it is not a valid site document.
 */
function assertValidDocument(input: unknown): EditableSiteDocument {
  const { document, errors } = coerceEditableSiteDocument(input);
  if (!document) {
    throw new ContentValidationError(errors);
  }
  return document;
}

async function writeDocument(filePath: string, document: EditableSiteDocument): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
}

/**
 * Read the current draft document, or `null` when no draft has been saved yet.
 * A corrupt/invalid draft on disk is treated as absent (returns `null`) so the
 * Studio can recover by re-seeding rather than hard-failing.
 */
export async function getDraft(): Promise<EditableSiteDocument | null> {
  if (!(await fileExists(DRAFT_FILE))) {
    return null;
  }

  let raw: string;
  try {
    raw = await readFile(DRAFT_FILE, "utf8");
  } catch {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const { document } = coerceEditableSiteDocument(parsed);
  return document;
}

/**
 * Validate and persist a draft document to `.data/draft.json`.
 *
 * @throws {ContentValidationError} when the input fails validation.
 */
export async function setDraft(input: unknown): Promise<EditableSiteDocument> {
  const document = assertValidDocument(input);
  await writeDocument(DRAFT_FILE, document);
  return document;
}

/**
 * Read the published document from `public/content.json`, coerced through the
 * same resolver `getSiteContent()` uses. Falls back to the default document when
 * the file is missing or invalid (never throws — always returns a document).
 */
export async function getPublished(): Promise<EditableSiteDocument> {
  let raw: string | null;
  try {
    raw = await readFile(PUBLISHED_FILE, "utf8");
  } catch {
    raw = null;
  }
  return resolveSiteContent(raw);
}

/**
 * Publish the current draft to `public/content.json`, validating it first so the
 * server-authoritative document is never left invalid.
 *
 * @throws {DraftNotFoundError} when no (valid) draft exists.
 * @throws {ContentValidationError} when the draft fails validation.
 */
export async function publishDraft(): Promise<EditableSiteDocument> {
  const draft = await getDraft();
  if (!draft) {
    throw new DraftNotFoundError();
  }

  // `getDraft` already coerces; re-assert so the published file is guaranteed valid.
  const document = assertValidDocument(draft);
  await writeDocument(PUBLISHED_FILE, document);
  return document;
}
