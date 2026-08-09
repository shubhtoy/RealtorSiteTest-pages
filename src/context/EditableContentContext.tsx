"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { appEnv } from "@/config/env";
import {
  coerceEditableSiteDocument,
  exportDraftAsJson,
  publishDraftDocument,
  readDraftDocument,
  readPublishedDocument,
  resetAllEditableContent,
  resetDraftToPublished,
  writeDraftDocument,
} from "@/lib/editable-content-store";
import type { EditableSiteDocument } from "@/types/editable-content";

type EditableMode = "published" | "preview";

type PublishStatus = "idle" | "publishing" | "success" | "error";

/**
 * Extract a human-readable error message from a failed API JSON response,
 * falling back to the HTTP status when the body isn't the expected shape.
 */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string; errors?: string[] };
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.join("; ");
    }
    if (typeof data.message === "string" && data.message.length > 0) {
      return data.message;
    }
  } catch {
    // Response body wasn't JSON — fall through to the status code.
  }
  return `HTTP ${response.status}`;
}

type EditableContentContextValue = {
  mode: EditableMode;
  setMode: (mode: EditableMode) => void;
  published: EditableSiteDocument;
  draft: EditableSiteDocument;
  current: EditableSiteDocument;
  updateDraft: (next: EditableSiteDocument) => void;
  publish: () => void;
  publishToServer: () => Promise<{ ok: boolean; error?: string }>;
  publishStatus: PublishStatus;
  revertDraft: () => void;
  resetAll: () => void;
  exportDraftJson: () => string;
};

const EditableContentContext = createContext<EditableContentContextValue | null>(null);

type Props = {
  children: React.ReactNode;
  /**
   * Server-authoritative content used to seed both published and draft state.
   * When provided (e.g. from the Next.js server layout) the provider renders
   * identically on the server and on the client's first paint: it does not read
   * localStorage for the initial state and skips the client content.json fetch,
   * so hydration matches. When omitted, the existing localStorage/draft behavior
   * is preserved exactly (Studio).
   */
  initialContent?: EditableSiteDocument;
};

export function EditableContentProvider({ children, initialContent }: Props) {
  const [mode, setMode] = useState<EditableMode>("published");
  const [published, setPublished] = useState<EditableSiteDocument>(
    () => initialContent ?? readPublishedDocument(),
  );
  const [draft, setDraft] = useState<EditableSiteDocument>(
    () => initialContent ?? readDraftDocument(),
  );
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("idle");

  // On mount, load the published content.json served from the app root.
  // Skipped when seeded with server-authoritative content so the server and the
  // client's first render are identical (no hydration mismatch).
  useEffect(() => {
    if (initialContent) return;

    // Next.js serves static assets from the root, so content.json lives at /.
    const url = "/content.json";
    fetch(url, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        const { document } = coerceEditableSiteDocument(data);
        if (document) {
          // Only hydrate if localStorage doesn't already have a newer version
          const localPublished = readPublishedDocument();
          const localTime = new Date(localPublished.updatedAt).getTime();
          const remoteTime = new Date(document.updatedAt).getTime();
          if (remoteTime > localTime || isNaN(localTime)) {
            publishDraftDocument(document);
            setPublished(document);
            setDraft(readDraftDocument());
          }
        }
      })
      .catch(() => {
        // content.json not available yet — use localStorage/defaults
      });
  }, [initialContent]);

  const value = useMemo<EditableContentContextValue>(
    () => ({
      mode,
      setMode,
      published,
      draft,
      current: mode === "preview" ? draft : published,
      updateDraft: (next) => {
        setDraft(next);
        writeDraftDocument(next);
      },
      publish: () => {
        publishDraftDocument(draft);
        setPublished(draft);
      },
      publishToServer: async () => {
        setPublishStatus("publishing");
        // Immediate in-memory feedback so the canvas reflects the publish at once.
        publishDraftDocument(draft);
        setPublished(draft);

        const headers = {
          "Content-Type": "application/json",
          "x-studio-password": appEnv.studioPassword,
        };

        try {
          // (a) Persist the current draft to the server. The publish step below
          // (a) Best-effort: persist the draft server-side for local dev. On a
          // serverless host this disk write does not survive to the publish
          // request, so a failure here is non-fatal — publish carries the
          // document itself below.
          try {
            await fetch(`${appEnv.apiOrigin}/api/content/draft`, {
              method: "PUT",
              headers,
              body: JSON.stringify({ document: draft }),
            });
          } catch {
            // Ignore — the publish request below is self-contained.
          }

          // (b) Self-contained publish: send the full document so it does not
          // depend on cross-request draft state. The server commits it to
          // GitHub (prod) or writes disk (local) and revalidates public pages.
          const publishRes = await fetch(`${appEnv.apiOrigin}/api/content/publish`, {
            method: "POST",
            headers,
            body: JSON.stringify({ document: draft }),
          });
          if (!publishRes.ok) {
            setPublishStatus("error");
            return { ok: false, error: await readErrorMessage(publishRes) };
          }

          setPublishStatus("success");
          setTimeout(() => setPublishStatus("idle"), 3000);
          return { ok: true };
        } catch (e) {
          setPublishStatus("error");
          return { ok: false, error: e instanceof Error ? e.message : "Network error" };
        }
      },
      publishStatus,
      revertDraft: () => {
        resetDraftToPublished();
        const next = readDraftDocument();
        setDraft(next);
      },
      resetAll: () => {
        resetAllEditableContent();
        const nextPublished = readPublishedDocument();
        const nextDraft = readDraftDocument();
        setPublished(nextPublished);
        setDraft(nextDraft);
      },
      exportDraftJson: () => exportDraftAsJson(),
    }),
    [draft, mode, published, publishStatus],
  );

  return <EditableContentContext.Provider value={value}>{children}</EditableContentContext.Provider>;
}

export function useEditableContent() {
  const context = useContext(EditableContentContext);
  if (!context) {
    throw new Error("useEditableContent must be used within EditableContentProvider");
  }
  return context;
}
