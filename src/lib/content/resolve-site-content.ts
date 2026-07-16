import { defaultEditableSiteDocument } from "@/lib/editable-content-defaults";
import { coerceEditableSiteDocument } from "@/lib/editable-content-store";
import type { EditableSiteDocument } from "@/types/editable-content";

/**
 * Pure resolver for server-authoritative site content.
 *
 * Given the raw contents of `public/content.json` (or `null`/`undefined` when the
 * file is missing), this parses the JSON and validates/coerces it through the
 * shared editable-content helpers, falling back to the default document whenever
 * the input is missing, unparseable, or structurally invalid.
 *
 * Intentionally free of `server-only` and `node:fs` so it can be unit-tested
 * directly; the filesystem read lives in `get-site-content.ts`.
 */
export function resolveSiteContent(raw: string | null | undefined): EditableSiteDocument {
  if (raw == null) {
    return defaultEditableSiteDocument;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return defaultEditableSiteDocument;
  }

  const { document } = coerceEditableSiteDocument(parsed);
  return document ?? defaultEditableSiteDocument;
}
