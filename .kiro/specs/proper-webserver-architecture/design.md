# Design Document: Proper Web-Server Architecture

## Overview

Migrate Baba Flats from a client-only Vite SPA + separate Express server + static GitHub Pages into a single, server-rendered, full-stack web application on a standard framework. The migration preserves all pages, design, content, and the Studio editor, replaces the static-hosting limitation that currently breaks the contact form in production, and establishes a standard deployment path.

This document proposes the framework, the target architecture, a concept-by-concept migration mapping, and a phased plan. **The framework choice is the one decision that requires sign-off before implementation begins** (see "Framework Decision" and "Open Decisions").

## Current Architecture (as-is)

| Concern | Current implementation |
|---|---|
| Rendering | Client-only React 19 SPA (Vite), no SSR |
| Routing | `react-router-dom` v7 (`App.tsx` `<Routes>`) |
| Server/API | Standalone Express (`server/index.mjs`): `/api/contact/submit`, `/api/content/*`, `/api/assets/upload` |
| Hosting | GitHub Pages (static) — **the Express server does not run in prod**, so `/api/*` 404s live |
| Content | `public/content.json` fetched at runtime; defaults in `src/lib/editable-content-defaults.ts`; types in `src/types/editable-content.ts` |
| Studio/CMS | `/studio` (Puck-based); publishes `content.json` to the repo via the GitHub Contents API (`src/lib/github-cms.ts`) |
| Media | Custom `sharp` script (`scripts/optimize-media.mjs`) + `<picture>` wrapper (`OptimizedImage`) generating AVIF/WebP |
| SEO | Runtime `setPageMeta` DOM mutation |
| Styling | Tailwind CSS + design tokens; Radix UI; `motion` |

The core problem: production is static, so the lead-capture pipeline (email + Google Sheet) cannot run, and there is no SSR for SEO.

## Framework Decision

**Recommendation: Next.js (App Router) + TypeScript + Tailwind CSS.**

Rationale:

1. **Reuses the existing stack.** It is React 19 + TypeScript + Tailwind + Radix + `motion` — all of which port over with adaptation rather than rewrite.
2. **Unified server + API.** Route Handlers (`app/api/**/route.ts`) replace the Express endpoints on the same origin — directly fixing the static-hosting gap and unblocking the contact form's email + Sheet delivery in production.
3. **First-class SSR/SSG/ISR** per route → strong SEO and fast first paint, satisfying Requirement 1.
4. **Built-in Metadata API** replaces the custom `setPageMeta`; **built-in `next/image`** replaces the custom `sharp`/`OptimizedImage` pipeline (Requirement 6).
5. **Standard, boring, well-documented** — the most conventional "proper web server" choice for a React team, with the widest hosting support (Vercel first-class; also Node/Docker on Render, Railway, Fly, AWS).
6. **Incremental migration is feasible** — components and Tailwind config move largely as-is; routing and data-fetching are the main adaptations.

### Alternatives Considered

| Option | Strengths | Why not (for this project) |
|---|---|---|
| **Astro + React islands** | Best raw performance/SEO for content sites; ships ~0 JS by default | The Studio is an app-like, highly interactive surface; Astro's islands model makes the CMS/editor and shared client state more awkward than Next. Still a strong pick if we prioritize the marketing pages over the editor. |
| **Remix / React Router 7 (framework mode)** | Excellent web-standards data model (loaders/actions); great forms story for Lead_Capture | Smaller ecosystem/mindshare than Next; image + metadata tooling less batteries-included; team familiarity likely lower. |
| **Keep Vite SPA + add Fastify/NestJS API server** | Minimal change to the frontend; explicit backend | Still no SSR (SEO gap remains); two processes/build systems to operate; least "standard framework" for a unified site. |
| **Stay on current Express + serve built SPA from Node** | Smallest effort; unblocks API in prod | No SSR; keeps the bespoke, non-standard setup the user explicitly wants to move away from. |

If the priority is *purely* the marketing site's performance/SEO and the Studio can be a separate lightweight tool, **Astro** is the runner-up. For a single cohesive app that keeps the interactive Studio and reuses the most code, **Next.js is recommended.**

## Target Architecture (Next.js App Router)

```
app/
  layout.tsx            # root layout: fonts, ThemeInjector, providers, WelcomeGate mount
  page.tsx              # Home (Server Component; content read server-side)
  gallery/page.tsx      # Gallery (SSR/SSG) + client lightbox island
  contact/page.tsx      # Contact page shell (SSR) + client form island
  studio/page.tsx       # Studio (client-heavy; dynamic import, noindex)
  not-found.tsx         # 404
  robots.ts / sitemap.ts# generated robots + sitemap
  api/
    contact/route.ts    # POST: validate -> email + Google Sheet + persist (Lead_Capture)
    content/
      draft/route.ts    # GET/PUT draft (auth)
      publish/route.ts   # POST publish (auth)
    assets/upload/route.ts # POST upload (auth)
components/              # ported from src/components (ui/, layout/, media/)
lib/                     # content store, validation, seo->metadata, integrations
content/                 # server-authoritative content store (JSON initially)
public/                  # images, videos, uploads (unchanged asset URLs)
```

Rendering strategy:
- **Home/Gallery**: SSG or ISR (content changes infrequently; revalidate on publish).
- **Contact**: SSR shell + client form island.
- **Studio**: client-side (dynamic import, `noindex`), authenticated.

### Concept Mapping (current → target)

| Current | Target |
|---|---|
| `react-router` `<Routes>` | App Router file-based routes |
| `server/index.mjs` Express endpoints | `app/api/**/route.ts` Route Handlers |
| `setPageMeta` runtime DOM | `export const metadata` / `generateMetadata` |
| `OptimizedImage` + `sharp` script | `next/image` (built-in optimization) |
| `content.json` fetched client-side | Server read of content store in Server Components |
| `github-cms.ts` publish to repo | Server-side persistence on publish (authoritative); optionally keep git-backed store |
| `EditableContentContext` (localStorage) | Server content + client draft context for Studio only |
| Vite env (`VITE_*`) | Next env (`NEXT_PUBLIC_*` for client, server-only for secrets) |

### Lead_Capture design (Requirement 4)

`POST /api/contact`:
1. Validate name/email/phone server-side (reuse `validators`).
2. Persist the submission durably (file/DB) — never lose a lead.
3. Deliver via configured channels:
   - **Email** to `Contact@babaflats.com` (SMTP via `nodemailer`, reply-to = submitter), and/or
   - **Google Sheet** append + email via a **Google Apps Script Web App** endpoint (works regardless of host; single endpoint can do both).
4. Return 200 on full success, 207 on partial delivery (lead still saved).

Because a Node server now runs in production, both the SMTP path and the Apps Script path are viable. The Apps Script remains the simplest way to satisfy the Google Sheet requirement without Google Cloud service accounts; its code and setup steps ship in the repo (`docs/`), configured via env.

### Deployment (Requirement 9)

- Primary: **Vercel** (zero-config Next.js) — fastest path, HTTPS + custom domain built-in.
- Portable alternative: **Docker image** (`next build` + `next start`) deployable to Render / Railway / Fly / AWS.
- CI: build + type-check + tests on push; deploy workflow to the chosen target.
- Hosting selection is deferred per direction; until then the app runs locally in production mode. This replaces the current `deploy-pages.yml` (GitHub Pages) once a target is chosen.

## Migration Strategy (phased, parity-preserving)

1. **Scaffold** Next.js app alongside current code (no route cutover yet); port Tailwind config + theme tokens + fonts.
2. **Shared primitives**: port `components/ui`, `lib/utils`, theme, `motion` helpers.
3. **Content system**: move content to a server-authoritative store; server read utilities.
4. **Static pages**: Home + Gallery as Server Components (+ client islands for lightbox/welcome gate); reach visual parity.
5. **API**: port Express endpoints to Route Handlers; implement Lead_Capture (email + Sheet).
6. **Contact page**: SSR shell + client form island wired to `/api/contact`.
7. **Studio**: port as an authenticated client route; publish persists server-side.
8. **Media/SEO**: `next/image`, Metadata API, robots + sitemap.
9. **Testing**: carry over unit tests; add API integration + one e2e; wire CI.
10. **Deployment**: Dockerfile + CI; finalize host when selected. Cut over from GitHub Pages.

Each phase is a reviewable checkpoint; the app must build at every checkpoint. The current implementation stays in the repo until the corresponding route reaches parity (Requirement 12.4).

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Studio (Puck) porting complexity | Port Studio last as a client-only dynamic route; keep its content contract identical. |
| Content model drift / data loss | Reuse existing types + validation; snapshot `content.json` before cutover; parity tests. |
| Scope/time (full rewrite) | Strict phasing; each phase shippable; no big-bang cutover. |
| Hosting undecided | Build host-agnostic (Docker); run locally in prod mode until chosen. |
| SEO regressions during cutover | Preserve routes/canonicals; sitemap; verify metadata parity before switching DNS. |

## No Static Hosting

The site is served exclusively by the Node application server (Next.js) at runtime — **no static export, no GitHub Pages**. SSG/ISR may pre-render pages, but they are served by the running server, not a static host. The existing `deploy-pages.yml` is retired during cutover (Requirement 9, Task 13–14).

## Coding Standards and Guardrails (Requirements 13–14)

Adopted standard toolchain for all new code:

- **Lint**: ESLint + `typescript-eslint` + `eslint-config-next` + `eslint-plugin-jsx-a11y` + `eslint-plugin-react-hooks`. (Biome is a viable single-tool alternative; ESLint chosen for Next.js parity.)
- **Format**: Prettier + `prettier-plugin-tailwindcss`, plus `.editorconfig`.
- **Dead code / hygiene**: Knip (unused files/exports/deps); optionally `dependency-cruiser` for architecture rules.
- **Git hooks**: Husky + lint-staged (lint + format + type-check staged files pre-commit).
- **Commits**: Conventional Commits enforced via commitlint (`@commitlint/config-conventional`).
- **CI**: run lint, type-check, Knip, and tests on every push; block merge on failure.
- **Docs**: `CODING_STANDARDS.md` documents conventions, structure, and the toolchain.

## Agent Skills (coding guidelines)

Managed by the `npx skills` toolchain, tracked in `skills-lock.json`, reproducible with `npx skills install`:

- **Installed**: `web-design-guidelines`, `writing-guidelines` (from `vercel-labs/agent-skills`), alongside the existing `shadcn` skill.
- **Recommended to add**: `react-best-practices`, `composition-patterns` (React/component standards).

Note: the CLI installs skill bodies under `.agents/skills/` (gitignored, like `node_modules`); the lock file is the committed source of truth. `CODING_STANDARDS.md` will instruct contributors to run `npx skills install` after clone.

## Frontend Component Audit and Cleanup (Requirement 13)

Before and during porting: run Knip + a manual pass to (a) verify each component renders/behaves correctly on its route, (b) drop dead/orphaned code (`AdminConfigPage`, `ContactStudioPage`, `HeroEditorPage`, unused UI components), and (c) remove unused dependencies. Only verified, used components are ported — no dead code is carried forward.

## Decisions (confirmed)

1. **Framework**: **Next.js App Router** + TypeScript + Tailwind.
2. **Content store**: JSON file (server-authoritative) now; database later.
3. **Lead delivery**: Google Apps Script (email + Google Sheet in one) now; SMTP optional later.
4. **Studio**: port Puck as-is (no behavior change).
5. **Hosting**: server-only — no static/GitHub Pages; specific Node host chosen at the deploy phase.
