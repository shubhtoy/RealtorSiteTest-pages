# AGENTS.md — `app/`

Next.js **App Router** surface: routes, layouts, and API route handlers. See the root `AGENTS.md`
for stack, commands, and deploy.

## Layout

- `app/layout.tsx` — root layout: fonts, global metadata (`metadataBase`, title template, the
  address in the description).
- `app/(public)/layout.tsx` — public site shell: seeds the editable-content provider from
  server-authoritative content, renders `SiteHeader`/`SiteFooter`/`WelcomeGate`, the
  `LocalBusinessJsonLd` structured data, and the sonner `<Toaster/>`.
- `app/(public)/page.tsx`, `gallery/page.tsx`, `contact/page.tsx` — thin route files that render the
  page components from `src/views/*`.
- `app/studio/` — the Puck-based content Studio (password-gated).
- `app/api/*` — route handlers. `runtime = "nodejs"` and `dynamic = "force-dynamic"` where they do
  filesystem I/O or send email (e.g. `app/api/contact/route.ts`).

## Rules

- Prefer **server components**; add `"use client"` only when you need state/effects/browser APIs.
- **API route validation:** validate and sanitize input before use; never trust the client. The
  contact route rate-limits per IP, validates fields server-side, persists the lead first, then
  delivers to channels best-effort.
- Read editable content via `getSiteContent()` (server) — it hydrates from defaults, so new
  content fields must have defaults (see `src/lib/editable-content-defaults.ts`).
- Keep secrets in server env only; never inline them or expose via `NEXT_PUBLIC_*`.
- New pages that should be indexed must set metadata and, if a place/business, contribute to the
  JSON-LD in `src/components/seo/`.
