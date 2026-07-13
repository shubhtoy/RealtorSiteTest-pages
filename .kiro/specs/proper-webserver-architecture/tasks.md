# Implementation Plan: Proper Web-Server Architecture

## Overview

Phased migration of Baba Flats to a server-rendered full-stack app on **Next.js (App Router)** — pending framework sign-off (see design "Open Decisions"). Phases are ordered so the app builds at every checkpoint and the current site keeps working until each route reaches parity. Tasks marked `*` are optional/nice-to-have.

> **Gate:** Do not start Task 1 until the framework (Next.js recommended) is confirmed. If a different framework is chosen, this plan is revised (requirements are unaffected).

## Tasks

- [ ] 1. Scaffold the framework app alongside existing code
  - [ ] 1.1 Initialize Next.js (App Router, TypeScript) in-repo without removing the current Vite app; keep both buildable
    - _Requirements: 7.1, 12.1, 12.3_
  - [ ] 1.2 Port Tailwind config, design tokens, global CSS, and fonts; verify theme parity in a scratch page
    - _Requirements: 3.2, 7.4_
  - [ ] 1.3 Configure path aliases, tsconfig (strict), ESLint to match framework standards
    - _Requirements: 7.3, 7.5_

- [ ] 2. Port shared primitives
  - [ ] 2.1 Move `components/ui/*`, `lib/utils`, `motion` helpers; resolve client/server component boundaries (`"use client"` where needed)
    - _Requirements: 3.2, 7.2_
  - [ ] 2.2 Port layout components (SiteHeader, SiteFooter, WelcomeGate, ThemeInjector) as appropriate server/client components
    - _Requirements: 3.2, 3.3_

- [ ] 3. Server-authoritative content system
  - [ ] 3.1 Move published content into a server-read content store; snapshot current `content.json` (no data loss)
    - _Requirements: 5.1, 5.2, 12.2_
  - [ ] 3.2 Reuse existing content types + `validateEditableSiteDocument`; fall back to defaults on invalid content
    - _Requirements: 5.5_

- [ ] 4. Checkpoint — Next app builds; theme + primitives + content read verified
  - Ensure `build` + `type-check` pass. Ask the user if questions arise.

- [ ] 5. Home and Gallery as server-rendered routes
  - [ ] 5.1 Implement Home (`app/page.tsx`) reading content server-side; welcome gate as client island; reach visual parity
    - _Requirements: 1.1, 3.1, 3.2, 3.3_
  - [ ] 5.2 Implement Gallery with server render + client lightbox island; preserve floor-plan `object-contain` fix and unit-video support
    - _Requirements: 3.1, 3.2, 3.3, 6.4_

- [ ] 6. API endpoints (Route Handlers)
  - [ ] 6.1 Port content draft/publish + asset upload endpoints with auth, security headers, and 400/401 handling
    - _Requirements: 2.2, 2.3, 2.5, 2.6, 8.1_
  - [ ] 6.2 Implement `POST /api/contact`: server-side validation, durable persistence, rate limit
    - _Requirements: 2.4, 4.1, 4.2, 4.5_
  - [ ] 6.3 Implement Lead_Capture delivery: email to `Contact@babaflats.com` (reply-to submitter) + Google Sheet append via Apps Script; config from env
    - _Requirements: 4.3, 4.4, 4.6, 8.1_
  - [ ] 6.4 Add the ready-to-deploy Google Apps Script (Sheet append + email) and setup docs
    - _Requirements: 4.4_
  - [ ]* 6.5 Integration tests for `/api/contact` (valid, missing fields, malformed)
    - _Requirements: 10.2_

- [ ] 7. Contact page (SSR shell + client form island)
  - [ ] 7.1 Implement contact route with the form island wired to `/api/contact`; inline validation, disabled-while-submitting, aria error association, unreachable-server toast
    - _Requirements: 3.1, 4.1, 11.2_

- [ ] 8. Studio (authenticated client route)
  - [ ] 8.1 Port Studio as a dynamic client route (`noindex`); wire draft edit + publish to persist server-side
    - _Requirements: 3.1, 5.3, 5.4, 8.1_

- [ ] 9. Media and SEO
  - [ ] 9.1 Replace `OptimizedImage`/sharp with `next/image`; reserve dimensions to avoid CLS; prioritize Home hero
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ] 9.2 Replace `setPageMeta` with the Metadata API on every route (title, description, canonical, OG); Studio `noindex`
    - _Requirements: 1.2, 1.5_
  - [ ] 9.3 Add generated `robots.ts` and `sitemap.ts`
    - _Requirements: 1.3_

- [ ] 10. Checkpoint — full route + feature parity
  - Verify Home, Gallery, Contact, Studio, 404 parity (design, features, a11y, reduced-motion). `build` + `type-check` + tests pass.
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 11.2, 11.3, 12.3_

- [ ] 11. Environment and configuration
  - [ ] 11.1 Consolidate env access (server-only secrets vs `NEXT_PUBLIC_*`); fail-fast on missing required secrets; update `.env.example`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 12. Testing and CI
  - [ ] 12.1 Carry over content-system unit tests; ensure they pass under the new structure
    - _Requirements: 10.1_
  - [ ]* 12.2 Add one end-to-end test: load Home → go to Contact → submit valid lead → assert success
    - _Requirements: 10.3_
  - [ ] 12.3 Add CI workflow (build + type-check + tests on push)
    - _Requirements: 9.5, 10.4_

- [ ] 13. Deployment readiness
  - [ ] 13.1 Add Dockerfile (`next build`/`next start`) and verify local production run
    - _Requirements: 9.1, 9.2, 9.3, 9.6_
  - [ ] 13.2 Add deploy workflow for the chosen Deploy_Target; configure HTTPS + custom domain; retire `deploy-pages.yml`
    - _Requirements: 9.4, 9.5_

- [ ] 14. Cutover and cleanup
  - [ ] 14.1 Switch production from GitHub Pages to the Node Deploy_Target; verify Lead_Capture end-to-end in prod
    - _Requirements: 4.3, 4.4, 12.4_
  - [ ] 14.2 Remove the retired Vite/Express code once parity is confirmed; update README
    - _Requirements: 12.5_
