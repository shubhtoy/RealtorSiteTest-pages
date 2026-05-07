import { createContext, useContext, useEffect, useMemo, useState } from "react";
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
import { GitHubCms } from "@/lib/github-cms";
import type { EditableSiteDocument } from "@/types/editable-content";

type EditableMode = "published" | "preview";

type GitPublishStatus = "idle" | "publishing" | "success" | "error";

type EditableContentContextValue = {
  mode: EditableMode;
  setMode: (mode: EditableMode) => void;
  published: EditableSiteDocument;
  draft: EditableSiteDocument;
  current: EditableSiteDocument;
  updateDraft: (next: EditableSiteDocument) => void;
  publish: () => void;
  publishToGitHub: () => Promise<{ ok: boolean; error?: string }>;
  gitPublishStatus: GitPublishStatus;
  revertDraft: () => void;
  resetAll: () => void;
  exportDraftJson: () => string;
};

const EditableContentContext = createContext<EditableContentContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export function EditableContentProvider({ children }: Props) {
  const [mode, setMode] = useState<EditableMode>("published");
  const [published, setPublished] = useState<EditableSiteDocument>(() => readPublishedDocument());
  const [draft, setDraft] = useState<EditableSiteDocument>(() => readDraftDocument());
  const [gitPublishStatus, setGitPublishStatus] = useState<GitPublishStatus>("idle");

  // On mount, try to load content.json from the static build or GitHub
  useEffect(() => {
    const base = import.meta.env.BASE_URL || "/";
    const url = `${base}content.json`;
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
  }, []);

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
      publishToGitHub: async () => {
        setGitPublishStatus("publishing");
        // First persist locally
        publishDraftDocument(draft);
        setPublished(draft);

        // Then push to GitHub
        const result = await GitHubCms.publish(draft);
        setGitPublishStatus(result.ok ? "success" : "error");
        if (result.ok) {
          setTimeout(() => setGitPublishStatus("idle"), 3000);
        }
        return result;
      },
      gitPublishStatus,
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
    [draft, mode, published, gitPublishStatus],
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
