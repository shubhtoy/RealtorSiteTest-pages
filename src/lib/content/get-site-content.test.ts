import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultEditableSiteDocument } from "@/lib/editable-content-defaults";
import { resolveSiteContent } from "@/lib/content/resolve-site-content";

/**
 * These tests target the pure `resolveSiteContent` helper rather than
 * `getSiteContent`, because the latter imports `server-only` (which cannot be
 * resolved outside the Next server graph) and performs filesystem I/O. The
 * helper contains all of the parse/validate/fallback logic, so exercising it
 * fully covers the loader's behavior.
 */
describe("resolveSiteContent", () => {
  it("returns validated, hydrated content for a good document", () => {
    const good = JSON.stringify({
      ...defaultEditableSiteDocument,
      global: { ...defaultEditableSiteDocument.global, siteName: "Baba Flats Custom" },
    });

    const result = resolveSiteContent(good);

    expect(result.global.siteName).toBe("Baba Flats Custom");
    // Hydration fills unspecified fields from defaults.
    expect(result.global.cityLabel).toBe(defaultEditableSiteDocument.global.cityLabel);
  });

  it("falls back to defaults when the file is missing (null input)", () => {
    expect(resolveSiteContent(null)).toEqual(defaultEditableSiteDocument);
    expect(resolveSiteContent(undefined)).toEqual(defaultEditableSiteDocument);
  });

  it("falls back to defaults for unparseable JSON", () => {
    expect(resolveSiteContent("{ not valid json")).toEqual(defaultEditableSiteDocument);
  });

  it("falls back to defaults for a structurally invalid document", () => {
    expect(resolveSiteContent(JSON.stringify({ version: 1 }))).toEqual(defaultEditableSiteDocument);
    expect(resolveSiteContent(JSON.stringify("a string, not an object"))).toEqual(defaultEditableSiteDocument);
  });

  it("accepts the real published public/content.json (smoke check)", async () => {
    const raw = await readFile(path.join(process.cwd(), "public", "content.json"), "utf8");

    const result = resolveSiteContent(raw);

    expect(typeof result.global.siteName).toBe("string");
    expect(result.global.siteName.length).toBeGreaterThan(0);
    expect(typeof result.version).toBe("number");
  });
});
