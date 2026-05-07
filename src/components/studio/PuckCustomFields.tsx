import { useState, type ChangeEvent, type ReactElement } from "react";
import { resolveAppHref } from "@/lib/utils";

const miniLabel = "mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500";
const inputCls = "w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm";
const btnAdd = "rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100";

type CustomFieldRenderer = {
  value: string;
  onChange: (v: string) => void;
  field: Record<string, unknown>;
  name: string;
  id: string;
};

type ObjectFieldSchema = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "number" | "select";
  options?: string[];
};

type GalleryItem = {
  src: string;
  alt: string;
  label: string;
  category: string;
  subcategory?: string;
  type: "image" | "video";
  poster?: string;
};

const defaultGalleryCategories = ["Exterior", "Interiors", "Amenities", "Floor Plans"];

function safeParse<T>(value: string, fallback: T): T {
  try {
    const parsed = JSON.parse(value);
    return parsed as T;
  } catch {
    return fallback;
  }
}

function commitJson<T>(onChange: (v: string) => void, next: T) {
  onChange(JSON.stringify(next, null, 2));
}

export function stringListField(label: string) {
  return {
    type: "custom" as const,
    label,
    render: ({ value, onChange }: CustomFieldRenderer): ReactElement => {
      const list = Array.isArray(safeParse<unknown>(value, []))
        ? safeParse<unknown[]>(value, []).map((item) => String(item ?? ""))
        : [];

      const commit = (next: string[]) => commitJson(onChange, next);
      const update = (index: number, nextValue: string) => {
        const next = [...list];
        next[index] = nextValue;
        commit(next);
      };

      return (
        <div style={{ display: "grid", gap: 8 }}>
          {list.map((item, index) => (
            <div key={`${item}-${index}`} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 6 }}>
              <input className={inputCls} value={item} onChange={(event) => update(index, event.target.value)} />
              <button type="button" className={btnAdd} onClick={() => commit(list.filter((_, i) => i !== index))}>Remove</button>
              <button type="button" className={btnAdd} disabled={index === 0} onClick={() => {
                const next = [...list];
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                commit(next);
              }}>Up</button>
              <button type="button" className={btnAdd} disabled={index === list.length - 1} onClick={() => {
                const next = [...list];
                [next[index + 1], next[index]] = [next[index], next[index + 1]];
                commit(next);
              }}>Down</button>
            </div>
          ))}
          <button type="button" className={btnAdd} onClick={() => commit([...list, "New item"])}>+ Add {label}</button>
        </div>
      );
    },
  };
}

export function keyValueField(label: string) {
  return {
    type: "custom" as const,
    label,
    render: ({ value, onChange }: CustomFieldRenderer): ReactElement => {
      const record = safeParse<Record<string, string>>(value, {});
      const entries = Object.entries(record);

      const commit = (nextEntries: Array<[string, string]>) => {
        const next: Record<string, string> = {};
        nextEntries.forEach(([key, val]) => {
          const trimmed = key.trim();
          if (!trimmed) return;
          next[trimmed] = val;
        });
        commitJson(onChange, next);
      };

      return (
        <div style={{ display: "grid", gap: 8 }}>
          {entries.map(([key, val], index) => (
            <div key={`${key}-${index}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 6 }}>
              <input
                className={inputCls}
                placeholder="key"
                value={key}
                onChange={(event) => {
                  const next = [...entries];
                  next[index] = [event.target.value, val];
                  commit(next);
                }}
              />
              <input
                className={inputCls}
                placeholder="value"
                value={val}
                onChange={(event) => {
                  const next = [...entries];
                  next[index] = [key, event.target.value];
                  commit(next);
                }}
              />
              <button type="button" className={btnAdd} onClick={() => commit(entries.filter((_, i) => i !== index))}>Remove</button>
            </div>
          ))}
          <button type="button" className={btnAdd} onClick={() => commit([...entries, ["new_key", ""]])}>+ Add Pair</button>
        </div>
      );
    },
  };
}

export function objectListField(
  label: string,
  schema: ObjectFieldSchema[],
  createDefaultItem?: () => Record<string, unknown>,
) {
  return {
    type: "custom" as const,
    label,
    render: ({ value, onChange }: CustomFieldRenderer): ReactElement => {
      const list = Array.isArray(safeParse<unknown>(value, [])) ? (safeParse<Record<string, unknown>[]>(value, []) as Record<string, unknown>[]) : [];

      const makeItem = () => {
        if (createDefaultItem) {
          return createDefaultItem();
        }

        const base: Record<string, string> = {};
        schema.forEach((field) => {
          if (field.type === "number") {
            base[field.key] = "0";
          } else if (field.type === "select") {
            base[field.key] = field.options?.[0] ?? "";
          } else {
            base[field.key] = "";
          }
        });
        return base;
      };

      const commit = (next: Record<string, unknown>[]) => commitJson(onChange, next);

      return (
        <div style={{ display: "grid", gap: 10 }}>
          {list.map((item, index) => (
            <div key={`item-${index}`} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 8, display: "grid", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={miniLabel} style={{ marginBottom: 0 }}>Item {index + 1}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" className={btnAdd} disabled={index === 0} onClick={() => {
                    const next = [...list];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    commit(next);
                  }}>Up</button>
                  <button type="button" className={btnAdd} disabled={index === list.length - 1} onClick={() => {
                    const next = [...list];
                    [next[index + 1], next[index]] = [next[index], next[index + 1]];
                    commit(next);
                  }}>Down</button>
                  <button type="button" className={btnAdd} onClick={() => commit(list.filter((_, i) => i !== index))}>Remove</button>
                </div>
              </div>

              {schema.map((field) => (
                <div key={field.key}>
                  <span className={miniLabel}>{field.label}</span>
                  {field.type === "textarea" ? (
                    <textarea
                      className={inputCls}
                      placeholder={field.placeholder || ""}
                      rows={3}
                      value={String(item?.[field.key] ?? "")}
                      onChange={(event) => {
                        const next = [...list];
                        next[index] = { ...(next[index] || {}), [field.key]: event.target.value };
                        commit(next);
                      }}
                    />
                  ) : field.type === "select" ? (
                    <select
                      className={inputCls}
                      value={String(item?.[field.key] ?? field.options?.[0] ?? "")}
                      onChange={(event) => {
                        const next = [...list];
                        next[index] = { ...(next[index] || {}), [field.key]: event.target.value };
                        commit(next);
                      }}
                    >
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      className={inputCls}
                      placeholder={field.placeholder || ""}
                      value={String(item?.[field.key] ?? "")}
                      onChange={(event) => {
                        const next = [...list];
                        const raw = event.target.value;
                        const val = field.type === "number" ? (raw === "" ? 0 : Number(raw)) : raw;
                        next[index] = { ...(next[index] || {}), [field.key]: val };
                        commit(next);
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}

          <button type="button" className={btnAdd} onClick={() => commit([...list, makeItem()])}>+ Add {label}</button>
        </div>
      );
    },
  };
}

export function navLinksField(label: string) {
  return objectListField(label, [
    { key: "to", label: "Path", placeholder: "/contact" },
    { key: "label", label: "Label", placeholder: "Contact" },
  ]);
}

export function visibilityField(label: string) {
  return {
    type: "custom" as const,
    label,
    render: ({ value, onChange }: CustomFieldRenderer): ReactElement => {
      const record = safeParse<Record<string, boolean>>(value, {});
      const entries = Object.entries(record);

      const commit = (next: Record<string, boolean>) => commitJson(onChange, next);

      return (
        <div style={{ display: "grid", gap: 8 }}>
          {entries.map(([key, enabled]) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155" }}>
              <input
                type="checkbox"
                checked={Boolean(enabled)}
                onChange={(event) => commit({ ...record, [key]: event.target.checked })}
              />
              {key}
            </label>
          ))}
          {entries.length === 0 ? <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>No visibility keys available.</p> : null}
        </div>
      );
    },
  };
}
export function galleryManagerField(label: string, categoriesJson?: string) {
  return {
    type: "custom" as const,
    label,
    render: ({ value, onChange }: CustomFieldRenderer): ReactElement => {
      const items: GalleryItem[] = safeParse(value, []);
      const categories: string[] = categoriesJson
        ? safeParse<Array<{ name: string }>>(categoriesJson, []).map((c) => c.name)
        : defaultGalleryCategories;

      const commit = (next: GalleryItem[]) => commitJson(onChange, next);
      const [isUploading, setIsUploading] = useState(false);
      const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

      const add = (type: "image" | "video") => {
        const next = [...items, { src: "", alt: "", label: "New item", category: categories[0] || "", type, subcategory: "" }];
        commit(next);
        setExpandedIndex(next.length - 1);
      };

      const remove = (index: number) => {
        commit(items.filter((_, i) => i !== index));
        setExpandedIndex(null);
      };

      const update = (index: number, patch: Partial<GalleryItem>) => {
        const next = [...items];
        next[index] = { ...next[index], ...patch };
        commit(next);
      };

      const move = (from: number, dir: -1 | 1) => {
        const to = from + dir;
        if (to < 0 || to >= items.length) return;
        const next = [...items];
        [next[from], next[to]] = [next[to], next[from]];
        commit(next);
        setExpandedIndex(to);
      };

      const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        setIsUploading(true);
        try {
          const { GitHubCms } = await import("@/lib/github-cms");
          if (!GitHubCms.hasToken()) {
            alert("Configure GitHub token in Settings first");
            return;
          }
          const results = await GitHubCms.uploadFiles(files);
          const newItems: GalleryItem[] = results
            .filter((r) => r.ok && r.url)
            .map((r) => {
              const isVideo = /\.(mp4|webm|ogg)$/i.test(r.url!);
              const baseLabel = r.originalName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
              return { src: r.url!, alt: baseLabel, label: baseLabel, category: categories[0] || "", type: (isVideo ? "video" : "image") as "image" | "video", subcategory: "" };
            });
          if (newItems.length) {
            commit([...items, ...newItems]);
            setExpandedIndex(items.length);
          }
          const failed = results.filter((r) => !r.ok);
          if (failed.length) alert(`${failed.length} file(s) failed: ${failed[0].error}`);
        } catch (e) {
          alert(e instanceof Error ? e.message : "Upload failed");
        } finally {
          setIsUploading(false);
          event.target.value = "";
        }
      };

      return (
        <div style={{ display: "grid", gap: 8 }}>
          {/* Actions bar */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <label className={btnAdd} style={{ cursor: isUploading ? "wait" : "pointer" }}>
              {isUploading ? "Uploading…" : "📁 Upload Files"}
              <input type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={handleUpload} disabled={isUploading} />
            </label>
            <button type="button" className={btnAdd} onClick={() => add("image")}>+ Image</button>
            <button type="button" className={btnAdd} onClick={() => add("video")}>+ Video</button>
            <span style={{ fontSize: 11, color: "#64748b" }}>{items.length} items</span>
          </div>

          {/* Items list */}
          <div style={{ display: "grid", gap: 6, maxHeight: 500, overflow: "auto" }}>
            {items.map((item, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <div key={`${item.src}-${index}`} style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                  {/* Collapsed row */}
                  <div
                    style={{ display: "grid", gridTemplateColumns: "48px 1fr auto", gap: 8, padding: 6, alignItems: "center", cursor: "pointer", background: isExpanded ? "#f0f9ff" : "white" }}
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  >
                    <div style={{ width: 48, height: 36, borderRadius: 4, overflow: "hidden", background: "#f1f5f9" }}>
                      {item.type === "video" ? (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎬</div>
                      ) : item.src ? (
                        <img src={resolveAppHref(item.src)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : null}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label || "Untitled"}</p>
                      <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>{item.category}{item.subcategory ? ` › ${item.subcategory}` : ""} • {item.type}</p>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button type="button" className={btnAdd} onClick={(e) => { e.stopPropagation(); move(index, -1); }} disabled={index === 0}>↑</button>
                      <button type="button" className={btnAdd} onClick={(e) => { e.stopPropagation(); move(index, 1); }} disabled={index === items.length - 1}>↓</button>
                      <button type="button" className={btnAdd} onClick={(e) => { e.stopPropagation(); remove(index); }}>✕</button>
                    </div>
                  </div>

                  {/* Expanded editor */}
                  {isExpanded && (
                    <div style={{ padding: "8px 10px", borderTop: "1px solid #e2e8f0", display: "grid", gap: 6, background: "#fafbfc" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        <div>
                          <span className={miniLabel}>Label</span>
                          <input className={inputCls} value={item.label} onChange={(e) => update(index, { label: e.target.value })} />
                        </div>
                        <div>
                          <span className={miniLabel}>Alt Text</span>
                          <input className={inputCls} value={item.alt} onChange={(e) => update(index, { alt: e.target.value })} />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                        <div>
                          <span className={miniLabel}>Category</span>
                          <select className={inputCls} value={item.category} onChange={(e) => update(index, { category: e.target.value, subcategory: "" })}>
                            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <span className={miniLabel}>Subcategory</span>
                          <input className={inputCls} value={item.subcategory || ""} onChange={(e) => update(index, { subcategory: e.target.value })} placeholder="Optional" />
                        </div>
                        <div>
                          <span className={miniLabel}>Type</span>
                          <select className={inputCls} value={item.type} onChange={(e) => update(index, { type: e.target.value as "image" | "video" })}>
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <span className={miniLabel}>Source URL</span>
                        <input className={inputCls} value={item.src} onChange={(e) => update(index, { src: e.target.value })} placeholder="/uploads/file.jpg or /images/file.jpg" />
                      </div>
                      {item.type === "video" && (
                        <div>
                          <span className={miniLabel}>Poster (thumbnail)</span>
                          <input className={inputCls} value={item.poster || ""} onChange={(e) => update(index, { poster: e.target.value })} placeholder="/uploads/thumb.jpg" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    },
  };
}
