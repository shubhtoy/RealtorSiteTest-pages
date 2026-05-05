import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { execSync } from "child_process";

function optimizeMediaPlugin() {
  return {
    name: "optimize-media",
    buildStart() {
      try {
        execSync("node scripts/optimize-media.mjs --images --uploads", { stdio: "inherit" });
      } catch {
        console.warn("[optimize-media] Optimization skipped or failed — build continues.");
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiOrigin = env.VITE_API_ORIGIN || "http://localhost:8787";
  const basePath = env.VITE_BASE_PATH || "/";

  return {
    base: basePath,
    plugins: [react(), optimizeMediaPlugin()],
    server: {
      proxy: {
        "/api": {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
