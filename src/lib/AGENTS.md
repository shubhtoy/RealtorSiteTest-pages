# AGENTS.md — `src/lib/`

Framework-free, unit-tested logic. Keep it free of React and `next/*` where possible so it stays
directly testable with vitest. See the root and `src/AGENTS.md` for context.

## Key modules

- `content/` — `resolve-site-content.ts` (pure parse/validate/fallback), `get-site-content.ts`
  (server read of `public/content.json`, `server-only`). The resolver runs input through
  `coerceEditableSiteDocument`, which hydrates from defaults and validates known fields.
- `editable-content-store.ts` — `coerceEditableSiteDocument`, `hydrateDocument` (deep-merges each
  section from defaults — **add new nested blocks here** so old content stays valid), and
  `validateEditableSiteDocument`.
- `editable-content-defaults.ts` — the default content document. Every editable field needs a default.
- `contact/` — lead delivery: `subject.ts` / `template.ts` (`{{placeholder}}` renderers, tested),
  `google-sheets.server.ts`. The Apps Script relay is `docs/apps-script/contact-endpoint.gs`.
- `server-env.ts` — typed server env + `is*Configured()` guards. Secrets are read here only.

## Rules

- Every behavior change in this directory should come with or update a vitest test. Test **distinct
  behaviors**, not just data-provider row counts.
- Never adjust production logic just to satisfy a test — fix the code only if it's genuinely wrong;
  otherwise fix or delete the test (see `CODING_STANDARDS.md`).
- Template renderers must not be trusted for email headers — the caller sanitizes header-bound values.
- When adding an editable content field, update type + default + `hydrateDocument` merge +
  `validateEditableSiteDocument` together (backward compatibility depends on the hydrate merge).
