# Requirements Document

## Introduction

This document defines the requirements for migrating the Baba Flats apartment website from its current architecture — a client-only Vite + React SPA, a separate hand-rolled Express server, and static GitHub Pages hosting — to a **proper server-rendered, full-stack web application built on a standard framework**.

The migration must deliver server-side rendering for SEO and performance, a single unified application server that exposes real API endpoints (so the contact form can email leads and append them to a Google Sheet in production), a preserved content/Studio editing system with server-side persistence, framework-standard media optimization, and a standard, repeatable deployment to a Node-capable host. It must preserve all existing functionality, content, and visual design with no regressions, and be executed incrementally so the site remains shippable throughout.

This spec supersedes and absorbs the hosting/backend concerns tracked in GitHub issues #2 (contact email), #3 (Google Sheet), and #9 (hosting migration).

## Glossary

- **WebApp**: The Baba Flats website as a unified full-stack application (frontend + server) on the chosen framework.
- **App_Server**: The framework's Node.js server process that renders pages and serves API endpoints from a single origin.
- **API_Endpoint**: A server route exposed by the framework (e.g., a Route Handler) replacing the current Express `/api/*` routes.
- **Renderer**: The rendering strategy per route — Server-Side Rendering (SSR), Static Site Generation (SSG), or Incremental Static Regeneration (ISR).
- **Content_System**: The editable content model (currently `content.json` + `editable-content` types/store) that drives page copy and media.
- **Studio**: The visual content editor (currently at `/studio`) used to edit and publish content.
- **Lead_Capture**: The end-to-end contact-form pipeline: validation, email delivery to `Contact@babaflats.com`, and Google Sheet append.
- **Media_Pipeline**: The responsive-image generation and delivery mechanism (currently custom `sharp` + `OptimizedImage`).
- **Deploy_Target**: The Node-capable hosting environment the WebApp is deployed to (to be selected).
- **Parity**: Behavioral and visual equivalence between the current site and the migrated WebApp.

## Requirements

### Requirement 1: Server-Rendered Delivery and SEO

**User Story:** As a prospective renter using a search engine, I want the site's pages to be server-rendered with correct metadata, so that pages load fast and rank well.

#### Acceptance Criteria

1. THE WebApp SHALL render the Home, Gallery, and Contact routes on the server (SSR or SSG) so that fully-formed HTML is delivered on first response.
2. THE WebApp SHALL produce a unique `<title>`, meta description, canonical URL, and Open Graph tags for each public route using the framework's standard metadata mechanism.
3. THE WebApp SHALL serve a valid `robots.txt` and a generated `sitemap.xml` covering all public routes.
4. WHEN a crawler requests a public route, THE WebApp SHALL return the rendered content without requiring client-side JavaScript execution.
5. THE WebApp SHALL exclude the Studio route from search-engine indexing.

### Requirement 2: Unified Application Server and API

**User Story:** As a developer, I want one application server that renders pages and serves the API from a single origin, so that there is no split between static hosting and a separate backend.

#### Acceptance Criteria

1. THE WebApp SHALL expose all server functionality (page rendering and API endpoints) from a single App_Server and origin.
2. THE WebApp SHALL provide API_Endpoints equivalent to the current Express routes: contact submission, content draft/publish read-write, and asset upload.
3. THE App_Server SHALL set security response headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy) on responses, preserving the protections in the current server.
4. THE App_Server SHALL enforce rate limiting on the contact submission endpoint of no more than 10 requests per minute per client IP.
5. WHEN a request body is malformed, THE API_Endpoint SHALL return a 400 status with a descriptive JSON error rather than an unhandled exception.
6. THE App_Server SHALL protect content-mutation endpoints behind authentication and reject unauthenticated requests with 401.

### Requirement 3: Route and Feature Parity

**User Story:** As a site owner, I want the migrated site to behave and look exactly like the current one, so that no functionality or design is lost.

#### Acceptance Criteria

1. THE WebApp SHALL provide the routes `/` (Home), `/gallery` (Gallery), `/contact` (Contact), `/studio` (Studio), and a 404 page.
2. THE WebApp SHALL preserve the current visual design, layout, theme tokens, and animations for all migrated pages.
3. THE WebApp SHALL retain the recently shipped features: the welcome intro gate, the Google Reviews footer link, the corrected floor-plan gallery display, and the unified "Baba Flats" branding.
4. WHEN a user navigates to an undefined route, THE WebApp SHALL render a dedicated 404 page.
5. THE WebApp SHALL preserve keyboard accessibility and reduced-motion behavior established in the current site.

### Requirement 4: Contact Form Lead Capture (Email + Google Sheet)

**User Story:** As leasing staff, I want every contact submission to reach us by email and land in a shared Google Sheet, so that no lead is lost.

#### Acceptance Criteria

1. THE Contact_Form SHALL require a name, a valid email, and a phone number with at least 10 digits before submission is allowed (client-side).
2. THE API_Endpoint SHALL re-validate required fields server-side and reject submissions missing a valid email or phone with a 400 status.
3. WHEN a valid submission is received, THE Lead_Capture SHALL send an email to `Contact@babaflats.com` containing all submitted fields and a reply-to set to the submitter's email.
4. WHEN a valid submission is received, THE Lead_Capture SHALL append a timestamped row to the configured Google Sheet with all submitted fields.
5. IF an email or Sheet delivery channel fails, THEN THE Lead_Capture SHALL still persist the submission durably and return a response indicating partial delivery, without losing the lead.
6. THE Lead_Capture SHALL read all destination configuration (recipient, SMTP or Apps Script endpoint, Sheet target) from environment/secret configuration, never hardcoded in source.

### Requirement 5: Content Management and Studio Preservation

**User Story:** As a content editor, I want to keep editing site content through the Studio without losing my existing content, so that the migration is seamless.

#### Acceptance Criteria

1. THE WebApp SHALL preserve the existing published content (all fields currently in `content.json`) with no data loss.
2. THE WebApp SHALL render page content from the server-side Content_System on each request.
3. THE Studio SHALL continue to support editing a draft and publishing it to become the live content.
4. WHEN content is published, THE WebApp SHALL persist it server-side (authoritative) and serve the updated content on subsequent requests.
5. THE Content_System SHALL validate content structure on read and fall back to defaults on validation failure.

### Requirement 6: Standard Media Optimization

**User Story:** As a user on a mobile device, I want images to load efficiently at the right size, so that pages are fast and do not shift layout.

#### Acceptance Criteria

1. THE Media_Pipeline SHALL serve responsive, modern-format images (e.g., AVIF/WebP) using the framework's standard image tooling.
2. THE Media_Pipeline SHALL prevent cumulative layout shift by reserving image dimensions/aspect-ratio.
3. THE WebApp SHALL prioritize the Home hero image as a high-priority load.
4. THE WebApp SHALL preserve the ability to add and serve uploaded gallery media, including videos for 1BR/2BR/3BR units.

### Requirement 7: Standard Framework Conventions and Structure

**User Story:** As a developer, I want the project to follow the chosen framework's standard conventions, so that it is maintainable and familiar to any developer.

#### Acceptance Criteria

1. THE WebApp SHALL follow the chosen framework's canonical project structure and routing conventions.
2. THE WebApp SHALL use the framework's standard data-fetching and server/client component boundaries.
3. THE WebApp SHALL retain TypeScript with strict type-checking and compile with zero type errors.
4. THE WebApp SHALL retain Tailwind CSS and the existing design-token theme.
5. THE WebApp SHALL use consistent import path aliases across the codebase.

### Requirement 8: Environment and Secrets Configuration

**User Story:** As a developer deploying the site, I want a single, documented source of configuration with no secrets in source, so that deployments are safe and repeatable.

#### Acceptance Criteria

1. THE WebApp SHALL read all server secrets (studio password, SMTP/Apps Script config, Sheet target) exclusively from environment variables with no hardcoded fallback.
2. WHEN a required secret is missing at startup, THE App_Server SHALL fail fast with a descriptive error.
3. THE WebApp SHALL distinguish server-only secrets from client-exposed configuration per the framework's public-env conventions.
4. THE `.env.example` SHALL document every variable with placeholder values and comments.

### Requirement 9: Deployment Readiness and CI/CD

**User Story:** As a site owner, I want the site deployed to a proper host with HTTPS and automated builds, so that releases are reliable.

#### Acceptance Criteria

1. THE WebApp SHALL be deployable to a Node-capable Deploy_Target using the framework's standard production build and start commands.
2. THE WebApp SHALL provide a reproducible production build that completes with zero errors.
3. THE WebApp SHALL support a containerized (Docker) build so it is portable across hosts.
4. THE WebApp SHALL serve over HTTPS on the Deploy_Target with a configurable custom domain.
5. THE repository SHALL include a CI workflow that builds and type-checks on every push, and a deploy workflow to the Deploy_Target.
6. WHILE a Deploy_Target has not been finalized, THE WebApp SHALL be fully runnable locally in production mode (`build` + `start`).

### Requirement 10: Testing Foundation

**User Story:** As a developer, I want automated tests across the stack, so that the migration and future changes are safe.

#### Acceptance Criteria

1. THE WebApp SHALL include unit tests for the Content_System (read, write, publish, validation) carried over from the current suite.
2. THE WebApp SHALL include integration tests for the contact submission API covering valid, missing-field, and malformed payloads.
3. THE WebApp SHALL include at least one end-to-end test covering: load Home, navigate to Contact, submit a valid lead, and assert a success response.
4. THE test suite SHALL run in CI and block merge on failure.

### Requirement 11: Performance and Accessibility Budgets

**User Story:** As any visitor, I want the site to be fast and accessible, so that it works well for everyone.

#### Acceptance Criteria

1. THE WebApp SHALL meet a Lighthouse Performance score of at least 90 on the Home route in a production build (desktop).
2. THE WebApp SHALL meet WCAG 2.1 AA basics carried over from the current site (skip link, labeled inputs, aria error association, contrast, keyboard access).
3. WHEN `prefers-reduced-motion` is set, THE WebApp SHALL disable non-essential animations.
4. THE WebApp SHALL lazy-load non-critical client JavaScript.

### Requirement 12: Migration Safety and Data Preservation

**User Story:** As a site owner, I want the migration done safely and incrementally, so that the live site is never broken and no content is lost.

#### Acceptance Criteria

1. THE migration SHALL be performed on a branch and merged only after build, type-check, and tests pass.
2. THE migration SHALL preserve all existing published content and media assets.
3. THE migration SHALL proceed in phases, each independently reviewable, with the site remaining buildable at each phase checkpoint.
4. IF the migrated WebApp cannot reach parity for a route, THEN that route SHALL remain served by the current implementation until parity is achieved (no half-broken releases).
5. THE migration SHALL retain the current git history and provide a clear rollback path.

### Requirement 13: Frontend Component Correctness and Codebase Cleanup

**User Story:** As a developer, I want every frontend component verified to work and all dead code removed, so that only correct, used code is carried into the new app.

#### Acceptance Criteria

1. THE migration SHALL verify each ported component renders and behaves correctly (visual and interaction parity) on its route before that route is considered done.
2. THE migration SHALL run a dead-code analyzer (e.g., Knip) to identify unused files, exports, and dependencies, and SHALL exclude them from the WebApp.
3. THE WebApp SHALL contain no orphaned pages/components (including the previously identified `AdminConfigPage`, `ContactStudioPage`, and `HeroEditorPage`).
4. THE WebApp SHALL declare zero unused dependencies in `package.json`.
5. THE WebApp SHALL pass lint and type-check with zero errors as a precondition for each migration-phase checkpoint.

### Requirement 14: Coding Standards and Automated Guardrails

**User Story:** As a developer, I want enforced coding standards and guidelines for all future code, so that quality and style stay consistent and are checked automatically.

#### Acceptance Criteria

1. THE WebApp SHALL enforce linting (ESLint with `typescript-eslint` and the framework's recommended config, plus `jsx-a11y` and `react-hooks`; Biome is an accepted single-tool alternative) with zero errors in CI.
2. THE WebApp SHALL enforce consistent formatting via a standard formatter (Prettier or Biome) and an `.editorconfig`.
3. THE WebApp SHALL run lint, format, and type-check on staged files pre-commit via Git hooks (e.g., Husky + lint-staged).
4. THE WebApp SHALL enforce Conventional Commits (e.g., commitlint) so history stays semantic.
5. THE repository SHALL include agent coding-guideline skills managed by the `npx skills` toolchain and tracked in `skills-lock.json`, covering React best practices, web design, and writing guidelines, reproducible via `npx skills install`.
6. THE repository SHALL include a documented coding-standards reference (`CODING_STANDARDS.md`) describing conventions, structure, and the guardrail toolchain.
7. THE CI pipeline SHALL run lint, type-check, dead-code analysis, and tests, and SHALL block merge on failure.
