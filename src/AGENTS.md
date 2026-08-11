# AGENTS.md — `src/`

Application source consumed by the `app/` routes. See the root `AGENTS.md` for stack and commands.

## Sub-directories

- `pages/` — full **page components** (`HomePage`, `GalleryPage`, `ContactPage`, `StudioPage`)
  imported by App Router route files. These are `"use client"` components. This is NOT the Next
  Pages Router.
- `components/` — reusable UI. See `components/AGENTS.md`.
- `lib/` — framework-free, unit-tested logic (content, contact delivery, helpers). See `lib/AGENTS.md`.
- `types/` — shared types. The editable-content document type (`editable-content.ts`) is the
  contract between the Studio, the content store, and consumers; changing it requires matching
  updates to defaults, hydration, and validation in `src/lib/editable-content-store.ts` +
  `editable-content-defaults.ts`.
- `config/`, `data/` — static configuration and seed data.

## Rules

- Content is editable in the Studio. When you add an editable field, wire it end-to-end:
  **type → default → hydrate deep-merge → validation → Studio field (read + save)** so existing
  content stays backward compatible (missing fields inherit defaults).
- Keep page components presentational; put reusable logic in `lib/` with tests.
- Follow `CODING_STANDARDS.md` (a11y, Tailwind ordering via prettier plugin, factual docblocks).
