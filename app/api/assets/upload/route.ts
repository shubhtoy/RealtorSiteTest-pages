import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { requireStudioAuth } from "@/lib/studio-auth.server";

// Writing files with node:fs requires the Node.js runtime (not Edge).
export const runtime = "nodejs";
// Uploads mutate disk and must never be cached.
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12MB
const ALLOWED_MIME = /^(image|video)\//;
// Allowlist of safe, non-executable media extensions. SVG is deliberately
// excluded: it is an XML document that can carry inline <script>, so serving an
// uploaded .svg from our own origin (public/uploads) would be stored XSS.
const ALLOWED_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".avif",
  ".mp4",
  ".webm",
  ".mov",
  ".ogg",
]);
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Sanitize an untrusted upload filename into a safe `base` + `ext` pair. */
function sanitizeFilename(originalName: string): { base: string; ext: string } {
  const name = originalName || "upload";
  const rawExt = path.extname(name).toLowerCase();
  // Keep only a leading dot + alphanumerics (drops `..`, slashes, and the like).
  const ext = /^\.[a-z0-9]+$/.test(rawExt) ? rawExt : "";

  const base =
    path
      .basename(name, path.extname(name))
      .toLowerCase()
      .replace(/\.\./g, "") // strip path-traversal sequences
      .replace(/[/\\]/g, "-") // replace slashes
      .replace(/[^a-z0-9]+/g, "-") // collapse remaining non-alphanumerics
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "upload";

  return { base, ext };
}

export async function POST(request: Request) {
  const unauthorized = requireStudioAuth(request);
  if (unauthorized) return unauthorized;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid multipart form data" },
      { status: 400 },
    );
  }

  // Primary field is `files`; fall back to any file-typed entry for tolerance.
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) {
    for (const value of Array.from(formData.values())) {
      if (value instanceof File) files.push(value);
    }
  }
  if (files.length === 0) {
    return NextResponse.json({ ok: false, message: "No files provided" }, { status: 400 });
  }

  // Validate every file up front so a bad file never leaves a partial batch.
  for (const file of files) {
    if (!ALLOWED_MIME.test(file.type)) {
      return NextResponse.json(
        { ok: false, message: `Unsupported file type: ${file.type || "unknown"}` },
        { status: 415 },
      );
    }
    const fileExt = path.extname(file.name || "").toLowerCase();
    if (!ALLOWED_EXT.has(fileExt)) {
      return NextResponse.json(
        { ok: false, message: `Unsupported file extension: ${fileExt || "none"}` },
        { status: 415 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ ok: false, message: "File too large" }, { status: 413 });
    }
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const written: { url: string }[] = [];
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const { base, ext } = sanitizeFilename(file.name);
    // The index keeps names unique within a single multi-file upload batch.
    const filename = `${base}-${Date.now()}-${index}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), bytes);
    written.push({ url: `/uploads/${filename}` });
  }

  return NextResponse.json({ ok: true, files: written });
}
