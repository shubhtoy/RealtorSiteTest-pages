import { useState, type ChangeEvent, type ReactElement } from "react";
import { resolveAppHref } from "@/lib/utils";
import { appEnv } from "@/config/env";

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

// The theme stores colors as HSL triplets ("H S% L%", consumed as
// `hsl(var(--token))`). A native <input type="color"> works in hex, so we
// convert between the two to offer a real picker while keeping the stored format.
function hslTripletToHex(triplet: string): string {
  const match = triplet.trim().match(/^(-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!match) return "#000000";
  const h = ((parseFloat(match[1]) % 360) + 360) % 360;
  const s = Math.min(1, Math.max(0, parseFloat(match[2]) / 100));
  const l = Math.min(1, Math.max(0, parseFloat(match[3]) / 100));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHslTriplet(hex: string): string {
  const match = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!match) return "0 0% 0%";
  const r = parseInt(match[1], 16) / 255;
  const g = parseInt(match[2], 16) / 255;
  const b = parseInt(match[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function colorField(label: string) {
  return {
    type: "custom" as const,
    label,
    render: ({ value, onChange }: CustomFieldRenderer): ReactElement => {
      const raw = value || "";
      return (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="color"
            value={hslTripletToHex(raw)}
            onChange={(event) => onChange(hexToHslTriplet(event.target.value))}
            aria-label={`${label} picker`}
            style={{
              width: 40,
              height: 34,
              padding: 0,
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              background: "none",
              cursor: "pointer",
              flexShrink: 0,
            }}
          />
          <input
            className={inputCls}
            value={raw}
            onChange={(event) => onChange(event.target.value)}
            placeholder="H S% L%"
          />
        </div>
      );
    },
  };
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
      const [dragIndex, setDragIndex] = useState<number | null>(null);

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

      /** Move an item from one index to another (used by drag-and-drop). */
      const reorder = (from: number, to: number) => {
        if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
        const next = [...items];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        commit(next);
        setExpandedIndex(to);
      };

      /** Insert a copy of an item directly after it. */
      const duplicate = (index: number) => {
        const next = [...items];
        next.splice(index + 1, 0, { ...items[index] });
        commit(next);
        setExpandedIndex(index + 1);
      };

      const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        setIsUploading(true);
        try {
          const form = new FormData();
          files.forEach((file) => form.append("files", file));
          const res = await fetch(`${appEnv.apiOrigin}/api/assets/upload`, {
            method: "POST",
            headers: { "x-studio-password": appEnv.studioPassword },
            body: form,
          });
          const json = (await res.json().catch(() => ({}))) as {
            ok?: boolean;
            message?: string;
            files?: Array<{ url: string }>;
          };
          if (!res.ok || !json.ok) {
            alert(json.message || "Upload failed");
            return;
          }
          const newItems: GalleryItem[] = (json.files ?? []).map(({ url }) => {
            const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
            const baseLabel =
              (url.split("/").pop() ?? "").replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") || "New item";
            return { src: url, alt: baseLabel, label: baseLabel, category: categories[0] || "", type: (isVideo ? "video" : "image") as "image" | "video", subcategory: "" };
          });
          if (newItems.length) {
            commit([...items, ...newItems]);
            setExpandedIndex(items.length);
          }
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
            {items.length === 0 && (
              <div style={{ border: "1px dashed #cbd5e1", borderRadius: 8, padding: 16, textAlign: "center", color: "#64748b", fontSize: 12 }}>
                No media yet. Use <strong>Upload Files</strong> to add images or videos, or add an item and paste a URL.
              </div>
            )}
            {items.map((item, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <div
                  key={`${item.src}-${index}`}
                  draggable
                  onDragStart={(e) => {
                    setDragIndex(index);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIndex !== null) reorder(dragIndex, index);
                    setDragIndex(null);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  style={{
                    border: dragIndex === index ? "1px solid #38bdf8" : "1px solid #e2e8f0",
                    borderRadius: 8,
                    overflow: "hidden",
                    opacity: dragIndex === index ? 0.5 : 1,
                  }}
                >
                  {/* Collapsed row */}
                  <div
                    style={{ display: "grid", gridTemplateColumns: "16px 48px 1fr auto", gap: 8, padding: 6, alignItems: "center", cursor: "pointer", background: isExpanded ? "#f0f9ff" : "white" }}
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  >
                    <span title="Drag to reorder" style={{ cursor: "grab", color: "#94a3b8", fontSize: 14, lineHeight: 1, userSelect: "none" }}>⠿</span>
                    <div style={{ width: 48, height: 36, borderRadius: 4, overflow: "hidden", background: "#f1f5f9", position: "relative" }}>
                      {item.type === "video" ? (
                        item.poster ? (
                          <img src={resolveAppHref(item.poster)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : item.src ? (
                          <video src={resolveAppHref(item.src)} muted preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎬</div>
                        )
                      ) : item.src ? (
                        <img src={resolveAppHref(item.src)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#94a3b8" }}>🖼️</div>
                      )}
                      {item.type === "video" && (
                        <span style={{ position: "absolute", right: 2, bottom: 2, fontSize: 9, background: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: 3, padding: "0 3px" }}>▶</span>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label || "Untitled"}</p>
                      <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>{item.category}{item.subcategory ? ` › ${item.subcategory}` : ""} • {item.type}</p>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button type="button" className={btnAdd} onClick={(e) => { e.stopPropagation(); move(index, -1); }} disabled={index === 0}>↑</button>
                      <button type="button" className={btnAdd} onClick={(e) => { e.stopPropagation(); move(index, 1); }} disabled={index === items.length - 1}>↓</button>
                      <button type="button" className={btnAdd} title="Duplicate" onClick={(e) => { e.stopPropagation(); duplicate(index); }}>⧉</button>
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
                      {item.src && (
                        <div>
                          <span className={miniLabel}>Preview</span>
                          <div style={{ borderRadius: 6, overflow: "hidden", background: "#0f172a", maxHeight: 180, display: "flex", justifyContent: "center" }}>
                            {item.type === "video" ? (
                              <video src={resolveAppHref(item.src)} poster={item.poster ? resolveAppHref(item.poster) : undefined} controls muted preload="metadata" style={{ maxHeight: 180, maxWidth: "100%" }} />
                            ) : (
                              <img src={resolveAppHref(item.src)} alt={item.alt || ""} style={{ maxHeight: 180, maxWidth: "100%", objectFit: "contain" }} />
                            )}
                          </div>
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
