import { useEffect, useMemo, useState, type ChangeEvent, type ReactElement } from "react";
import PhotoAlbum from "react-photo-album";
import { STUDIO_PASSWORD } from "@/config/studio-auth";
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
  category: "Exterior" | "Interiors" | "Amenities" | "Floor Plans";
};

const galleryCategories: Array<GalleryItem["category"]> = ["Exterior", "Interiors", "Amenities", "Floor Plans"];

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
                        next[index] = { ...(next[index] || {}), [field.key]: event.target.value };
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

export function galleryManagerField(label: string) {
  return {
    type: "custom" as const,
    label,
    render: ({ value, onChange }: CustomFieldRenderer): ReactElement => (
      <GalleryManagerRenderer value={value} onChange={onChange} label={label} />
    ),
  };
}

function GalleryManagerRenderer({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  let items = safeParse<GalleryItem[]>(value, []);
  if (!Array.isArray(items)) items = [];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSet, setSelectedSet] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState<"All" | GalleryItem["category"]>("All");
  const [batchCategory, setBatchCategory] = useState<GalleryItem["category"]>("Interiors");
  const [draftItem, setDraftItem] = useState<GalleryItem | null>(items[0] ? { ...items[0] } : null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const commit = (next: GalleryItem[]) => commitJson(onChange, next);

  useEffect(() => {
    if (items.length === 0) {
      setSelectedIndex(0);
      setSelectedSet([]);
      setDraftItem(null);
      return;
    }

    if (selectedIndex >= items.length) {
      setSelectedIndex(items.length - 1);
      return;
    }

    setDraftItem({ ...items[selectedIndex] });
  }, [items.length, selectedIndex, value]);

  const selectedItem = items[selectedIndex] ?? null;
  const isDirty = Boolean(selectedItem && draftItem && JSON.stringify(selectedItem) !== JSON.stringify(draftItem));

  const visibleIndices = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        if (filterCategory !== "All" && item.category !== filterCategory) return false;
        if (!query) return true;
        return [item.label, item.alt, item.src, item.category].some((part) =>
          String(part || "").toLowerCase().includes(query),
        );
      })
      .map((entry) => entry.index);
  }, [filterCategory, items, searchText]);

  const selectedVisibleCount = selectedSet.filter((index) => visibleIndices.includes(index)).length;

  const add = () => {
    const next = [
      ...items,
      {
        src: "/images/",
        alt: "New gallery image",
        label: "New item",
        category: "Interiors" as GalleryItem["category"],
      },
    ];
    commit(next);
    setSelectedIndex(next.length - 1);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [picked] = next.splice(from, 1);
    next.splice(to, 0, picked);
    commit(next);
    setSelectedIndex(to);
    setSelectedSet([]);
  };

  const duplicate = (index: number) => {
    const picked = items[index];
    if (!picked) return;
    const next = [...items];
    next.splice(index + 1, 0, { ...picked, label: `${picked.label || "Item"} Copy` });
    commit(next);
    setSelectedIndex(index + 1);
  };

  const removeOne = (index: number) => {
    if (items.length <= 1) return;
    const next = [...items];
    next.splice(index, 1);
    commit(next);
    setSelectedSet([]);
    setSelectedIndex(Math.max(0, Math.min(index, next.length - 1)));
  };

  const normalizePaths = () => {
    const next = items.map((item) => {
      const src = String(item.src || "").trim();
      if (!src) return item;
      if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return item;
      return { ...item, src: `/${src.replace(/^\.\//, "")}` };
    });
    commit(next);
  };

  const autofillAlt = () => {
    const next = items.map((item) => ({
      ...item,
      alt: String(item.alt || "").trim() || String(item.label || "Gallery image").trim() || "Gallery image",
    }));
    commit(next);
  };

  const cleanupEmpty = () => {
    const next = items.filter((item) => String(item.src || "").trim() || String(item.label || "").trim());
    if (next.length > 0) commit(next);
  };

  const dedupeBySrc = () => {
    const seen = new Set<string>();
    const next = items.filter((item) => {
      const src = String(item.src || "").trim();
      if (!src) return true;
      if (seen.has(src)) return false;
      seen.add(src);
      return true;
    });
    commit(next);
  };

  const sortByCategory = () => {
    const next = [...items].sort((a, b) => galleryCategories.indexOf(a.category) - galleryCategories.indexOf(b.category));
    commit(next);
    setSelectedSet([]);
    setSelectedIndex(0);
  };

  const toggleSelected = (index: number) => {
    setSelectedSet((prev) => (prev.includes(index) ? prev.filter((v) => v !== index) : [...prev, index]));
  };

  const clearSelected = () => setSelectedSet([]);

  const applyBatchCategory = () => {
    if (selectedSet.length === 0) return;
    const next = items.map((item, index) => (selectedSet.includes(index) ? { ...item, category: batchCategory } : item));
    commit(next);
  };

  const applyBatchAutofillAlt = () => {
    if (selectedSet.length === 0) return;
    const next = items.map((item, index) => {
      if (!selectedSet.includes(index)) return item;
      return {
        ...item,
        alt: String(item.alt || "").trim() || String(item.label || "Gallery image").trim() || "Gallery image",
      };
    });
    commit(next);
  };

  const removeSelected = () => {
    if (selectedSet.length === 0 || items.length <= 1) return;
    const shouldProceed = window.confirm(`Remove ${selectedSet.length} selected item(s)?`);
    if (!shouldProceed) return;

    const toRemove = new Set(selectedSet);
    const next = items.filter((_, index) => !toRemove.has(index));
    if (next.length === 0) return;
    commit(next);
    setSelectedSet([]);
    setSelectedIndex(0);
  };

  const uploadFiles = async (files: FileList | File[]): Promise<Array<{ url: string; originalName: string }>> => {
    const fileArray = Array.from(files || []);
    if (fileArray.length === 0) return [];

    const formData = new FormData();
    fileArray.forEach((file) => formData.append("files", file));

    const response = await fetch("/api/assets/upload", {
      method: "POST",
      headers: {
        "x-studio-password": STUDIO_PASSWORD,
      },
      body: formData,
    });

    const result = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      files?: Array<{ url?: string; originalName?: string }>;
      message?: string;
    };

    if (!response.ok || result.ok === false) {
      throw new Error(result.message || "Upload failed");
    }

    return (result.files || [])
      .filter((item): item is { url: string; originalName: string } => Boolean(item?.url))
      .map((item) => ({
        url: item.url,
        originalName: item.originalName || "Uploaded image",
      }));
  };

  const uploadAndAdd = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const uploaded = await uploadFiles(event.target.files || []);
      if (uploaded.length === 0) return;

      const next = [
        ...items,
        ...uploaded.map((item) => {
          const baseLabel = item.originalName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
          return {
            src: item.url,
            alt: baseLabel || "Gallery image",
            label: baseLabel || "New item",
            category: "Interiors" as GalleryItem["category"],
          };
        }),
      ];
      commit(next);
      setSelectedIndex(next.length - 1);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const replaceSelectedImage = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!selectedItem) return;
    try {
      setIsUploading(true);
      const uploaded = await uploadFiles(event.target.files || []);
      const first = uploaded[0];
      if (!first) return;

      const baseLabel = first.originalName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
      const next = [...items];
      next[selectedIndex] = {
        ...next[selectedIndex],
        src: first.url,
        label: next[selectedIndex].label || baseLabel,
        alt: next[selectedIndex].alt || baseLabel,
      };
      commit(next);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const previewPhotos = items
    .filter((item) => item?.src)
    .map((item, index) => ({
      src: item.src,
      width: 4,
      height: 3,
      alt: item.alt || item.label || `Gallery ${index + 1}`,
      key: `${item.src}-${index}`,
    }));

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <label className={btnAdd} style={{ cursor: isUploading ? "wait" : "pointer" }}>
          {isUploading ? "Uploading..." : "Upload & Add Images"}
          <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={uploadAndAdd} disabled={isUploading} />
        </label>
        <button type="button" className={btnAdd} onClick={add}>+ Add Empty {label}</button>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button type="button" className={btnAdd} onClick={normalizePaths}>Normalize Paths</button>
        <button type="button" className={btnAdd} onClick={autofillAlt}>Auto-fill Alt</button>
        <button type="button" className={btnAdd} onClick={cleanupEmpty}>Remove Empty</button>
        <button type="button" className={btnAdd} onClick={dedupeBySrc}>De-duplicate</button>
        <button type="button" className={btnAdd} onClick={sortByCategory}>Sort Categories</button>
      </div>

      {previewPhotos.length > 0 ? (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 8 }}>
          <PhotoAlbum layout="rows" photos={previewPhotos} spacing={6} targetRowHeight={72} />
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          className={inputCls}
          style={{ maxWidth: 240 }}
          placeholder="Search label, alt, src"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        <select
          className={inputCls}
          style={{ maxWidth: 180 }}
          value={filterCategory}
          onChange={(event) => setFilterCategory(event.target.value as "All" | GalleryItem["category"])}
        >
          <option value="All">All Categories</option>
          {galleryCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {selectedSet.length > 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", border: "1px dashed #cbd5e1", borderRadius: 8, padding: 8 }}>
          <span className={miniLabel} style={{ margin: 0 }}>{selectedVisibleCount} selected</span>
          <select
            className={inputCls}
            style={{ maxWidth: 170 }}
            value={batchCategory}
            onChange={(event) => setBatchCategory(event.target.value as GalleryItem["category"])}
          >
            {galleryCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button type="button" className={btnAdd} onClick={applyBatchCategory}>Set Category</button>
          <button type="button" className={btnAdd} onClick={applyBatchAutofillAlt}>Auto-fill Alt</button>
          <button type="button" className={btnAdd} onClick={removeSelected}>Remove Selected</button>
          <button type="button" className={btnAdd} onClick={clearSelected}>Clear</button>
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr)", gap: 10 }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, display: "grid", gap: 8, maxHeight: 560, overflow: "auto" }}>
          {visibleIndices.length === 0 ? (
            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>No gallery items match current filters.</p>
          ) : null}

          {visibleIndices.map((index) => {
            const item = items[index];
            const isActive = selectedIndex === index;
            const isPicked = selectedSet.includes(index);

            return (
              <div
                key={`${item.src}-${index}`}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragIndex === null) return;
                  move(dragIndex, index);
                  setDragIndex(null);
                }}
                style={{
                  border: `1px solid ${isActive ? "#3b82f6" : "#e5e7eb"}`,
                  borderRadius: 8,
                  padding: 8,
                  display: "grid",
                  gap: 6,
                  background: isActive ? "#eff6ff" : "white",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#475569" }}>
                    <input type="checkbox" checked={isPicked} onChange={() => toggleSelected(index)} />
                    Select
                  </label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button type="button" className={btnAdd} onClick={() => duplicate(index)}>Duplicate</button>
                    <button type="button" className={btnAdd} onClick={() => removeOne(index)} disabled={items.length <= 1}>Remove</button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  style={{ border: "none", background: "transparent", textAlign: "left", padding: 0, cursor: "pointer" }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 8 }}>
                    <div style={{ width: 88, height: 64, borderRadius: 6, overflow: "hidden", border: "1px solid #e5e7eb", background: "#f8fafc" }}>
                      {item.src ? (
                        <img src={resolveAppHref(item.src)} alt={item.alt || item.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : null}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.label || "Untitled"}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>{item.category}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.src || "(no src)"}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10, display: "grid", gap: 8, alignContent: "start" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#334155" }}>
              Inspector {isDirty ? "*" : ""}
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className={btnAdd} onClick={() => setSelectedIndex((v) => Math.max(0, v - 1))} disabled={selectedIndex <= 0}>Prev</button>
              <button type="button" className={btnAdd} onClick={() => setSelectedIndex((v) => Math.min(items.length - 1, v + 1))} disabled={selectedIndex >= items.length - 1}>Next</button>
            </div>
          </div>

          {!selectedItem || !draftItem ? (
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Select an item to edit details.</p>
          ) : (
            <>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", background: "#f8fafc" }}>
                {draftItem.src ? (
                  <img src={resolveAppHref(draftItem.src)} alt={draftItem.alt || draftItem.label} style={{ width: "100%", height: 170, objectFit: "cover" }} />
                ) : (
                  <div style={{ height: 170 }} />
                )}
              </div>

              <label className={btnAdd} style={{ cursor: isUploading ? "wait" : "pointer" }}>
                {isUploading ? "Uploading..." : "Replace Image"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={replaceSelectedImage} disabled={isUploading} />
              </label>

              <div>
                <span className={miniLabel}>Label</span>
                <input className={inputCls} value={draftItem.label} onChange={(event) => setDraftItem({ ...draftItem, label: event.target.value })} />
              </div>

              <div>
                <span className={miniLabel}>Alt Text</span>
                <input className={inputCls} value={draftItem.alt} onChange={(event) => setDraftItem({ ...draftItem, alt: event.target.value })} />
              </div>

              <div>
                <span className={miniLabel}>Category</span>
                <select
                  className={inputCls}
                  value={draftItem.category}
                  onChange={(event) => setDraftItem({ ...draftItem, category: event.target.value as GalleryItem["category"] })}
                >
                  {galleryCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <span className={miniLabel}>Image Path</span>
                <input className={inputCls} value={draftItem.src} onChange={(event) => setDraftItem({ ...draftItem, src: event.target.value })} />
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  className={btnAdd}
                  onClick={() => {
                    const next = [...items];
                    next[selectedIndex] = { ...draftItem };
                    commit(next);
                  }}
                  disabled={!isDirty}
                >
                  Apply
                </button>
                <button type="button" className={btnAdd} onClick={() => setDraftItem({ ...selectedItem })} disabled={!isDirty}>Discard</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
