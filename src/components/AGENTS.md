# AGENTS.md — `src/components/`

Reusable React components. See the root and `src/AGENTS.md` for context.

## Structure

- `layout/` — `SiteHeader` (sticky), `SiteFooter`, `WelcomeGate` (splash with aerial video),
  `SitePreloader`, `ThemeInjector`.
- `ui/` — primitives and effects (shadcn-style + bespoke: cards, hero-parallax, focus-cards, etc.).
- `media/` — `OptimizedImage`, `AerialBand` (full-bleed background video band).
- `seo/` — `LocalBusinessJsonLd` (schema.org structured data).
- `studio/` — Studio-only editing surfaces (Puck custom fields, live preview, workspace).

## Rules

- Client components need `"use client"`. Respect reduced-motion (`useReducedMotion`) and provide a
  static fallback for video/animation (see `AerialBand`, `WelcomeGate`).
- Read editable values from `useEditableContent()` — do **not** hardcode content (address, phone,
  copy); those come from `content.global` / section content so they stay Studio-editable.
- Accessibility is enforced by `eslint-plugin-jsx-a11y`: label controls, provide `alt`, keyboard
  handlers for click targets, and `aria-*` where needed.
- Keep Tailwind classes readable; the prettier tailwind plugin orders them on format.
