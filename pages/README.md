# Placeholder `pages/` directory (App Router project)

This project uses the **Next.js App Router** (the `app/` directory). This
`pages/` directory is an intentional, empty placeholder and defines **no
routes**.

## Why it exists

During the incremental migration away from the legacy Vite app, the Vite source
still lives under `src/` — including `src/pages/` (React Router page
components). Next.js requires that, when it detects both an `app` and a `pages`
directory, they share the same parent folder. Because `app/` is at the repo root
and `src/pages/` is under `src/`, Next would otherwise fail the build with:

> `pages` and `app` directories should be under the same folder

Next resolves the Pages Router directory by preferring `./pages` over
`./src/pages`. Providing this root-level `pages/` directory therefore takes
precedence over `src/pages/`, so the App Router builds cleanly while the Vite
source remains untouched. `README.md` is not a page extension, so no Pages
Router routes are generated.

**Remove this directory** once the Vite app (`src/`) is retired in a later
migration phase.
