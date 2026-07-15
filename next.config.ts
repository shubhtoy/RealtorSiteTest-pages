import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// Absolute path to this project. Used to pin Turbopack's workspace root so that
// an unrelated lockfile higher up the filesystem (e.g. in the home directory)
// does not cause Next to infer the wrong root for file tracing.
const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    // Serve modern formats via the built-in optimizer for local /public images.
    // AVIF first (smaller), WebP fallback. Local images use the default loader.
    formats: ["image/avif", "image/webp"],
  },
  // Baseline security headers applied to every route (ported from the Express
  // server's global header middleware in server/index.mjs).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
