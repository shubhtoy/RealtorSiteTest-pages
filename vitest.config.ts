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
      // The server-only/client-only marker packages throw when imported outside
      // their intended bundle; under Node-based tests they resolve to a no-op.
      "server-only": path.resolve(dirname, "./src/test/empty-module.ts"),
      "client-only": path.resolve(dirname, "./src/test/empty-module.ts"),
    },
  },
});
