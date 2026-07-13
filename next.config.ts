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
};

export default nextConfig;
