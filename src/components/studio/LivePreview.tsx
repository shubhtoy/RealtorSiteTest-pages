"use client";

import { useCallback, type MouseEvent } from "react";
import { useGetPuck } from "@puckeditor/core";
import HomePage from "@/pages/HomePage";
import GalleryPage from "@/pages/GalleryPage";
import ContactPage from "@/pages/ContactPage";

type StudioPage = "global" | "home" | "gallery" | "contact";

// Fallback Puck component (type) to select when a clicked area isn't tagged with
// a more specific data-studio-section. Maps a page to its main content panel.
const FALLBACK_SECTION: Record<StudioPage, string> = {
  home: "HomeCollections",
  gallery: "GalleryCollections",
  contact: "ContactFormMeta",
  global: "GlobalBrand",
};

/**
 * Live preview for the Studio canvas.
 *
 * Renders the ACTUAL public page for the section being edited, driven by the
 * same draft the editor writes to, so edits appear immediately. It is rendered
 * as a plain child of <Puck> (compositional layout, not Puck's canvas), so
 * clicks here are ordinary DOM clicks: clicking a region selects the matching
 * Puck component so its fields open in the panel — click-to-edit on the real
 * site.
 */
export function LivePreview({ page }: { page: StudioPage }) {
  const getPuck = useGetPuck();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      const tagged = target?.closest<HTMLElement>("[data-studio-section]");
      const type = tagged?.dataset.studioSection ?? FALLBACK_SECTION[page];
      if (!type) return;

      const puck = getPuck() as unknown as {
        appState?: { data?: { content?: Array<{ type?: string; props?: { id?: string } }> } };
        getSelectorForId?: (id: string) => { index: number; zone?: string } | undefined;
        dispatch: (action: { type: "setUi"; ui: { itemSelector: { index: number; zone?: string } } }) => void;
      };

      const content = puck.appState?.data?.content ?? [];
      const index = content.findIndex((entry) => entry?.type === type);
      if (index < 0) return;

      const id = content[index]?.props?.id;
      const selector = (id && puck.getSelectorForId?.(id)) || { index };
      puck.dispatch({ type: "setUi", ui: { itemSelector: selector } });
    },
    [getPuck, page],
  );

  return (
    <div className="studio-preview" onClickCapture={handleClick}>
      {page === "gallery" ? <GalleryPage /> : page === "contact" ? <ContactPage /> : <HomePage />}
    </div>
  );
}
