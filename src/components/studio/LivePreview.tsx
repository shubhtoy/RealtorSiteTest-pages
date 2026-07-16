"use client";

import HomePage from "@/pages/HomePage";
import GalleryPage from "@/pages/GalleryPage";
import ContactPage from "@/pages/ContactPage";

type StudioPage = "global" | "home" | "gallery" | "contact";

/**
 * Live preview for the Studio canvas.
 *
 * Renders the ACTUAL public page component for the section being edited, driven
 * by the same EditableContentProvider the editor writes to. In the Studio the
 * provider's `current` resolves to the draft (preview mode) or published (live
 * mode), so edits appear here immediately — this is the real site, not a
 * synthetic summary. The "global" tab has no page of its own, so it previews
 * the home page (where global brand/nav/footer changes are most visible).
 */
export function LivePreview({ page }: { page: StudioPage }) {
  if (page === "gallery") return <GalleryPage />;
  if (page === "contact") return <ContactPage />;
  return <HomePage />;
}
