import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Standalone Vitest config. The `@` alias was previously inherited from
// vite.config.ts (removed during the Next.js cutover); tests resolve it here.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
});
