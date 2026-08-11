"use client";

import dynamic from "next/dynamic";

import { EditableContentProvider } from "@/context/EditableContentContext";

// The Studio is a heavy, browser-only Puck editor. Load it client-side only
// (ssr: false) and let the provider manage its own draft/published state from
// localStorage + the client-side content.json fetch. It is intentionally NOT
// seeded with server-authoritative content (that seeding is for the public
// site); this preserves the Studio's existing draft workflow.
const StudioPage = dynamic(() => import("@/views/StudioPage"), { ssr: false });

export default function StudioClient() {
  return (
    <EditableContentProvider>
      <StudioPage />
    </EditableContentProvider>
  );
}
