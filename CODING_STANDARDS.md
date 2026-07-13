# Coding Standards

This document defines the coding standards, conventions, and automated guardrails for the
Baba Flats web application. It is the reference for Requirement 14 (Coding Standards and
Automated Guardrails) of the [proper-webserver-architecture](.kiro/specs/proper-webserver-architecture)
spec.

> **Migration context.** The project is mid-migration from a Vite + React SPA (in `src/`) plus a
> standalone Express server (in `server/`) to a server-rendered **Next.js (App Router)** app (in
> `app/`). The two stacks live side by side until each route reaches parity; the legacy sources are
> removed in the final cutover (Task 16). The guardrails below are intentionally **scoped to the new
> Next app surface** today and are widened as code is ported.

## Quick start (after cloning)

```bash
npm install                 # installs deps and, via the "prepare" script, sets up Husky hooks
npx skills install          # restores the agent guideline skills into .agents/ (gitignored)
```

`npm install` runs `prepare` → `husky`, which regenerates `.husky/_/` and activates the Git hooks.
No manual hook setup is required.

## Toolchain at a glance

| Concern                 | Tool                                                              | Config                                       |
| ----------------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| Linting                 | ESLint 9 (flat) + `eslint-config-next`, `jsx-a11y`, `react-hooks` | `eslint.config.mjs`                          |
| Formatting              | Prettier + `prettier-plugin-tailwindcss`                          | `.prettierrc`, `.prettierignore`             |
| Editor defaults         | EditorConfig                                                      | `.editorconfig`                              |
| Type checking           | TypeScript (`tsc --noEmit`, strict)                               | `tsconfig.json`                              |
| Pre-commit              | Husky + lint-staged                                               | `.husky/pre-commit`, `.lintstagedrc.json`    |
| Commit messages         | commitlint + Conventional Commits                                 | `.husky/commit-msg`, `commitlint.config.mjs` |
| Dead code / unused deps | Knip                                                              | `knip.json`                                  |
| Agent guidelines        | `skills` CLI                                                      | `skills-lock.json`                           |

## npm scripts

| Script                 | Purpose                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `npm run lint`         | ESLint over the Next app surface; fails on any warning or error. |
| `npm run format`       | Prettier `--write` across the formatter-governed surface.        |
| `npm run format:check` | Prettier `--check` (CI-friendly; no writes).                     |
| `npm run type-check`   | `tsc --noEmit` (strict, zero type errors required).              |
| `npm run knip`         | Report unused files, exports, and dependencies.                  |
| `npm run next:build`   | Production Next.js build.                                        |

Legacy Vite scripts (`dev`, `build`, `preview`, `server`, …) remain available during the migration.

## Project structure

```
app/                 # Next.js App Router — the target architecture (SSR routes, layouts, route handlers)
components/          # Shared UI primitives (added as components are ported)
public/              # Static assets served as-is; public/content.json is the content store
server/              # Legacy Express server (ported to Route Handlers, then removed)
src/                 # Legacy Vite + React SPA (ported route-by-route, then removed)
scripts/             # Legacy media-optimization scripts (replaced by next/image)
.kiro/specs/         # Requirements, design, and task plans
.husky/              # Git hooks
.agents/             # Agent guideline skill bodies (gitignored; restore via `npx skills install`)
```

Root configuration: `next.config.ts`, `tsconfig.json` (Next) / `tsconfig.vite.json` (legacy),
`tailwind.config.ts`, `postcss.config.js`, `eslint.config.mjs`, `.prettierrc`, `knip.json`,
`commitlint.config.mjs`.

## Conventions

- **Language:** TypeScript everywhere in the Next app; `strict` mode is on and the build must have
  zero type errors.
- **Components:** Server Components by default. Add `"use client"` only for components that need
  interactivity, browser APIs, or client-only libraries, and keep those boundaries as small
  (leaf-level) as possible.
- **Imports:** use the `@/*` path alias rather than long relative chains.
- **Styling:** Tailwind CSS v3 with the shared design tokens in `app/globals.css` /
  `tailwind.config.ts`. `prettier-plugin-tailwindcss` sorts class names automatically — do not hand-order them.
- **Accessibility:** the full `jsx-a11y` recommended ruleset is enforced. Keep semantic markup,
  labeled inputs, `alt` text, and correct ARIA usage.
- **React Hooks:** `react-hooks/rules-of-hooks` is an error and `react-hooks/exhaustive-deps` a
  warning (and warnings fail `npm run lint`).
- **Formatting:** never hand-format; run `npm run format`. Settings: 2-space indent, 100 print
  width, double quotes, semicolons, trailing commas.
- **Secrets:** never hardcode secrets; read them from environment variables (see `.env.example`).

### Lint & format scope during the migration

`eslint.config.mjs` and `.prettierignore` currently exclude the legacy `src/`, `server/`, and
`scripts/` trees, generated output, and authored docs so that `--max-warnings 0` and
`format:check` stay meaningful for **new** code. When a directory is ported into `app/`, remove it
from the ignore lists so the standards apply to it.

## Git hooks

- **pre-commit** (`.husky/pre-commit`): runs `lint-staged` (ESLint `--fix` + Prettier `--write` on
  staged files) followed by `npm run type-check`.
- **commit-msg** (`.husky/commit-msg`): runs `commitlint` to enforce Conventional Commits.

To bypass hooks in an emergency, `git commit --no-verify` — avoid this on shared branches.

## Conventional Commits

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <description>
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`,
`revert`. Examples:

```
feat(gallery): server-render the gallery route
fix(contact): reject submissions missing a valid phone number
chore: add coding standards, guardrails, and guideline skills
```

## Agent guideline skills

Agent coding-guideline skills are managed by the [`skills`](https://skills.sh) CLI and pinned in
`skills-lock.json`. Installed skills:

- `vercel-react-best-practices` — React best practices
- `vercel-composition-patterns` — component composition patterns
- `web-design-guidelines` — web design guidelines
- `writing-guidelines` — writing guidelines
- `shadcn` — shadcn/ui usage

The skill bodies live in `.agents/` and are **gitignored**; only `skills-lock.json` is committed.
Restore them locally after cloning with:

```bash
npx skills install
```

Add a new skill with `npx skills add <owner>/<repo> -s <skill> --yes` and commit the updated
`skills-lock.json`.

## Dead-code analysis

`npm run knip` reports unused files, exports, and dependencies (config in `knip.json`, scoped to
`app/` and `server/`). Expect it to flag dependencies that are still used only by the legacy `src/`
tree until that code is retired in Task 16; treat those as known and defer them to the cleanup phase.
