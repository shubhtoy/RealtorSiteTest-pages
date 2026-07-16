import "server-only";

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  ContentValidationError,
  DraftNotFoundError,
  publishDraft,
} from "@/lib/content/store.server";
import { requireStudioAuth } from "@/lib/studio-auth.server";

// node:fs access requires the Node.js runtime (not Edge).
export const runtime = "nodejs";
// Publishing mutates disk and must never be cached.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauthorized = requireStudioAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const published = await publishDraft();

    // Refresh the server-rendered public routes so the publish is live at once.
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
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Publish failed" },
      { status: 500 },
    );
  }
}
