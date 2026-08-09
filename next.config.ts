import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// Absolute path to this project. Used to pin Turbopack's workspace root so that
// an unrelated lockfile higher up the filesystem (e.g. in the home directory)
// does not cause Next to infer the wrong root for file tracing.
const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Emit a self-contained production server at .next/standalone/server.js for a
  // slim container image (Docker / self-host). On Vercel this is unnecessary
  // (Vercel builds Next natively), so we skip it there to avoid any friction.
  output: process.env.VERCEL ? undefined : "standalone",
  turbopack: {
    root: projectRoot,
  },
  images: {
    // Serve modern formats via the built-in optimizer for local /public images.
    // AVIF first (smaller), WebP fallback. Local images use the default loader.
    formats: ["image/avif", "image/webp"],
    // Uploaded media is committed to the repo and served from GitHub's raw CDN
    // (portable across hosts). Allow next/image to load from that host.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
    ],
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
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
