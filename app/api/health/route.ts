import { NextResponse } from "next/server";

// Health checks must reflect live process state, never a cached response.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true, service: "baba-flats" });
}
