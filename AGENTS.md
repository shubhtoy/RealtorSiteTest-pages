# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository. This follows the
[agents.md](https://agents.md) convention: a root `AGENTS.md` plus per-directory `AGENTS.md`
files with more specific instructions. Read the closest `AGENTS.md` to the files you are editing.

## What this is

**Baba Flats** — the marketing + leasing website for an apartment community at
1204 Veterans Memorial Hwy SW, Mableton, GA 30126. It is a **Next.js (App Router)** app with an
in-browser content Studio (Puck) so non-technical staff can edit the site.

- **Stack:** Next.js 16 (App Router) · TypeScript · React · Tailwind CSS · Puck 0.23 (Studio) ·
  sonner (toasts) · nodemailer + google-spreadsheet (lead delivery) · sharp · vitest.
- **Rendering:** server components + client islands. Public routes live under `app/(public)/`.
- **CMS:** "disk-mode" — the Studio publishes to `public/content.json` and uploads to
  `public/uploads/`, written at runtime on the server's persistent disk. See "Persistence" below.

## Repository map

| Path                       | What lives here                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| `app/`                     | Next.js App Router routes, layouts, and API route handlers (`app/api/*`).                       |
| `src/views/`               | Page **components** (HomePage, GalleryPage, ContactPage, StudioPage) imported by `app/` routes. |
| `src/components/`          | Reusable UI: `layout/`, `ui/`, `media/`, `seo/`, `studio/`.                                     |
| `src/lib/`                 | Framework-free logic: content resolve/store, contact delivery, helpers. Unit-tested.            |
| `src/types/`               | Shared TypeScript types (notably the editable-content document).                                |
| `src/config/`, `src/data/` | Static config and seed data.                                                                    |
| `docs/`                    | Operator docs, including the Google Apps Script endpoint (`docs/apps-script/`).                 |
| `.github/`                 | CI/CD workflows, issue/PR templates, agent skills.                                              |

## Commands (run from the repo root)

```bash
npm install            # deps + Husky hooks (via prepare)
npm run dev            # local dev server (http://localhost:3000)
npm run lint           # ESLint 9 flat config, zero warnings allowed
npm run type-check     # tsc --noEmit
npm test               # vitest run
npm run knip           # dead-code / unused-dependency analysis
npm run build          # production build (next build)
npm run format         # prettier --write
```

**Before you open a PR, all of these must pass:** `lint`, `type-check`, `knip`, `test`, `build`.
CI (`.github/workflows/ci.yml`) runs them on every push and PR.

## Persistence — READ THIS before touching content

- `public/content.json`, `public/uploads/`, and `.data/` are **gitignored** and written at runtime
  (disk-mode). They live on the server's EBS volume and survive deploys.
- **Never re-track `public/content.json`.** A `git reset` during deploy would then overwrite live
  Studio edits. If you need sample content for a test, guard on file existence (see
  `src/lib/content/get-site-content.test.ts`).
- New user uploads are already ignored; committed media assets (e.g. the hero/aerial video) are the
  exception and are force-added.

## Deploy / CI-CD

- **Auto-deploy on push to `main`** via `.github/workflows/deploy.yml`: GitHub OIDC → assume the AWS
  role → SSM `RunShellScript` runs `/usr/local/bin/babaflats-deploy.sh` on the EC2 instance
  (`git reset --hard origin/main` → `npm ci` → `next build` → `systemctl restart babaflats`).
  No SSH, no static keys, no inbound ports.
- **Host:** single EC2 instance (ap-south-1), nginx reverse proxy (80/443) → Node on :3000, behind
  Cloudflare. TLS terminates at Cloudflare (Full) and at nginx (origin cert).
- Agents: do **not** SSH to deploy — push to `main` and let CI/CD run.

## Conventions

- **Commits:** Conventional Commits, enforced by commitlint; wrap the body at 100 chars.
  Examples: `feat(gallery): …`, `fix(studio): …`, `chore(deps): …`.
- **Branches / PRs:** work on a feature branch, open a PR into `main` (a protected branch — never
  push to it directly), keep it green, merge via the PR. See `CONTRIBUTING.md`.
- **Code standards:** see `CODING_STANDARDS.md` (linting, formatting, a11y, testing, docblocks).
- **Docblocks:** state what a function does, its params, and return value — no essays or rationale.
- **Secrets:** never commit secrets. Non-secret, user-editable settings live in content; transport
  credentials (SMTP, Google service account) live only in server env. See `SECURITY.md`.

## Safety rails for agents

- Don't weaken auth, validation, or security headers without calling it out.
- Don't add dependencies casually; prefer what's installed. Pin versions.
- Match existing patterns; read the nearest `AGENTS.md` and neighboring files first.
- Verify with the commands above before proposing a change as done.
