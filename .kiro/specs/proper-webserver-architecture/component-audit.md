# Frontend Component Audit & Cleanup (Task 4)

Catalog of every legacy `src/` page and major component/area, marked **PORT** (used — migrate
to the Next App Router later) or **DROP** (dead/unused — exclude from the port; physically
removed at final cleanup in Task 16 unless deleted in this task).

## Method (how PORT/DROP was determined)

1. **Knip, repo config** (`npm run knip`) — analyses from the Next entry points only (`src/**`
   is ignored in `knip.json`). Reports dependencies unused *from Next's perspective* → drives the
   "Deferred dependency removal" section below.
2. **Knip, Vite-scoped** — a temporary config with entry `src/main.tsx` (+ test files) was run to
   compute the true import graph of the legacy app and list files **unreachable** from the Vite
   entry (31 unused files). The temp config was deleted after use (not committed).
3. **Manual `grep` cross-check** — every "surprising" unused file and each flagged dependency was
   traced to its actual importers to confirm the reachability result and write accurate reasons.

Reachability excludes the three orphan pages (they are themselves unreachable), so a file marked
**PORT** below is imported by genuinely live code — deleting the orphans cannot orphan a PORT file.

**Legend:** PORT = imported (transitively) from `src/main.tsx`; DROP = not reachable from any live entry.

---

## Pages (`src/pages/`)

| Page | Decision | Reason |
|---|---|---|
| `HomePage.tsx` | PORT | Live route `/`, lazy-imported by `App.tsx`. |
| `GalleryPage.tsx` | PORT | Live route `/gallery`, lazy-imported by `App.tsx`. |
| `ContactPage.tsx` | PORT | Live route `/contact`, lazy-imported by `App.tsx`. |
| `StudioPage.tsx` | PORT | Live route `/studio` (Puck editor), lazy-imported by `App.tsx`. |
| `NotFoundPage.tsx` | PORT | Live catch-all `*` route, lazy-imported by `App.tsx`. |
| `AdminConfigPage.tsx` | DROP | **Orphan — imported nowhere** (only the `/admin/config` *redirect* route exists, which does not import the file). **Deleted in this task.** |
| `ContactStudioPage.tsx` | DROP | **Orphan — imported nowhere**; superseded by `StudioPage`. **Deleted in this task.** |
| `HeroEditorPage.tsx` | DROP | **Orphan — imported nowhere**; 60-byte stub. **Deleted in this task.** |

## Layout (`src/components/layout/`)

| Component | Decision | Reason |
|---|---|---|
| `SiteHeader.tsx` | PORT | Rendered by `App.tsx` on every non-Studio route. |
| `SiteFooter.tsx` | PORT | Rendered by `App.tsx` on every non-Studio route. |
| `WelcomeGate.tsx` | PORT | Rendered by `App.tsx`; entry gate island. |
| `ThemeInjector.tsx` | PORT | Rendered by `App.tsx`; injects editable theme tokens. |
| `SitePreloader.tsx` | PORT | Rendered by `App.tsx`; initial load animation. |
| `RouteErrorBoundary.tsx` | PORT | Wraps the catch-all route in `App.tsx`. |

## Media (`src/components/media/`)

| Component | Decision | Reason |
|---|---|---|
| `OptimizedImage.tsx` | PORT | Used by Home/Gallery/Contact + `hero-parallax`/`focus-cards`. **Note:** replaced by `next/image` in Task 11.1 — port as an interim shim, then retire. |

## Studio (`src/components/studio/`)

| Component | Decision | Reason |
|---|---|---|
| `PuckCustomFields.tsx` | PORT | Imported by `StudioPage` (custom Puck fields). |
| `FloatingPuckPanel.tsx` | DROP | Unreachable; legacy floating editor superseded by `StudioPage`. |
| `SelectionOverlay.tsx` | DROP | Unreachable; depends on dead `EditModeContext` + `editable-components`. |
| `EditModeWrapper.tsx` | DROP | Unreachable; depends on dead `EditModeContext`. |
| `FieldEditors.tsx` | DROP | Unreachable 94-byte legacy placeholder. |

## UI primitives (`src/components/ui/`)

**PORT — used by a live route/layout (15):**

| Component | Used by |
|---|---|
| `button.tsx` | Studio, `RouteErrorBoundary`, `alert-dialog` |
| `card.tsx` | ContactPage |
| `badge.tsx` | Home, `SiteHeader`, `SiteFooter` |
| `input.tsx` | ContactPage |
| `textarea.tsx` | ContactPage |
| `label.tsx` | ContactPage |
| `select.tsx` | ContactPage, StudioPage |
| `separator.tsx` | `SiteFooter` |
| `dropdown-menu.tsx` | StudioPage |
| `alert-dialog.tsx` | StudioPage |
| `accordion.tsx` | live collapsible/FAQ sections |
| `hero-parallax.tsx` | HomePage |
| `focus-cards.tsx` | HomePage |
| `sticky-scroll-reveal.tsx` | HomePage |
| `infinite-moving-cards.tsx` | HomePage |

**DROP — unreachable from any live route (18):**

`3d-card.tsx`, `animated-testimonials.tsx`, `avatar.tsx`, `background-gradient.tsx`,
`bento-grid.tsx`, `card-hover-effect.tsx`, `carousel.tsx`, `container-scroll-animation.tsx`,
`dialog.tsx`, `field.tsx`, `flip-words.tsx`, `floating-navbar.tsx`, `images-slider.tsx`,
`lamp.tsx`, `parallax-scroll.tsx`, `tabs.tsx`, `text-generate-effect.tsx`, `tooltip.tsx`
— unused Aceternity/shadcn primitives; no live importer. Retire at Task 16 (not deleted this task).

## Top-level components (`src/components/`)

| Component | Decision | Reason |
|---|---|---|
| `Parallax.tsx` | DROP | Unreachable from any live route (see note below). |

## Lib (`src/lib/`)

| Module | Decision | Reason |
|---|---|---|
| `utils.ts` | PORT | `cn()` class helper used everywhere. |
| `motion.tsx` | PORT | Motion re-exports used by live animation components. |
| `editable-content-defaults.ts` | PORT | Default document for the content system. |
| `editable-content-store.ts` | PORT | Content validation/coercion (server-authoritative in Task 5). |
| `editable-content-store.test.ts` | PORT | Unit tests carried over in Task 14.1. |
| `github-cms.ts` | PORT | Used by `StudioPage` + `EditableContentContext` (interim; revisited in Tasks 5/8). |
| `seo.ts` | PORT | `setPageMeta` used by all pages. **Note:** replaced by the Metadata API in Task 11.2. |
| `admin-auth.ts` | PORT | Studio auth (`StudioPage`, `config/studio-auth`). |
| `puck-data.ts` | PORT | Puck data service used by `StudioPage`. |
| `validation.ts` | PORT | Shared validation helpers. |
| `site-config.ts` | DROP | Consumed only by dead `SiteConfigContext` (→ orphan `AdminConfigPage`). |

## Config (`src/config/`)

| Module | Decision | Reason |
|---|---|---|
| `content.ts` | PORT | Content model/config used by the live content system. |
| `env.ts` | PORT | App env accessor. **Note:** uses Vite `import.meta.env`; reworked in Task 13 (env consolidation). |
| `studio-auth.ts` | PORT | Studio auth config wrapping `admin-auth`. |
| `editable-components.ts` | DROP | Consumed only by dead studio overlays (`SelectionOverlay`, `FloatingPuckPanel`). |

## Context (`src/context/`)

| Provider | Decision | Reason |
|---|---|---|
| `EditableContentContext.tsx` | PORT | Wraps the app in `App.tsx`; core content provider. |
| `SiteConfigContext.tsx` | DROP | Consumed only by orphan `AdminConfigPage`. |
| `EditModeContext.tsx` | DROP | Consumed only by dead studio overlays. |

## Types (`src/types/`)

| Module | Decision | Reason |
|---|---|---|
| `editable-content.ts` | PORT | Types for the live content system. |
| `content.ts` | PORT | Shared content types. |
| `siteConfig.ts` | DROP | Types for dead `site-config` / `SiteConfigContext`. |

## Data (`src/data/`)

| Module | Decision | Reason |
|---|---|---|
| `siteContent.ts` | PORT | Static content consumed by live code. |

---

## Orphaned pages deleted in this task

Confirmed imported **nowhere** (verified by `grep` across the repo + Knip Vite-scoped run — the only
references are in this spec's `requirements.md`/`design.md`/`tasks.md`). The `App.tsx` redirect routes
(`/admin/config`, `/edit/*`) do **not** import these files, so no route change is needed.

- `src/pages/AdminConfigPage.tsx`
- `src/pages/ContactStudioPage.tsx`
- `src/pages/HeroEditorPage.tsx`

## DROP inventory retained in `src/` (remove at Task 16)

Per this phase's scope (`src/` stays intact except the three orphan pages above), these dead files are
catalogued DROP but **not** deleted now; they are removed with the rest of the Vite app at Task 16.2:

- Components: `components/Parallax.tsx`; studio `FloatingPuckPanel`, `SelectionOverlay`, `EditModeWrapper`, `FieldEditors`; the 18 unused `ui/*` primitives listed above.
- Support modules: `lib/site-config.ts`, `config/editable-components.ts`, `context/SiteConfigContext.tsx`, `context/EditModeContext.tsx`, `types/siteConfig.ts`.

## Note — Task 3 primitives marked `"use client"` but currently unused

Task 3 pre-marked several primitives with `"use client"`: `ui/dialog`, `ui/tooltip`, `ui/field`,
`ui/background-gradient`, `ui/tabs`, `ui/card-hover-effect`, and `components/Parallax.tsx`. None are
imported by a live route today (hence DROP above). Before final cleanup, each must either be **adopted**
by a ported route (flip to PORT) or **removed** (Task 16). They are left untouched in this task.

---

## Deferred dependency removal (Task 16)

`npm run knip` (Next-scoped) flags **22 dependencies + 3 devDependencies** as unused *from Next*. Per
task scope these are **catalogued, not removed** — the legacy `src/` app is still built and imported via
the `@/* → ./src/*` alias, so removing them now would break the Vite app and (for shared ones) upcoming
ported routes. Grep-verified consumer status below:

### A. Backing live/PORT code — remove only after routes fully migrate (Task 16)

| Dependency | Legacy consumer(s) |
|---|---|
| `@base-ui/react` | Live primitives: `input`, `select`, `badge`, `button`, `separator`, `dropdown-menu`, `alert-dialog`, `accordion` |
| `@puckeditor/core` | `StudioPage` (Puck editor) |
| `class-variance-authority` | `button`, `badge` variants |
| `clsx` | `lib/utils` `cn()` |
| `lucide-react` | Icons in Home, Studio, `SiteFooter`, `select`, `accordion` |
| `motion` | `lib/motion` + live animation components |
| `react-intersection-observer` | `HomePage` (stats `useInView`) |
| `react-router-dom` | `App.tsx` + all pages/layout routing (replaced by App Router) |
| `sonner` | `App` `Toaster` + `editable-content-store` |
| `tailwind-merge` | `lib/utils` `cn()` |
| `yet-another-react-lightbox` | `GalleryPage` lightbox |

### B. Backing ONLY DROP components — removable together with those components

| Dependency | Sole consumer (DROP) |
|---|---|
| `@tabler/icons-react` | `ui/animated-testimonials` |
| `embla-carousel-react` | `ui/carousel` |
| `embla-carousel-autoplay` | `ui/carousel` |
| `embla-carousel-fade` | `ui/carousel` |
| `react-scroll-parallax` | `components/Parallax` |

### C. No importer found anywhere — already dead (verify, then remove at Task 16)

Knip flags these from Next; grep confirms **no `src/` importer either**, so the "still used by legacy
`src/`" assumption does not hold for them:

| Dependency | Evidence |
|---|---|
| `@fontsource-variable/geist` | Not imported; `index.css` loads Google Fonts "Plus Jakarta Sans", not Geist. |
| `@radix-ui/react-accordion` | Superseded — `ui/accordion` imports `@base-ui/react/accordion`. |
| `@radix-ui/react-tabs` | Superseded — `ui/tabs` imports `@base-ui/react/tabs`. |
| `react-countup` | No importer in `src/`. |
| `react-photo-album` | No importer in `src/` (Gallery uses `yet-another-react-lightbox` only). |
| `tw-animate-css` | Not imported in `index.css` or `main.tsx`. |
| `@fast-check/vitest` (dev) | Sole test (`editable-content-store.test.ts`) uses only `vitest`. |
| `fast-check` (dev) | Same — no property tests present. |
| `shadcn` (dev) | CLI tool; not imported by any source. |

> These are retained this phase only to keep the audit non-destructive and dependency changes isolated
> to Task 16; the Node host does not need them at runtime.
