import "server-only";

import { NextResponse } from "next/server";

import { ContentValidationError, getDraft, setDraft } from "@/lib/content/store.server";
import { requireStudioAuth } from "@/lib/studio-auth.server";

// node:fs access requires the Node.js runtime (not Edge).
export const runtime = "nodejs";
// Draft reads/writes must always hit disk, never a cached response.
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(request: Request) {
  const unauthorized = requireStudioAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const draft = await getDraft();
    if (!draft) {
      return NextResponse.json({ ok: false, message: "Draft not initialized" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data: draft });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Failed to read draft" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const unauthorized = requireStudioAuth(request);
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Malformed JSON in request body" },
      { status: 400 },
    );
  }

  // The Studio client sends `{ document: <EditableSiteDocument> }`.
  const record = isRecord(body) ? body : {};
  if (!isRecord(record.document)) {
    return NextResponse.json(
      { ok: false, message: "document object is required" },
      { status: 400 },
    );
  }

  try {
    const saved = await setDraft(record.document);
    return NextResponse.json({ ok: true, data: saved });
  } catch (error) {
    if (error instanceof ContentValidationError) {
      return NextResponse.json(
        { ok: false, message: "Invalid content document", errors: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Failed to save draft" },
      { status: 500 },
    );
  }
}
