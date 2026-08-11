import "server-only";

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  ContentValidationError,
  DraftNotFoundError,
  publishDocument,
  publishDraft,
} from "@/lib/content/store.server";
import { GitHubSyncError } from "@/lib/content/github-sync.server";
import { requireStudioAuth } from "@/lib/studio-auth.server";

// node:fs access requires the Node.js runtime (not Edge).
export const runtime = "nodejs";
// Publishing mutates disk and must never be cached.
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const unauthorized = requireStudioAuth(request);
  if (unauthorized) return unauthorized;

  // Prefer a document supplied in the request body (self-contained publish that
  // works on serverless). Fall back to the on-disk draft for local/back-compat.
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  try {
    const record = isRecord(body) ? body : {};
    const published = isRecord(record.document)
      ? await publishDocument(record.document)
      : await publishDraft();

    // Refresh the server-rendered public routes so a disk-mode publish is live
    // at once (in GitHub-sync mode the redeploy serves the new content).
    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/contact");

    return NextResponse.json({ ok: true, data: published });
  } catch (error) {
    if (error instanceof DraftNotFoundError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    }
    if (error instanceof ContentValidationError) {
      return NextResponse.json(
        { ok: false, message: "Draft failed validation", errors: error.errors },
        { status: 400 },
      );
    }
    if (error instanceof GitHubSyncError) {
      return NextResponse.json(
        { ok: false, message: `Publish to GitHub failed: ${error.message}` },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Publish failed" },
      { status: 500 },
    );
  }
}
