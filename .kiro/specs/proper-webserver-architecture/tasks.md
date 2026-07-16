# Implementation Plan: Proper Web-Server Architecture

## Overview

Phased migration of Baba Flats to a **server-rendered full-stack app on Next.js (App Router)** — **server-only, no static/GitHub Pages** (see design "Decisions (confirmed)"). Coding standards and guardrails are set up first so all new code meets them; the current site keeps working until each route reaches parity, and the app must build at every checkpoint. Tasks marked `*` are optional/nice-to-have.

## Tasks

- [ ] 1. Coding standards, guardrails, and agent skills (set before writing feature code)
  - [ ] 1.1 Add ESLint (`typescript-eslint`, `eslint-config-next`, `jsx-a11y`, `react-hooks`) + Prettier (`prettier-plugin-tailwindcss`) + `.editorconfig`
    - _Requirements: 14.1, 14.2_
  - [ ] 1.2 Add Husky + lint-staged (lint/format/type-check staged files) and commitlint (`@commitlint/config-conventional`) for Conventional Commits
    - _Requirements: 14.3, 14.4_
  - [ ] 1.3 Add Knip for dead-code/unused-dependency analysis; wire an `npm run` script
    - _Requirements: 13.2, 13.4_
  - [ ] 1.4 Record agent guideline skills in `skills-lock.json` (installed: `web-design-guidelines`, `writing-guidelines`; add `react-best-practices`, `composition-patterns`); document `npx skills install`
    - _Requirements: 14.5_
  - [ ] 1.5 Write `CODING_STANDARDS.md` (conventions, structure, toolchain, skills)
    - _Requirements: 14.6_

- [ ] 2. Scaffold the Next.js app alongside existing code
  - [ ] 2.1 Initialize Next.js (App Router, TypeScript) in-repo without removing the Vite app; keep both buildable
    - _Requirements: 7.1, 12.1, 12.3_
  - [ ] 2.2 Port Tailwind config, design tokens, global CSS, and fonts; verify theme parity
    - _Requirements: 3.2, 7.4_
  - [ ] 2.3 Configure strict tsconfig, path aliases, and ESLint to the framework standard
    - _Requirements: 7.3, 7.5, 14.1_

- [ ] 3. Port shared primitives
  - [ ] 3.1 Move `components/ui/*`, `lib/utils`, `motion` helpers; set `"use client"` boundaries correctly
    - _Requirements: 3.2, 7.2_
  - [ ] 3.2 Port layout components (SiteHeader, SiteFooter, WelcomeGate, ThemeInjector)
    - _Requirements: 3.2, 3.3_

- [ ] 4. Frontend component audit and cleanup
  - [ ] 4.1 Run Knip + manual review; catalog every component as port / drop, and confirm each ported component renders and behaves correctly
    - _Requirements: 13.1, 13.2, 13.5_
  - [ ] 4.2 Exclude orphaned/dead code (`AdminConfigPage`, `ContactStudioPage`, `HeroEditorPage`, unused UI) and remove unused dependencies
    - _Requirements: 13.3, 13.4_

- [ ] 5. Server-authoritative content system
  - [ ] 5.1 Move published content into a server-read store; snapshot current `content.json` (no data loss)
    - _Requirements: 5.1, 5.2, 12.2_
  - [ ] 5.2 Reuse existing content types + `validateEditableSiteDocument`; fall back to defaults on invalid content
    - _Requirements: 5.5_

- [ ] 6. Checkpoint — Next app builds; standards green; theme + primitives + content verified
  - `build` + `type-check` + `lint` + Knip pass. Ask the user if questions arise.
  - _Requirements: 13.5, 14.1_

- [ ] 7. Home and Gallery as server-rendered routes
  - [ ] 7.1 Home (`app/page.tsx`) reads content server-side; welcome gate as client island; visual parity
    - _Requirements: 1.1, 3.2, 3.3_
  - [ ] 7.2 Gallery with server render + client lightbox island; preserve floor-plan `object-contain` fix and unit-video support
    - _Requirements: 1.1, 3.2, 3.3, 6.4_

- [ ] 8. API endpoints (Route Handlers)
  - [ ] 8.1 Port content draft/publish + asset upload with auth, security headers, and 400/401 handling
    - _Requirements: 2.2, 2.3, 2.5, 2.6, 8.1_
  - [ ] 8.2 Implement `POST /api/contact`: server-side validation, durable persistence, rate limit
    - _Requirements: 2.4, 4.1, 4.2, 4.5_
  - [ ] 8.3 Implement Lead_Capture: email to `Contact@babaflats.com` (reply-to submitter) + Google Sheet append via Apps Script; config from env
    - _Requirements: 4.3, 4.4, 4.6, 8.1_
  - [ ] 8.4 Add the ready-to-deploy Google Apps Script (Sheet append + email) and setup docs
    - _Requirements: 4.4_
  - [ ]* 8.5 Integration tests for `/api/contact` (valid, missing fields, malformed)
    - _Requirements: 10.2_

- [ ] 9. Contact page (SSR shell + client form island)
  - [ ] 9.1 Contact route with form island wired to `/api/contact`; inline validation, disabled-while-submitting, aria error association, unreachable-server toast
    - _Requirements: 3.1, 4.1, 11.2_

- [ ] 10. Studio (authenticated client route)
  - [ ] 10.1 Port Studio as a dynamic client route (`noindex`); draft edit + publish persists server-side
    - _Requirements: 3.1, 5.3, 5.4, 8.1_

- [ ] 11. Media and SEO
  - [ ] 11.1 Replace `OptimizedImage`/sharp with `next/image`; reserve dimensions; prioritize Home hero
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ] 11.2 Replace `setPageMeta` with the Metadata API on every route (title, description, canonical, OG); Studio `noindex`
    - _Requirements: 1.2, 1.5_
  - [ ] 11.3 Add generated `robots.ts` and `sitemap.ts`
    - _Requirements: 1.3_

- [ ] 12. Checkpoint — full route + feature parity
  - Verify Home, Gallery, Contact, Studio, 404 parity (design, features, a11y, reduced-motion). `build` + `type-check` + `lint` + Knip + tests pass.
  - _Requirements: 3.1, 3.2, 3.3, 11.2, 11.3, 12.3, 13.1, 13.5_

- [ ] 13. Environment and configuration
  - [ ] 13.1 Consolidate env (server-only secrets vs `NEXT_PUBLIC_*`); fail-fast on missing required secrets; update `.env.example`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 14. Testing and CI
  - [ ] 14.1 Carry over content-system unit tests; ensure they pass under the new structure
    - _Requirements: 10.1_
  - [ ]* 14.2 Add one end-to-end test: load Home → go to Contact → submit valid lead → assert success
    - _Requirements: 10.3_
  - [ ] 14.3 Add CI workflow running lint + type-check + Knip + tests on push; block merge on failure
    - _Requirements: 9.5, 10.4, 14.7_

- [ ] 15. Deployment readiness (server-only)
  - [ ] 15.1 Add Dockerfile (`next build`/`next start`) and verify local production run; no static export
    - _Requirements: 9.1, 9.2, 9.3, 9.6_
  - [ ] 15.2 Add deploy workflow for the chosen Node host; HTTPS + custom domain; retire `deploy-pages.yml`
    - _Requirements: 9.4, 9.5_

- [ ] 16. Cutover and cleanup
  - [ ] 16.1 Switch production from GitHub Pages to the Node host; verify Lead_Capture end-to-end in prod
    - _Requirements: 4.3, 4.4, 12.4_
  - [ ] 16.2 Remove retired Vite/Express code; confirm zero dead code and zero unused deps (Knip); update README
    - _Requirements: 12.5, 13.3, 13.4_
