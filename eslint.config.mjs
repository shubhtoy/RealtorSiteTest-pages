import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

/**
 * Flat ESLint config for the Next.js App Router surface.
 *
 * Scope: during the incremental migration we lint only the new Next app and its
 * root config files. Legacy Vite (`src/`), Express (`server/`), and build
 * scripts are ported in later phases and removed in Task 16, so they are ignored
 * here to keep `--max-warnings 0` meaningful for the new code. Widen this scope
 * as directories are ported.
 *
 * `eslint-config-next` already registers the `react`, `react-hooks`, `jsx-a11y`,
 * `import`, and `@next/next` plugins. It applies the full react-hooks recommended
 * rules but only a partial jsx-a11y subset, so we layer the complete jsx-a11y
 * recommended ruleset on top (rules only — reusing the plugin instance already
 * registered by eslint-config-next to avoid a flat-config plugin redefinition)
 * and re-assert the react-hooks correctness rules.
 */
const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    // Legacy / non-app surfaces (ported or removed in later migration phases).
    "src/**",
    "server/**",
    "scripts/**",
    "docs/**",
    "public/**",
    "vite.config.ts",
    "tailwind.config.ts",
    "postcss.config.js",
  ]),
  ...nextVitals,
  ...nextTs,
  {
    name: "baba-flats/jsx-a11y-recommended",
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  {
    name: "baba-flats/react-hooks",
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);

export default eslintConfig;
