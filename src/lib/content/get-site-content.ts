import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { resolveSiteContent } from "@/lib/content/resolve-site-content";
import type { EditableSiteDocument } from "@/types/editable-content";

/**
 * Absolute path to the published, server-authoritative content document.
 * Resolved from the process working directory so it is stable across the dev
 * server and a production `next start`.
 */
const CONTENT_FILE_PATH = path.join(process.cwd(), "public", "content.json");

/**
 * Server-authoritative site content loader.
 *
 * Reads `public/content.json` from disk at call time (no build-time snapshot, so
 * publishes are picked up without a rebuild) and validates/coerces it via the
 * shared editable-content helpers. If the file is missing or the contents are
 * invalid, the default document is returned so pages always render.
 *
 * Server-only: the `server-only` import guarantees this module can never be
 * pulled into a client bundle.
 */
export async function getSiteContent(): Promise<EditableSiteDocument> {
  let raw: string | null;
  try {
    raw = await readFile(CONTENT_FILE_PATH, "utf8");
  } catch {
    // Missing/unreadable file — fall back to defaults via the resolver.
    raw = null;
  }

  return resolveSiteContent(raw);
}
