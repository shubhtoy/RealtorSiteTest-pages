import { Puck, fieldsPlugin, outlinePlugin } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import { useEditableContent } from "@/context/EditableContentContext";
import {
  stringListField,
  navLinksField,
  visibilityField,
  objectListField,
  keyValueField,
  galleryManagerField,
} from "@/components/studio/PuckCustomFields";
import { AdminAuthService } from "@/lib/admin-auth";
import { GitHubCms } from "@/lib/github-cms";
import { STUDIO_PASSWORD, STUDIO_PASSWORD_ENV_HINT } from "@/config/studio-auth";
import { coerceEditableSiteDocument, validateEditableSiteDocument } from "@/lib/editable-content-store";
import { PuckDataService } from "@/lib/puck-data";
import { resolveAppHref } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreVerticalIcon,
  DownloadIcon,
  UploadIcon,
  CopyIcon,
  LockIcon,
  ExternalLinkIcon,
  Loader2Icon,
  AlertTriangleIcon,
  XIcon,
  RefreshCwIcon,
} from "lucide-react";

const ADMIN_AUTH_STORAGE_KEY = "baba.admin.studio.basic";

type PuckIncomingData = { content?: unknown };

/** Typed prop interfaces for Puck component render functions */
interface GlobalBrandProps {
  [key: string]: unknown;
  siteName?: string;
  cityLabel?: string;
  tagline?: string;
  description?: string;
  navCtaText?: string;
  navCtaLink?: string;
  phone?: string;
  email?: string;
  addressLine?: string;
  hoursLine?: string;
}

interface GlobalCollectionsProps {
  [key: string]: unknown;
  navLinksJson?: string;
  footerBadgesJson?: string;
  seoTitleSuffix?: string;
}

interface HomeHeroProps {
  [key: string]: unknown;
  tagline?: string;
  title?: string;
  highlightText?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

interface GalleryHeroProps {
  [key: string]: unknown;
  heroEyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroImage?: string;
}

interface GalleryCtaProps {
  [key: string]: unknown;
  ctaEyebrow?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  primaryText?: string;
  primaryLink?: string;
  secondaryText?: string;
  secondaryLink?: string;
}

interface ContactHeroProps {
  [key: string]: unknown;
  heroEyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroImage?: string;
  mapEmbedUrl?: string;
  officeHoursTitle?: string;
}

interface ContactFormMetaProps {
  [key: string]: unknown;
  tourFormTitle?: string;
  tourFormDescription?: string;
  submitText?: string;
}

interface HomeCollectionsProps {
  [key: string]: unknown;
  statsJson?: string;
  focusCardsJson?: string;
  floorPlansJson?: string;
  amenityPanelsJson?: string;
  whyCardsJson?: string;
  testimonialsJson?: string;
  faqJson?: string;
  neighborhoodHighlightsJson?: string;
}

interface HomeVisibilityProps {
  [key: string]: unknown;
  sectionVisibilityJson?: string;
}

interface HomeUiProps {
  [key: string]: unknown;
  homeUiJson?: string;
  mapEmbedUrl?: string;
}

interface GalleryCollectionsProps {
  [key: string]: unknown;
  galleryItemsJson?: string;
}

interface GalleryVisibilityProps {
  [key: string]: unknown;
  gallerySectionVisibilityJson?: string;
}

interface ContactCollectionsProps {
  [key: string]: unknown;
  officeHoursJson?: string;
  bedroomOptionsJson?: string;
  moveInOptionsJson?: string;
  tourTypeOptionsJson?: string;
}

interface ContactVisibilityProps {
  [key: string]: unknown;
  contactSectionVisibilityJson?: string;
}

interface ContactUiProps {
  [key: string]: unknown;
  contactUiJson?: string;
}

interface ContactIntegrationsProps {
  [key: string]: unknown;
  smtpJson?: string;
  submitHooksJson?: string;
}

export default function StudioPage() {
  const { draft, published, mode, setMode, updateDraft, publish, publishToGitHub, gitPublishStatus, revertDraft, exportDraftJson } = useEditableContent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorPage, setEditorPage] = useState<"global" | "home" | "gallery" | "contact">("home");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [puckReady, setPuckReady] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [revertDialogOpen, setRevertDialogOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [gitTokenDialogOpen, setGitTokenDialogOpen] = useState(false);
  const [gitTokenInput, setGitTokenInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    return STUDIO_PASSWORD.length > 0 && stored === AdminAuthService.buildToken(STUDIO_PASSWORD);
  });

  const hasUnpublishedChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(published),
    [draft, published],
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnpublishedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnpublishedChanges]);

  // Mark Puck as ready after a short delay (simulates initialization)
  useEffect(() => {
    if (!isUnlocked) return;
    setPuckReady(false);
    const timer = setTimeout(() => setPuckReady(true), 600);
    return () => clearTimeout(timer);
  }, [isUnlocked]);

  // Keyboard shortcuts: Ctrl+S to save draft, Ctrl+Shift+P to publish
  const handleSaveDraft = useCallback(() => {
    if (!isUnlocked) return;
    setAutosaveStatus("saving");
    updateDraft(draft);
    setAutosaveStatus("saved");
    setLastSavedAt(Date.now());
    toast.success("Draft saved");
  }, [isUnlocked, draft, updateDraft]);

  const handlePublishShortcut = useCallback(() => {
    if (!isUnlocked) return;
    setPublishDialogOpen(true);
  }, [isUnlocked]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && !e.shiftKey && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }
      if (mod && e.shiftKey && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
        handlePublishShortcut();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSaveDraft, handlePublishShortcut]);

  const config = useMemo(
    () => ({
      components: {
        GlobalBrand: {
          fields: {
            siteName: { type: "text", label: "Site Name" },
            cityLabel: { type: "text", label: "City Label" },
            tagline: { type: "text", label: "Tagline" },
            description: { type: "textarea", label: "Description" },
            navCtaText: { type: "text", label: "Nav CTA Text" },
            navCtaLink: { type: "text", label: "Nav CTA Link" },
            phone: { type: "text", label: "Phone" },
            email: { type: "text", label: "Email" },
            addressLine: { type: "text", label: "Address" },
            hoursLine: { type: "text", label: "Hours" },
          },
          render: (props: GlobalBrandProps) => (
            <section className="relative overflow-hidden rounded-2xl border border-border bg-panel-gradient p-5 shadow-soft md:p-6">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_70%)]" />
              <p className="relative z-10 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-accent">Global Brand</p>
              <h2 className="relative z-10 mt-2 font-display text-3xl leading-tight">{props?.siteName ?? "Site Name"}</h2>
              <p className="relative z-10 mt-1 text-sm text-muted-foreground">{props?.cityLabel ?? "City"} • {props?.tagline ?? "Tagline"}</p>
              <p className="relative z-10 mt-3 max-w-2xl text-sm text-muted-foreground">{props?.description ?? "Description"}</p>

              <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
                  {props?.navCtaText ?? "Primary CTA"}
                </span>
                <span className="rounded-full border border-border px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {props?.navCtaLink ?? "/contact"}
                </span>
              </div>

              <div className="relative z-10 mt-5 grid gap-2 md:grid-cols-3">
                <div className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs">
                  <p className="font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Phone</p>
                  <p className="mt-1 text-foreground">{props?.phone ?? "Phone"}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs">
                  <p className="font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Email</p>
                  <p className="mt-1 text-foreground">{props?.email ?? "Email"}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs">
                  <p className="font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Address</p>
                  <p className="mt-1 truncate text-foreground">{props?.addressLine ?? "Address"}</p>
                </div>
              </div>
            </section>
          ),
        },
        GlobalCollections: {
          fields: {
            navLinksJson: navLinksField("Nav Links"),
            footerBadgesJson: stringListField("Footer Badges"),
            seoTitleSuffix: { type: "text", label: "SEO Title Suffix" },
          },
          render: (props: GlobalCollectionsProps) => {
            const navLinks = PuckDataService.parseArray(props?.navLinksJson, [] as Array<{ to: string; label: string }>);
            const footerBadges = PuckDataService.parseArray(props?.footerBadgesJson, [] as string[]);
            return (
              <section className="rounded-xl border border-border bg-panel-gradient p-5 shadow-soft">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-accent">Global Collections</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {navLinks.map((link, idx) => (
                    <span key={`${link.label}-${idx}`} className="rounded-full border border-border px-3 py-1 text-xs">{link.label}</span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {footerBadges.map((badge, idx) => (
                    <span key={`${badge}-${idx}`} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{badge}</span>
                  ))}
                </div>
              </section>
            );
          },
        },
        HomeHero: {
          fields: {
            tagline: { type: "text", label: "Hero Tagline" },
            title: { type: "text", label: "Hero Title" },
            highlightText: { type: "text", label: "Highlight Text" },
            description: { type: "textarea", label: "Hero Description" },
            primaryCtaText: { type: "text", label: "Primary CTA Text" },
            primaryCtaLink: { type: "text", label: "Primary CTA Link" },
            secondaryCtaText: { type: "text", label: "Secondary CTA Text" },
            secondaryCtaLink: { type: "text", label: "Secondary CTA Link" },
          },
          render: (props: HomeHeroProps) => (
            <section className="relative overflow-hidden rounded-2xl border border-border bg-panel-gradient p-6 shadow-soft">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.16),transparent_72%)]" />
              <p className="relative z-10 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-accent">Home Hero</p>
              <p className="relative z-10 mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">{props?.tagline ?? "Tagline"}</p>
              <h2 className="relative z-10 mt-2 font-display text-3xl leading-tight md:text-4xl">
                {props?.title ?? "Hero Title"}
                <span className="block text-primary">{props?.highlightText ?? "Highlight Text"}</span>
              </h2>
              <p className="relative z-10 mt-3 max-w-3xl text-sm text-muted-foreground">{props?.description ?? "Hero description"}</p>
              <div className="relative z-10 mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground">{props?.primaryCtaText ?? "Primary"}</span>
                <span className="rounded-full border border-primary/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">{props?.secondaryCtaText ?? "Secondary"}</span>
              </div>
            </section>
          ),
        },
        GalleryHero: {
          fields: {
            heroEyebrow: { type: "text", label: "Gallery Eyebrow" },
            heroTitle: { type: "text", label: "Gallery Title" },
            heroDescription: { type: "textarea", label: "Gallery Description" },
            heroImage: { type: "text", label: "Gallery Hero Image" },
          },
          render: (props: GalleryHeroProps) => (
            <section className="relative overflow-hidden rounded-2xl border border-border shadow-soft">
              <div
                className="pointer-events-none absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${resolveAppHref(props?.heroImage ?? "/images/exterior.jpg")})` }}
              />
              <div className="pointer-events-none absolute inset-0 bg-hero-fade" />
              <div className="relative z-10 p-6 md:p-8">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-primary">Gallery Hero</p>
                <p className="mt-2 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-overlay-text/90">{props?.heroEyebrow ?? "Eyebrow"}</p>
                <h2 className="mt-2 font-display text-3xl leading-tight text-overlay-text md:text-4xl">{props?.heroTitle ?? "Gallery Title"}</h2>
                <p className="mt-3 max-w-2xl text-sm text-overlay-text/85">{props?.heroDescription ?? "Gallery description"}</p>
              </div>
            </section>
          ),
        },
        GalleryCta: {
          fields: {
            ctaEyebrow: { type: "text", label: "CTA Eyebrow" },
            ctaTitle: { type: "text", label: "CTA Title" },
            ctaDescription: { type: "textarea", label: "CTA Description" },
            primaryText: { type: "text", label: "Primary Button Text" },
            primaryLink: { type: "text", label: "Primary Button Link" },
            secondaryText: { type: "text", label: "Secondary Button Text" },
            secondaryLink: { type: "text", label: "Secondary Button Link" },
          },
          render: (props: GalleryCtaProps) => (
            <section className="rounded-2xl border border-border bg-panel-gradient p-6 shadow-soft">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-accent">Gallery CTA</p>
              <p className="mt-2 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{props?.ctaEyebrow ?? "Call to action"}</p>
              <h2 className="mt-2 font-display text-2xl leading-tight md:text-3xl">{props?.ctaTitle ?? "CTA Title"}</h2>
              <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{props?.ctaDescription ?? "CTA description"}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
                  {props?.primaryText ?? "Primary action"}
                </span>
                <span className="rounded-full border border-primary/40 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-primary">
                  {props?.secondaryText ?? "Secondary action"}
                </span>
              </div>
            </section>
          ),
        },
        ContactHero: {
          fields: {
            heroEyebrow: { type: "text", label: "Contact Eyebrow" },
            heroTitle: { type: "text", label: "Contact Title" },
            heroDescription: { type: "textarea", label: "Contact Description" },
            heroImage: { type: "text", label: "Contact Hero Image" },
            mapEmbedUrl: { type: "text", label: "Contact Map Embed URL" },
            officeHoursTitle: { type: "text", label: "Office Hours Title" },
          },
          render: (props: ContactHeroProps) => (
            <section className="relative overflow-hidden rounded-2xl border border-border shadow-soft">
              <div
                className="pointer-events-none absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${resolveAppHref(props?.heroImage ?? "/images/exterior.jpg")})` }}
              />
              <div className="pointer-events-none absolute inset-0 bg-hero-fade" />
              <div className="relative z-10 grid gap-4 p-6 md:grid-cols-[1fr_280px] md:items-end md:p-8">
                <div>
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-primary">{props?.heroEyebrow ?? "Contact & Leasing"}</p>
                  <h2 className="mt-2 font-display text-3xl leading-tight text-overlay-text md:text-4xl">{props?.heroTitle ?? "Book a Tour"}</h2>
                  <p className="mt-3 max-w-[560px] text-sm text-overlay-text/85">{props?.heroDescription ?? "Share your details and our team will reach out."}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-overlay-text px-3 py-1.5 font-semibold uppercase tracking-[0.12em] text-overlay-dark">{draft.contact.ui.callButtonPrefix} {draft.global.phone}</span>
                    <span className="rounded-full border border-overlay-text/35 px-3 py-1.5 font-semibold uppercase tracking-[0.12em] text-overlay-text">{draft.contact.ui.browseButtonText}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-overlay-text/15 bg-overlay-dark/35 p-4 backdrop-blur-xl">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-primary">Leasing Desk</p>
                  <h3 className="mt-1 font-display text-lg text-overlay-text">{props?.officeHoursTitle ?? "Office Hours"}</h3>
                  <ul className="mt-2 grid gap-1">
                    {draft.contact.officeHours.map((line) => (
                      <li key={line} className="rounded-full border border-overlay-text/20 bg-overlay-text/10 px-3 py-1 text-xs text-overlay-text/90">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ),
        },
        ContactFormMeta: {
          fields: {
            tourFormTitle: { type: "text", label: "Form Title" },
            tourFormDescription: { type: "textarea", label: "Form Description" },
            submitText: { type: "text", label: "Submit Button Text" },
          },
          render: (props: ContactFormMetaProps) => (
            <section className="grid gap-4 rounded-2xl border border-border bg-panel-gradient p-5 shadow-soft md:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-background/50 p-4">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-accent">{draft.contact.ui.formEyebrow}</p>
                <h3 className="mt-2 font-display text-2xl leading-tight">{props?.tourFormTitle ?? "Form Title"}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{props?.tourFormDescription ?? "Description"}</p>
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-foreground">
                  {draft.contact.ui.infoBullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  {draft.contact.ui.featureBadges.map((badge) => (
                    <span key={badge} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground">{badge}</span>
                  ))}
                </div>
              </div>

              <form className="pointer-events-none grid gap-3 rounded-xl border border-border/70 bg-background/60 p-4" onSubmit={(event) => event.preventDefault()}>
                <label className="grid gap-1">
                  <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-accent">{draft.contact.ui.labels.fullName}</span>
                  <input className="h-10 rounded-md border border-border bg-background px-3 text-sm" placeholder={draft.contact.ui.placeholders.fullName} />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="grid gap-1">
                    <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-accent">{draft.contact.ui.labels.email}</span>
                    <input className="h-10 rounded-md border border-border bg-background px-3 text-sm" placeholder={draft.contact.ui.placeholders.email} />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-accent">{draft.contact.ui.labels.phone}</span>
                    <input className="h-10 rounded-md border border-border bg-background px-3 text-sm" placeholder={draft.contact.ui.placeholders.phone} />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1">
                    <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-accent">{draft.contact.ui.labels.bedroomType}</span>
                    <div className="h-10 rounded-md border border-border bg-background px-3 text-sm leading-10 text-muted-foreground">{draft.contact.formOptions.bedroom[0] ?? "Option"}</div>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-accent">{draft.contact.ui.labels.moveIn}</span>
                    <div className="h-10 rounded-md border border-border bg-background px-3 text-sm leading-10 text-muted-foreground">{draft.contact.formOptions.moveIn[0] ?? "Option"}</div>
                  </div>
                </div>
                <label className="grid gap-1">
                  <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-accent">{draft.contact.ui.labels.tourPreference}</span>
                  <div className="h-10 rounded-md border border-border bg-background px-3 text-sm leading-10 text-muted-foreground">{draft.contact.formOptions.tourType[0] ?? "Option"}</div>
                </label>
                <label className="grid gap-1">
                  <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-accent">{draft.contact.ui.labels.message}</span>
                  <textarea rows={3} className="rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder={draft.contact.ui.placeholders.message} />
                </label>
                <button type="button" className="inline-flex w-max rounded-full bg-primary px-4 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-primary-foreground">{props?.submitText ?? "Submit"}</button>
              </form>
            </section>
          ),
        },
        HomeCollections: {
          fields: {
            statsJson: objectListField("Stat", [
              { key: "value", label: "Value", type: "number" },
              { key: "suffix", label: "Suffix", type: "text" },
              { key: "label", label: "Label", type: "text" },
            ], () => ({ value: 0, suffix: "+", label: "New Stat" })),
            focusCardsJson: objectListField("Focus Card", [
              { key: "title", label: "Title", type: "text" },
              { key: "src", label: "Image Path", type: "text" },
            ], () => ({ title: "New Card", src: "/images/" })),
            floorPlansJson: objectListField("Floor Plan", [
              { key: "title", label: "Title", type: "text" },
              { key: "bedrooms", label: "Bedrooms", type: "number" },
              { key: "bathrooms", label: "Bathrooms", type: "number" },
              { key: "sqft", label: "Sq Ft", type: "text" },
              { key: "description", label: "Description", type: "textarea" },
              { key: "image", label: "Image Path", type: "text" },
              { key: "priceRange", label: "Price Range", type: "text" },
            ], () => ({ title: "New Plan", bedrooms: 1, bathrooms: 1, sqft: "600", description: "", image: "/images/", features: [], priceRange: "Contact for pricing" })),
            amenityPanelsJson: objectListField("Amenity Panel", [
              { key: "title", label: "Title", type: "text" },
              { key: "description", label: "Description", type: "textarea" },
              { key: "image", label: "Image Path", type: "text" },
            ], () => ({ title: "New Amenity", description: "", image: "/images/" })),
            whyCardsJson: objectListField("Why Card", [
              { key: "title", label: "Title", type: "text" },
              { key: "description", label: "Description", type: "textarea" },
              { key: "tag", label: "Tag", type: "text" },
              { key: "icon", label: "Icon", type: "select", options: ["building", "paw", "car", "map", "shield", "sparkles"] },
            ], () => ({ title: "New Card", description: "", tag: "Tag", icon: "building" })),
            testimonialsJson: objectListField("Testimonial", [
              { key: "quote", label: "Quote", type: "textarea" },
              { key: "name", label: "Name", type: "text" },
              { key: "designation", label: "Designation", type: "text" },
            ], () => ({ quote: "", name: "Resident", designation: "" })),
            faqJson: objectListField("FAQ", [
              { key: "question", label: "Question", type: "text" },
              { key: "answer", label: "Answer", type: "textarea" },
              { key: "category", label: "Category", type: "text" },
            ], () => ({ question: "New question?", answer: "", category: "General" })),
            neighborhoodHighlightsJson: objectListField("Highlight", [
              { key: "title", label: "Title", type: "text" },
              { key: "description", label: "Description", type: "textarea" },
              { key: "distance", label: "Distance", type: "text" },
            ], () => ({ title: "New Highlight", description: "", distance: "Nearby" })),
          },
          render: (props: HomeCollectionsProps) => {
            const stats = PuckDataService.parseArray(props?.statsJson, [] as Array<{ value: number; suffix: string; label: string }>);
            const floorPlans = PuckDataService.parseArray(props?.floorPlansJson, [] as Array<{ title: string; sqft: string; image: string; priceRange: string }>);
            const amenities = PuckDataService.parseArray(props?.amenityPanelsJson, [] as Array<{ title: string; image: string }>);
            const testimonials = PuckDataService.parseArray(props?.testimonialsJson, [] as Array<{ quote: string; name: string }>);
            const faq = PuckDataService.parseArray(props?.faqJson, [] as Array<{ question: string; category: string }>);

            return (
              <section className="rounded-2xl border border-border bg-panel-gradient p-5 shadow-soft">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-accent">Home Collections</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-background/50 p-3">
                    <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">Stats ({stats.length})</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {stats.slice(0, 4).map((item, idx) => (
                        <div key={`${item.label}-${idx}`} className="rounded-lg border border-border/60 bg-background px-2 py-1.5 text-xs">
                          <p className="font-semibold text-foreground">{item.value}{item.suffix}</p>
                          <p className="truncate text-muted-foreground">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-background/50 p-3">
                    <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">Floor Plans ({floorPlans.length})</p>
                    <div className="mt-2 space-y-2">
                      {floorPlans.slice(0, 2).map((item, idx) => (
                        <div key={`${item.title}-${idx}`} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2">
                          <div className="h-10 w-14 overflow-hidden rounded bg-secondary">
                            {item.image ? <img src={resolveAppHref(item.image)} alt={item.title} className="h-full w-full object-cover" /> : null}
                          </div>
                          <div className="min-w-0 flex-1 text-xs">
                            <p className="truncate font-semibold text-foreground">{item.title}</p>
                            <p className="truncate text-muted-foreground">{item.sqft} • {item.priceRange}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-border/70 bg-background/50 p-3 text-xs">
                    <p className="font-extrabold uppercase tracking-[0.14em] text-muted-foreground">Amenities</p>
                    <p className="mt-1 text-foreground">{amenities.length} panels configured</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/50 p-3 text-xs">
                    <p className="font-extrabold uppercase tracking-[0.14em] text-muted-foreground">Testimonials</p>
                    <p className="mt-1 text-foreground">{testimonials.length} entries configured</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/50 p-3 text-xs">
                    <p className="font-extrabold uppercase tracking-[0.14em] text-muted-foreground">FAQ</p>
                    <p className="mt-1 text-foreground">{faq.length} entries configured</p>
                  </div>
                </div>
              </section>
            );
          },
        },
        HomeVisibility: {
          fields: {
            sectionVisibilityJson: visibilityField("Home Section Visibility"),
          },
          render: (props: HomeVisibilityProps) => {
            const visibility = PuckDataService.parseObject(props?.sectionVisibilityJson, {} as Record<string, boolean>);
            return (
              <section className="rounded-xl border border-border bg-panel-gradient p-5 shadow-soft">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-accent">Home Visibility</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(visibility).map(([key, enabled]) => (
                    <span
                      key={key}
                      className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] ${
                        enabled ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </section>
            );
          },
        },
        HomeUi: {
          fields: {
            homeUiJson: keyValueField("Home UI Copy"),
            mapEmbedUrl: { type: "text", label: "Home Map Embed URL" },
          },
          render: (props: HomeUiProps) => {
            const homeUi = PuckDataService.parseObject(props?.homeUiJson, {} as Record<string, string>);
            const entries = Object.entries(homeUi).slice(0, 6);
            return (
              <section className="rounded-xl border border-border bg-panel-gradient p-5 shadow-soft">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-accent">Home UI Copy</p>
                <div className="mt-2 rounded-lg border border-border/70 bg-background/60 px-3 py-2">
                  <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Map Embed URL</p>
                  <p className="mt-1 truncate text-xs text-foreground">{String(props?.mapEmbedUrl ?? "") || "(not set)"}</p>
                </div>
                <div className="mt-3 grid gap-2">
                  {entries.map(([key, value]) => (
                    <div key={key} className="rounded-lg border border-border/70 bg-background/60 px-3 py-2">
                      <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{key}</p>
                      <p className="mt-1 truncate text-xs text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          },
        },
        GalleryCollections: {
          fields: {
            galleryItemsJson: galleryManagerField("Gallery Item"),
          },
          render: (props: GalleryCollectionsProps) => {
            const items = PuckDataService.parseArray(props?.galleryItemsJson, [] as Array<{ src: string; alt: string; label: string; category: string }>);
            const categoryCounts = items.reduce<Record<string, number>>((acc, item) => {
              acc[item.category] = (acc[item.category] ?? 0) + 1;
              return acc;
            }, {});
            return (
              <section className="rounded-xl border border-border bg-panel-gradient p-5 shadow-soft">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-accent">Gallery Items ({items.length})</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(categoryCounts).map(([category, count]) => (
                    <span key={category} className="rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      {category} {count}
                    </span>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                  {items.slice(0, 6).map((item, idx) => (
                    <div key={`${item.label}-${idx}`} className="overflow-hidden rounded-lg border border-border/70 bg-background/50">
                      <div className="h-20 bg-secondary">
                        {item.src ? <img src={resolveAppHref(item.src)} alt={item.alt || item.label} className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="p-2">
                        <p className="truncate text-xs font-semibold text-foreground">{item.label}</p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          },
        },
        GalleryVisibility: {
          fields: {
            gallerySectionVisibilityJson: visibilityField("Gallery Section Visibility"),
          },
          render: (props: GalleryVisibilityProps) => {
            const visibility = PuckDataService.parseObject(props?.gallerySectionVisibilityJson, {} as Record<string, boolean>);
            return (
              <section className="rounded-xl border border-border bg-panel-gradient p-5 shadow-soft">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-accent">Gallery Visibility</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(visibility).map(([key, enabled]) => (
                    <span
                      key={key}
                      className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] ${
                        enabled ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </section>
            );
          },
        },
        ContactCollections: {
          fields: {
            officeHoursJson: stringListField("Office Hours"),
            bedroomOptionsJson: stringListField("Bedroom Options"),
            moveInOptionsJson: stringListField("Move-In Options"),
            tourTypeOptionsJson: stringListField("Tour Type Options"),
          },
          render: (props: ContactCollectionsProps) => {
            const officeHours = PuckDataService.parseArray(props?.officeHoursJson, [] as string[]);
            const bedroom = PuckDataService.parseArray(props?.bedroomOptionsJson, [] as string[]);
            const moveIn = PuckDataService.parseArray(props?.moveInOptionsJson, [] as string[]);
            const tourType = PuckDataService.parseArray(props?.tourTypeOptionsJson, [] as string[]);

            const renderPills = (title: string, items: string[]) => (
              <div className="rounded-xl border border-border/70 bg-background/60 p-3">
                <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{title} ({items.length})</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {items.slice(0, 6).map((item, idx) => (
                    <span key={`${item}-${idx}`} className="rounded-full bg-secondary px-2.5 py-1 text-[10px] text-secondary-foreground">{item}</span>
                  ))}
                </div>
              </div>
            );

            return (
              <section className="rounded-xl border border-border bg-panel-gradient p-5 shadow-soft">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-accent">Contact Collections</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {renderPills("Office Hours", officeHours)}
                  {renderPills("Bedroom Options", bedroom)}
                  {renderPills("Move-In Options", moveIn)}
                  {renderPills("Tour Type Options", tourType)}
                </div>
              </section>
            );
          },
        },
        ContactVisibility: {
          fields: {
            contactSectionVisibilityJson: visibilityField("Contact Section Visibility"),
          },
          render: (props: ContactVisibilityProps) => {
            const visibility = PuckDataService.parseObject(props?.contactSectionVisibilityJson, {} as Record<string, boolean>);
            return (
              <section className="rounded-xl border border-border bg-panel-gradient p-5 shadow-soft">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-accent">Contact Visibility</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(visibility).map(([key, enabled]) => (
                    <span
                      key={key}
                      className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] ${
                        enabled ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </section>
            );
          },
        },
        ContactUi: {
          fields: {
            contactUiJson: keyValueField("Contact UI Copy"),
          },
          render: (props: ContactUiProps) => {
            const contactUi = PuckDataService.parseObject(props?.contactUiJson, {} as Record<string, unknown>);
            const labels = contactUi.labels && typeof contactUi.labels === "object" ? (contactUi.labels as Record<string, string>) : {};
            const placeholders =
              contactUi.placeholders && typeof contactUi.placeholders === "object"
                ? (contactUi.placeholders as Record<string, string>)
                : {};

            return (
              <section className="rounded-xl border border-border bg-panel-gradient p-5 shadow-soft">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-accent">Contact UI Copy</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-background/60 p-3">
                    <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Labels</p>
                    <div className="mt-2 space-y-1">
                      {Object.entries(labels).slice(0, 5).map(([k, v]) => (
                        <p key={k} className="text-xs text-foreground"><span className="font-semibold">{k}:</span> {v}</p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/60 p-3">
                    <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Placeholders</p>
                    <div className="mt-2 space-y-1">
                      {Object.entries(placeholders).slice(0, 5).map(([k, v]) => (
                        <p key={k} className="text-xs text-foreground"><span className="font-semibold">{k}:</span> {v}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );
          },
        },
        ContactIntegrations: {
          fields: {
            smtpJson: keyValueField("SMTP Setup"),
            submitHooksJson: objectListField("Submit Hook", [
              { key: "name", label: "Name", type: "text" },
              { key: "url", label: "URL", type: "text" },
              { key: "method", label: "Method", type: "select", options: ["POST", "PUT", "PATCH"] },
              { key: "enabled", label: "Enabled", type: "select", options: ["true", "false"] },
              { key: "sendFormData", label: "Send Form Data", type: "select", options: ["true", "false"] },
              { key: "headersJson", label: "Headers JSON", type: "textarea" },
            ], () => ({
              name: "New Hook",
              url: "",
              method: "POST",
              enabled: "false",
              sendFormData: "true",
              headersJson: "{}",
            })),
          },
          render: (props: ContactIntegrationsProps) => {
            const smtp = PuckDataService.parseObject(props?.smtpJson, {} as Record<string, unknown>);
            const hooks = PuckDataService.parseArray(props?.submitHooksJson, [] as Array<Record<string, unknown>>);
            const enabledHooks = hooks.filter((hook) => String(hook.enabled) === "true");

            return (
              <section className="rounded-xl border border-border bg-panel-gradient p-5 shadow-soft">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-accent">Contact Integrations</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-background/60 p-3">
                    <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">SMTP</p>
                    <p className="mt-1 text-xs text-foreground">Enabled: {String(smtp.enabled ?? false)}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">Endpoint: {String(smtp.endpoint ?? "") || "(not set)"}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">To: {String(smtp.toEmail ?? "") || "(not set)"}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/60 p-3">
                    <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Submit Hooks</p>
                    <p className="mt-1 text-xs text-foreground">Configured: {hooks.length}</p>
                    <p className="mt-1 text-xs text-foreground">Enabled: {enabledHooks.length}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {enabledHooks.slice(0, 3).map((hook, idx) => (
                        <span key={`${String(hook.name)}-${idx}`} className="rounded-full bg-secondary px-2.5 py-1 text-[10px] text-secondary-foreground">
                          {String(hook.name || "Hook")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );
          },
        },
      },
    }),
    [draft],
  );

  const data = useMemo(
    () => {
      const allContent = [
        {
          type: "GlobalBrand",
          props: {
            id: "global-brand",
            siteName: draft.global.siteName,
            cityLabel: draft.global.cityLabel,
            tagline: draft.global.tagline,
            description: draft.global.description,
            navCtaText: draft.global.navCtaText,
            navCtaLink: draft.global.navCtaLink,
            phone: draft.global.phone,
            email: draft.global.email,
            addressLine: draft.global.addressLine,
            hoursLine: draft.global.hoursLine,
          },
        },
        {
          type: "HomeHero",
          props: {
            id: "home-hero",
            tagline: draft.home.hero.tagline,
            title: draft.home.hero.title,
            highlightText: draft.home.hero.highlightText,
            description: draft.home.hero.description,
            primaryCtaText: draft.home.hero.primaryCta.text,
            primaryCtaLink: draft.home.hero.primaryCta.link,
            secondaryCtaText: draft.home.hero.secondaryCta.text,
            secondaryCtaLink: draft.home.hero.secondaryCta.link,
          },
        },
        {
          type: "GlobalCollections",
          props: {
            id: "global-collections",
            navLinksJson: JSON.stringify(draft.global.navLinks, null, 2),
            footerBadgesJson: JSON.stringify(draft.global.footerBadges, null, 2),
            seoTitleSuffix: draft.global.seoTitleSuffix,
          },
        },
        {
          type: "GalleryHero",
          props: {
            id: "gallery-hero",
            heroEyebrow: draft.gallery.heroEyebrow,
            heroTitle: draft.gallery.heroTitle,
            heroDescription: draft.gallery.heroDescription,
            heroImage: draft.gallery.heroImage,
          },
        },
        {
          type: "GalleryCta",
          props: {
            id: "gallery-cta",
            ctaEyebrow: draft.gallery.cta.eyebrow,
            ctaTitle: draft.gallery.cta.title,
            ctaDescription: draft.gallery.cta.description,
            primaryText: draft.gallery.cta.primary.text,
            primaryLink: draft.gallery.cta.primary.link,
            secondaryText: draft.gallery.cta.secondary.text,
            secondaryLink: draft.gallery.cta.secondary.link,
          },
        },
        {
          type: "ContactHero",
          props: {
            id: "contact-hero",
            heroEyebrow: draft.contact.heroEyebrow,
            heroTitle: draft.contact.heroTitle,
            heroDescription: draft.contact.heroDescription,
            heroImage: draft.contact.heroImage,
            mapEmbedUrl: draft.contact.mapEmbedUrl,
            officeHoursTitle: draft.contact.officeHoursTitle,
          },
        },
        {
          type: "ContactFormMeta",
          props: {
            id: "contact-form-meta",
            tourFormTitle: draft.contact.tourFormTitle,
            tourFormDescription: draft.contact.tourFormDescription,
            submitText: draft.contact.submitText,
          },
        },
        {
          type: "HomeCollections",
          props: {
            id: "home-collections",
            statsJson: JSON.stringify(draft.home.stats, null, 2),
            focusCardsJson: JSON.stringify(draft.home.focusCards, null, 2),
            floorPlansJson: JSON.stringify(draft.home.floorPlans, null, 2),
            amenityPanelsJson: JSON.stringify(draft.home.amenityPanels, null, 2),
            whyCardsJson: JSON.stringify(draft.home.whyCards, null, 2),
            testimonialsJson: JSON.stringify(draft.home.testimonials, null, 2),
            faqJson: JSON.stringify(draft.home.faq, null, 2),
            neighborhoodHighlightsJson: JSON.stringify(draft.home.neighborhood.highlights, null, 2),
          },
        },
        {
          type: "HomeVisibility",
          props: {
            id: "home-visibility",
            sectionVisibilityJson: JSON.stringify(draft.home.sectionVisibility, null, 2),
          },
        },
        {
          type: "HomeUi",
          props: {
            id: "home-ui",
            homeUiJson: JSON.stringify(draft.home.ui, null, 2),
            mapEmbedUrl: draft.contact.mapEmbedUrl,
          },
        },
        {
          type: "GalleryCollections",
          props: {
            id: "gallery-collections",
            galleryItemsJson: JSON.stringify(draft.gallery.items, null, 2),
          },
        },
        {
          type: "GalleryVisibility",
          props: {
            id: "gallery-visibility",
            gallerySectionVisibilityJson: JSON.stringify(draft.gallery.sectionVisibility, null, 2),
          },
        },
        {
          type: "ContactCollections",
          props: {
            id: "contact-collections",
            officeHoursJson: JSON.stringify(draft.contact.officeHours, null, 2),
            bedroomOptionsJson: JSON.stringify(draft.contact.formOptions.bedroom, null, 2),
            moveInOptionsJson: JSON.stringify(draft.contact.formOptions.moveIn, null, 2),
            tourTypeOptionsJson: JSON.stringify(draft.contact.formOptions.tourType, null, 2),
          },
        },
        {
          type: "ContactVisibility",
          props: {
            id: "contact-visibility",
            contactSectionVisibilityJson: JSON.stringify(draft.contact.sectionVisibility, null, 2),
          },
        },
        {
          type: "ContactUi",
          props: {
            id: "contact-ui",
            contactUiJson: JSON.stringify(draft.contact.ui, null, 2),
          },
        },
        {
          type: "ContactIntegrations",
          props: {
            id: "contact-integrations",
            smtpJson: JSON.stringify(draft.contact.integrations.smtp, null, 2),
            submitHooksJson: JSON.stringify(draft.contact.integrations.submitHooks, null, 2),
          },
        },
      ];

      const sectionTypeMap: Record<typeof editorPage, string[]> = {
        global: ["GlobalBrand", "GlobalCollections"],
        home: ["GlobalBrand", "GlobalCollections", "HomeHero", "HomeCollections", "HomeVisibility", "HomeUi"],
        gallery: ["GlobalBrand", "GlobalCollections", "GalleryHero", "GalleryCollections", "GalleryVisibility", "GalleryCta"],
        contact: ["GlobalBrand", "GlobalCollections", "ContactHero", "ContactCollections", "ContactVisibility", "ContactFormMeta", "ContactUi", "ContactIntegrations"],
      };

      const allowed = new Set(sectionTypeMap[editorPage]);

      return {
        content: allContent.filter((item) => allowed.has(String(item.type))),
        root: { props: {} },
      };
    },
    [draft, editorPage],
  );

  const puckCanvasKey = `${editorPage}-${mode}`;
  const plugins = useMemo(() => [outlinePlugin(), fieldsPlugin({ desktopSideBar: "right" })], []);

  const applyPuckData = (nextData: PuckIncomingData, errorPrefix: string) => {
    const globalEntry = PuckDataService.getEntryProps<GlobalBrandProps>(nextData, "GlobalBrand");
    const heroEntry = PuckDataService.getEntryProps<HomeHeroProps>(nextData, "HomeHero");
    const globalCollectionsEntry = PuckDataService.getEntryProps<GlobalCollectionsProps>(nextData, "GlobalCollections");
    const galleryHeroEntry = PuckDataService.getEntryProps<GalleryHeroProps>(nextData, "GalleryHero");
    const galleryCtaEntry = PuckDataService.getEntryProps<GalleryCtaProps>(nextData, "GalleryCta");
    const contactHeroEntry = PuckDataService.getEntryProps<ContactHeroProps>(nextData, "ContactHero");
    const contactFormEntry = PuckDataService.getEntryProps<ContactFormMetaProps>(nextData, "ContactFormMeta");
    const homeCollectionsEntry = PuckDataService.getEntryProps<HomeCollectionsProps>(nextData, "HomeCollections");
    const homeVisibilityEntry = PuckDataService.getEntryProps<HomeVisibilityProps>(nextData, "HomeVisibility");
    const homeUiEntry = PuckDataService.getEntryProps<HomeUiProps>(nextData, "HomeUi");
    const galleryCollectionsEntry = PuckDataService.getEntryProps<GalleryCollectionsProps>(nextData, "GalleryCollections");
    const galleryVisibilityEntry = PuckDataService.getEntryProps<GalleryVisibilityProps>(nextData, "GalleryVisibility");
    const contactCollectionsEntry = PuckDataService.getEntryProps<ContactCollectionsProps>(nextData, "ContactCollections");
    const contactVisibilityEntry = PuckDataService.getEntryProps<ContactVisibilityProps>(nextData, "ContactVisibility");
    const contactUiEntry = PuckDataService.getEntryProps<ContactUiProps>(nextData, "ContactUi");
    const contactIntegrationsEntry = PuckDataService.getEntryProps<ContactIntegrationsProps>(nextData, "ContactIntegrations");

    const next = {
      ...draft,
      global: {
        ...draft.global,
        siteName: globalEntry?.siteName ?? draft.global.siteName,
        cityLabel: globalEntry?.cityLabel ?? draft.global.cityLabel,
        tagline: globalEntry?.tagline ?? draft.global.tagline,
        description: globalEntry?.description ?? draft.global.description,
        navCtaText: globalEntry?.navCtaText ?? draft.global.navCtaText,
        navCtaLink: globalEntry?.navCtaLink ?? draft.global.navCtaLink,
        phone: globalEntry?.phone ?? draft.global.phone,
        email: globalEntry?.email ?? draft.global.email,
        addressLine: globalEntry?.addressLine ?? draft.global.addressLine,
        hoursLine: globalEntry?.hoursLine ?? draft.global.hoursLine,
        navLinks: PuckDataService.parseArray(globalCollectionsEntry?.navLinksJson as string | undefined, draft.global.navLinks),
        footerBadges: PuckDataService.parseArray(globalCollectionsEntry?.footerBadgesJson as string | undefined, draft.global.footerBadges),
        seoTitleSuffix: globalCollectionsEntry?.seoTitleSuffix ?? draft.global.seoTitleSuffix,
      },
      home: {
        ...draft.home,
        hero: {
          ...draft.home.hero,
          tagline: heroEntry?.tagline ?? draft.home.hero.tagline,
          title: heroEntry?.title ?? draft.home.hero.title,
          highlightText: heroEntry?.highlightText ?? draft.home.hero.highlightText,
          description: heroEntry?.description ?? draft.home.hero.description,
          primaryCta: {
            text: heroEntry?.primaryCtaText ?? draft.home.hero.primaryCta.text,
            link: heroEntry?.primaryCtaLink ?? draft.home.hero.primaryCta.link,
          },
          secondaryCta: {
            text: heroEntry?.secondaryCtaText ?? draft.home.hero.secondaryCta.text,
            link: heroEntry?.secondaryCtaLink ?? draft.home.hero.secondaryCta.link,
          },
        },
        stats: PuckDataService.parseArray(homeCollectionsEntry?.statsJson as string | undefined, draft.home.stats),
        focusCards: PuckDataService.parseArray(homeCollectionsEntry?.focusCardsJson as string | undefined, draft.home.focusCards),
        floorPlans: PuckDataService.parseArray(homeCollectionsEntry?.floorPlansJson as string | undefined, draft.home.floorPlans),
        amenityPanels: PuckDataService.parseArray(homeCollectionsEntry?.amenityPanelsJson as string | undefined, draft.home.amenityPanels),
        whyCards: PuckDataService.parseArray(homeCollectionsEntry?.whyCardsJson as string | undefined, draft.home.whyCards),
        testimonials: PuckDataService.parseArray(homeCollectionsEntry?.testimonialsJson as string | undefined, draft.home.testimonials),
        faq: PuckDataService.parseArray(homeCollectionsEntry?.faqJson as string | undefined, draft.home.faq),
        neighborhood: {
          ...draft.home.neighborhood,
          highlights: PuckDataService.parseArray(homeCollectionsEntry?.neighborhoodHighlightsJson as string | undefined, draft.home.neighborhood.highlights),
        },
        sectionVisibility: {
          ...draft.home.sectionVisibility,
          ...PuckDataService.parseObject(homeVisibilityEntry?.sectionVisibilityJson as string | undefined, draft.home.sectionVisibility),
        },
        ui: {
          ...draft.home.ui,
          ...PuckDataService.parseObject(homeUiEntry?.homeUiJson as string | undefined, draft.home.ui),
        },
      },
      gallery: {
        ...draft.gallery,
        heroEyebrow: galleryHeroEntry?.heroEyebrow ?? draft.gallery.heroEyebrow,
        heroTitle: galleryHeroEntry?.heroTitle ?? draft.gallery.heroTitle,
        heroDescription: galleryHeroEntry?.heroDescription ?? draft.gallery.heroDescription,
        heroImage: galleryHeroEntry?.heroImage ?? draft.gallery.heroImage,
        cta: {
          ...draft.gallery.cta,
          eyebrow: galleryCtaEntry?.ctaEyebrow ?? draft.gallery.cta.eyebrow,
          title: galleryCtaEntry?.ctaTitle ?? draft.gallery.cta.title,
          description: galleryCtaEntry?.ctaDescription ?? draft.gallery.cta.description,
          primary: {
            text: galleryCtaEntry?.primaryText ?? draft.gallery.cta.primary.text,
            link: galleryCtaEntry?.primaryLink ?? draft.gallery.cta.primary.link,
          },
          secondary: {
            text: galleryCtaEntry?.secondaryText ?? draft.gallery.cta.secondary.text,
            link: galleryCtaEntry?.secondaryLink ?? draft.gallery.cta.secondary.link,
          },
        },
        items: PuckDataService.parseArray(galleryCollectionsEntry?.galleryItemsJson as string | undefined, draft.gallery.items),
        sectionVisibility: {
          ...draft.gallery.sectionVisibility,
          ...PuckDataService.parseObject(galleryVisibilityEntry?.gallerySectionVisibilityJson as string | undefined, draft.gallery.sectionVisibility),
        },
      },
      contact: {
        ...draft.contact,
        heroEyebrow: contactHeroEntry?.heroEyebrow ?? draft.contact.heroEyebrow,
        heroTitle: contactHeroEntry?.heroTitle ?? draft.contact.heroTitle,
        heroDescription: contactHeroEntry?.heroDescription ?? draft.contact.heroDescription,
        heroImage: contactHeroEntry?.heroImage ?? draft.contact.heroImage,
        mapEmbedUrl:
          homeUiEntry?.mapEmbedUrl ??
          contactHeroEntry?.mapEmbedUrl ??
          draft.contact.mapEmbedUrl,
        officeHoursTitle: contactHeroEntry?.officeHoursTitle ?? draft.contact.officeHoursTitle,
        tourFormTitle: contactFormEntry?.tourFormTitle ?? draft.contact.tourFormTitle,
        tourFormDescription: contactFormEntry?.tourFormDescription ?? draft.contact.tourFormDescription,
        submitText: contactFormEntry?.submitText ?? draft.contact.submitText,
        officeHours: PuckDataService.parseArray(contactCollectionsEntry?.officeHoursJson as string | undefined, draft.contact.officeHours),
        formOptions: {
          bedroom: PuckDataService.parseArray(contactCollectionsEntry?.bedroomOptionsJson as string | undefined, draft.contact.formOptions.bedroom),
          moveIn: PuckDataService.parseArray(contactCollectionsEntry?.moveInOptionsJson as string | undefined, draft.contact.formOptions.moveIn),
          tourType: PuckDataService.parseArray(contactCollectionsEntry?.tourTypeOptionsJson as string | undefined, draft.contact.formOptions.tourType),
        },
        sectionVisibility: {
          ...draft.contact.sectionVisibility,
          ...PuckDataService.parseObject(contactVisibilityEntry?.contactSectionVisibilityJson as string | undefined, draft.contact.sectionVisibility),
        },
        integrations: {
          smtp: {
            ...draft.contact.integrations.smtp,
            ...PuckDataService.parseObject(contactIntegrationsEntry?.smtpJson as string | undefined, draft.contact.integrations.smtp),
            enabled:
              String(PuckDataService.parseObject(contactIntegrationsEntry?.smtpJson as string | undefined, draft.contact.integrations.smtp).enabled) === "true",
          },
          submitHooks: PuckDataService.parseArray(
            contactIntegrationsEntry?.submitHooksJson as string | undefined,
            draft.contact.integrations.submitHooks,
          ).map((hook: Record<string, unknown>) => ({
            name: String(hook.name ?? ""),
            url: String(hook.url ?? ""),
            method: String(hook.method ?? "POST"),
            enabled: String(hook.enabled) === "true" || hook.enabled === true,
            sendFormData: String(hook.sendFormData) !== "false",
            headersJson: String(hook.headersJson ?? "{}"),
          })),
        },
        ui: {
          ...draft.contact.ui,
          ...PuckDataService.parseObject(contactUiEntry?.contactUiJson as string | undefined, draft.contact.ui),
        },
      },
    };

    const validation = validateEditableSiteDocument(next);
    if (!validation.valid) {
      const msg = `${errorPrefix}: ${validation.errors[0]}`;
      setValidationError(msg);
      setAutosaveStatus("error");
      toast.error(msg);
      return;
    }

    setValidationError(null);
    setAutosaveStatus("saving");
    updateDraft(next);
    setAutosaveStatus("saved");
    setLastSavedAt(Date.now());
  };

  const onPublish = (nextData: PuckIncomingData) => {
    applyPuckData(nextData, "Publish blocked");
    toast.success("Studio changes applied to draft");
  };

  const onChange = (nextData: PuckIncomingData) => {
    applyPuckData(nextData, "Edit blocked");
  };

  const downloadDraftJson = () => {
    const json = exportDraftJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "editable-content.draft.json";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast.success("Draft JSON downloaded");
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const { document, errors } = coerceEditableSiteDocument(parsed);
      if (!document) {
        const msg = `Import failed: ${errors[0] ?? "invalid JSON structure"}.`;
        setImportError(msg);
        toast.error(msg);
        return;
      }

      updateDraft(document);
      setImportError(null);
      setAutosaveStatus("saved");
      setLastSavedAt(Date.now());
      toast.success("Draft imported successfully");
    } catch {
      const msg = "Import failed: unable to parse JSON file.";
      setImportError(msg);
      toast.error(msg);
    } finally {
      event.target.value = "";
    }
  };

  const handleUnlock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!STUDIO_PASSWORD) {
      setAuthError("Studio password is not configured.");
      toast.error(`Missing ${STUDIO_PASSWORD_ENV_HINT}`);
      return;
    }

    setIsAuthenticating(true);
    // Simulate brief auth delay for UX
    setTimeout(() => {
      if (!AdminAuthService.verifyPassword(password, STUDIO_PASSWORD)) {
        setAuthError("Invalid password.");
        toast.error("Studio unlock failed");
        setIsAuthenticating(false);
        return;
      }

      setAuthError("");
      setPassword("");
      setIsUnlocked(true);
      setIsAuthenticating(false);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, AdminAuthService.buildToken(STUDIO_PASSWORD));
      }
      toast.success("Studio unlocked");
    }, 400);
  };

  const handleLock = () => {
    setIsUnlocked(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    }
    toast.success("Studio locked");
  };

  const handlePublishDraft = async () => {
    setPublishDialogOpen(false);
    const result = await publishToGitHub();
    if (result.ok) {
      setSyncError(null);
      setAutosaveStatus("saved");
      setLastSavedAt(Date.now());
      toast.success("Published to live site via GitHub");
    } else {
      // Fallback: still publish locally
      publish();
      setSyncError(result.error || "GitHub publish failed — saved locally only");
      setAutosaveStatus("saved");
      setLastSavedAt(Date.now());
      toast.warning("Published locally. GitHub sync failed: " + (result.error || "unknown error"));
    }
  };

  const handleRevertDraft = () => {
    revertDraft();
    setAutosaveStatus("idle");
    setValidationError(null);
    setRevertDialogOpen(false);
    toast.success("Draft reverted to published");
  };

  const handleRetrySyncAction = async () => {
    try {
      publish();
      setSyncError(null);
      toast.success("Sync retry successful");
    } catch {
      setSyncError("API sync failed. Changes saved locally only.");
      toast.error("Sync retry failed");
    }
  };

  const handleCopyDraftJson = async () => {
    try {
      await navigator.clipboard.writeText(exportDraftJson());
      toast.success("Draft JSON copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  if (!isUnlocked) {
    if (!STUDIO_PASSWORD) {
      return (
        <main className="min-h-screen bg-body-mesh flex items-center justify-center">
          <section className="w-[min(560px,92vw)]">
            <div className="rounded-2xl border border-destructive/40 bg-panel-gradient p-6 shadow-soft md:p-8">
              <div className="mb-6 text-center">
                <p className="font-display text-xl text-foreground">{draft.global.siteName || "Baba Flats"}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">Studio</p>
              </div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-destructive">Configuration Error</p>
              <h1 className="mt-2 font-display text-3xl md:text-4xl">Studio Unavailable</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                The studio password has not been configured. Set the{" "}
                <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-foreground">{STUDIO_PASSWORD_ENV_HINT}</code>{" "}
                environment variable and restart the application.
              </p>
              <div className="mt-4 rounded-lg border border-border bg-background/60 p-3">
                <p className="text-xs font-mono text-muted-foreground">
                  # .env<br />
                  {STUDIO_PASSWORD_ENV_HINT}=your-secure-password
                </p>
              </div>
            </div>
          </section>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-body-mesh flex items-center justify-center">
        <section className="w-[min(560px,92vw)]">
          <div className="rounded-2xl border border-border bg-panel-gradient p-6 shadow-soft md:p-8">
            <div className="mb-6 text-center">
              <p className="font-display text-xl text-foreground">{draft.global.siteName || "Baba Flats"}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">Studio</p>
            </div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-accent">Protected</p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl">Enter Password</h1>
            <p className="mt-2 text-sm text-muted-foreground">This page is locked. Enter the admin password to open the visual studio.</p>

            <form className="mt-6 grid gap-3" onSubmit={handleUnlock}>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-foreground">Password</span>
                <input
                  type="password"
                  className="h-10 rounded-md border border-border bg-background px-3"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={isAuthenticating}
                />
              </label>

              {authError ? <p className="text-sm text-destructive">{authError}</p> : null}

              <button
                type="submit"
                disabled={isAuthenticating}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-50"
              >
                {isAuthenticating && <Loader2Icon className="size-3.5 animate-spin" />}
                {isAuthenticating ? "Unlocking…" : "Unlock Studio"}
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  const sectionPages = ["home", "gallery", "contact", "global"] as const;

  return (
    <main className="min-h-screen bg-background">
      {/* Redesigned Toolbar */}
      <div className="mx-auto flex w-[min(1440px,96vw)] flex-col gap-3 py-3">
        <div className="rounded-xl border border-border bg-panel-gradient p-3 shadow-soft">
          {/* Top row: Logo + Section tabs (desktop) + Actions */}
          <div className="flex items-center justify-between gap-3">
            {/* Left: Canvas mode toggle + autosave status */}
            <div className="flex items-center gap-2">
              <span className="hidden text-sm font-display text-foreground sm:inline">Studio</span>
              <div className="flex items-center rounded-full border border-border bg-background/60 p-0.5">
                <button
                  type="button"
                  onClick={() => { setMode("published"); toast("Live canvas mode"); }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                    mode === "published" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Live
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("preview"); toast("Draft preview mode"); }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                    mode === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Draft
                </button>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] transition-all ${
                  autosaveStatus === "error"
                    ? "bg-destructive text-destructive-foreground"
                    : autosaveStatus === "saving"
                      ? "bg-secondary text-secondary-foreground animate-pulse"
                      : "bg-emerald-600 text-white"
                }`}
              >
                {autosaveStatus === "error"
                  ? "Save Error"
                  : autosaveStatus === "saving"
                    ? "Saving…"
                    : hasUnpublishedChanges
                      ? `Saved${lastSavedAt ? ` ${new Date(lastSavedAt).toLocaleTimeString()}` : ""}`
                      : "Up to Date"}
              </span>
            </div>

            {/* Center: Section tabs (desktop only) */}
            <div className="hidden items-center gap-1 md:flex">
              {sectionPages.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => { setEditorPage(page); toast(`Editing ${page} content`); }}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                    editorPage === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Center: Section dropdown (mobile only) */}
            <div className="md:hidden">
              <Select value={editorPage} onValueChange={(val) => { setEditorPage(val as typeof editorPage); toast(`Editing ${val} content`); }}>
                <SelectTrigger size="sm" className="w-28">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  {sectionPages.map((page) => (
                    <SelectItem key={page} value={page}>
                      {page.charAt(0).toUpperCase() + page.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Right: Primary actions + overflow menu */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRevertDialogOpen(true)}
              >
                Revert
              </Button>
              <Button
                size="sm"
                onClick={() => setPublishDialogOpen(true)}
              >
                Publish
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(import.meta.env.BASE_URL || "/", "_blank")}
                title="Preview in new tab"
              >
                <ExternalLinkIcon className="size-3.5" />
              </Button>

              {/* Overflow menu for secondary actions */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="outline" size="icon-sm" />}
                >
                  <MoreVerticalIcon className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={downloadDraftJson}>
                    <DownloadIcon className="size-3.5" />
                    Download JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                    <UploadIcon className="size-3.5" />
                    Import JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyDraftJson}>
                    <CopyIcon className="size-3.5" />
                    Copy JSON
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setGitTokenInput(GitHubCms.getToken()); setGitTokenDialogOpen(true); }}>
                    <ExternalLinkIcon className="size-3.5" />
                    GitHub Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLock}>
                    <LockIcon className="size-3.5" />
                    Lock Studio
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Publish confirmation dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Changes</AlertDialogTitle>
            <AlertDialogDescription>
              {GitHubCms.hasToken()
                ? "This will commit content.json to GitHub and trigger a site rebuild. Visitors will see the updated content after deploy."
                : "No GitHub token configured. Changes will be saved locally only. Configure a token in GitHub Settings to enable live publishing."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishDraft} disabled={gitPublishStatus === "publishing"}>
              {gitPublishStatus === "publishing" ? "Publishing…" : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revert confirmation dialog */}
      <AlertDialog open={revertDialogOpen} onOpenChange={setRevertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert Draft</AlertDialogTitle>
            <AlertDialogDescription>
              This will discard all unpublished changes and revert the draft to the currently published content. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleRevertDraft}>Revert</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* GitHub token dialog */}
      <AlertDialog open={gitTokenDialogOpen} onOpenChange={setGitTokenDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>GitHub Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a GitHub Personal Access Token with <code className="rounded bg-secondary px-1 text-xs">repo</code> scope to enable publishing content directly to the repository.
              {GitHubCms.hasToken() && <span className="mt-1 block text-xs text-emerald-600">✓ Token configured</span>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            type="password"
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={gitTokenInput}
            onChange={(e) => setGitTokenInput(e.target.value)}
          />
          <AlertDialogFooter>
            {GitHubCms.hasToken() && (
              <Button variant="outline" size="sm" onClick={() => { GitHubCms.clearToken(); setGitTokenInput(""); toast.success("Token removed"); setGitTokenDialogOpen(false); }}>
                Remove Token
              </Button>
            )}
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { GitHubCms.setToken(gitTokenInput); toast.success("GitHub token saved"); setGitTokenDialogOpen(false); }}>
              Save Token
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Inline error states */}
      <div className="mx-auto w-[min(1600px,96vw)]">
        {/* Validation error banner */}
        {validationError && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            <AlertTriangleIcon className="size-4 shrink-0" />
            <span className="flex-1">{validationError}</span>
            <button type="button" onClick={() => setValidationError(null)} className="shrink-0 rounded p-0.5 hover:bg-destructive/20">
              <XIcon className="size-3.5" />
            </button>
          </div>
        )}

        {/* API sync error bar */}
        {syncError && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertTriangleIcon className="size-4 shrink-0" />
            <span className="flex-1">{syncError}</span>
            <button type="button" onClick={handleRetrySyncAction} className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 px-2.5 py-0.5 text-xs font-semibold hover:bg-amber-500/20">
              <RefreshCwIcon className="size-3" />
              Retry
            </button>
            <button type="button" onClick={() => setSyncError(null)} className="shrink-0 rounded p-0.5 hover:bg-amber-500/20">
              <XIcon className="size-3.5" />
            </button>
          </div>
        )}

        {/* Import error inline */}
        {importError && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            <AlertTriangleIcon className="size-4 shrink-0" />
            <span className="flex-1">{importError}</span>
            <button type="button" onClick={() => setImportError(null)} className="shrink-0 rounded p-0.5 hover:bg-destructive/20">
              <XIcon className="size-3.5" />
            </button>
          </div>
        )}

        {/* Loading skeleton while Puck initializes */}
        {!puckReady ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-panel-gradient p-16">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading editor…</p>
          </div>
        ) : (
          <>
            <div className="mb-2 text-xs text-muted-foreground">
              Live canvas editing is enabled. Click a section on the page canvas to edit fields in the panel.
              <span className="ml-2 text-muted-foreground/60">Ctrl+S to save • Ctrl+Shift+P to publish</span>
            </div>
            <div className="min-w-0 overflow-hidden rounded-xl border border-border shadow-soft">
              {/* Puck's Config generic requires exact field type matching that doesn't align with our dynamic config shape */}
              <Puck
                key={puckCanvasKey}
                config={config as Parameters<typeof Puck>[0]["config"]}
                data={data as Parameters<typeof Puck>[0]["data"]}
                onPublish={onPublish}
                onChange={onChange}
                plugins={plugins as Parameters<typeof Puck>[0]["plugins"]}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
