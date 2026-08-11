# Contributing to Baba Flats

Thanks for helping improve the Baba Flats website. This guide covers the workflow, standards, and
checks. For deeper code rules see [`CODING_STANDARDS.md`](./CODING_STANDARDS.md); for architecture
and agent guidance see [`AGENTS.md`](./AGENTS.md).

## Getting started

```bash
npm install      # installs deps + sets up Husky git hooks
npm run dev      # http://localhost:3000  (Studio at /studio)
```

Copy `.env.example` to `.env` and fill in what you need (at minimum `STUDIO_PASSWORD` +
`NEXT_PUBLIC_STUDIO_PASSWORD`). Never commit `.env` or any secret.

## Branching & pull requests

- `main` is **protected** — never push to it directly. All changes land via pull request.
- Branch from `main` using a descriptive prefix:
  `feat/…`, `fix/…`, `chore/…`, `docs/…`, `refactor/…`, `test/…`, `ci/…`.
- Keep PRs focused and reasonably small. Fill in the PR template.
- A PR must be **green** (CI passes) and reviewed before merge. Merging to `main` auto-deploys to
  production, so only merge when you intend to ship.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint:

```
<type>(<scope>): <short summary>

<body wrapped at 100 characters>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`, `build`, `style`, `revert`.

## Required checks (run before pushing)

```bash
npm run lint          # ESLint 9, zero warnings
npm run type-check    # tsc --noEmit
npm run knip          # no dead code / unused deps
npm test              # vitest
npm run build         # next build
```

Husky runs lint-staged + type-check on commit; CI re-runs everything on push/PR.

## Tests

- Add or update tests with any behavior change. Put framework-free logic in `src/lib/` and test it
  with vitest.
- Test **distinct behaviors**, not data-provider row counts. Never tweak production code just to
  make a test pass — fix the code only if it's genuinely wrong, otherwise fix/delete the test.

## Content & persistence

The Studio writes `public/content.json` and `public/uploads/` at runtime (disk-mode); these are
**gitignored and must stay untracked** — see [`AGENTS.md`](./AGENTS.md#persistence). When adding an
editable field, wire it type → default → hydrate merge → validation → Studio field so existing
content stays valid.

## Deploying

Push/merge to `main` → GitHub Actions deploys via OIDC + SSM to the EC2 host. Do not deploy by SSH.

## Reporting bugs / requesting features

Open an issue using the templates under **New issue**. For anything security-sensitive, follow
[`SECURITY.md`](./SECURITY.md) instead of filing a public issue.
