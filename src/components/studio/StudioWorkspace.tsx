"use client";

import { Puck } from "@puckeditor/core";
import { LivePreview } from "./LivePreview";

type StudioPage = "global" | "home" | "gallery" | "contact";

/**
 * Studio editor workspace, rendered as a child of <Puck> (compositional /
 * headless layout). The left rail hosts Puck's native section outline + field
 * panel (Puck remains the field/data engine); the right shows the real page as
 * a live, click-to-edit preview. Because this is plain composition (not Puck's
 * drag canvas), clicks in the preview are ordinary DOM events.
 */
export function StudioWorkspace({ page }: { page: StudioPage }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="flex max-h-[calc(100vh-9rem)] min-h-[28rem] flex-col overflow-y-auto border-b border-border bg-background md:border-b-0 md:border-r">
        <div className="border-b border-border px-3 py-2.5">
          <p className="mb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Sections
          </p>
          <Puck.Outline />
        </div>
        <div className="flex-1 px-3 py-2.5">
          <p className="mb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Fields
          </p>
          <Puck.Fields />
        </div>
      </aside>

      <div className="max-h-[calc(100vh-9rem)] overflow-y-auto bg-muted/20 p-3">
        <div className="mx-auto max-w-[1200px] overflow-hidden rounded-lg border border-border bg-background shadow-soft">
          <LivePreview page={page} />
        </div>
      </div>
    </div>
  );
}
