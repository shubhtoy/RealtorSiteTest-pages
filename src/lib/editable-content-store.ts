import { toast } from "sonner";
import { defaultEditableSiteDocument } from "@/lib/editable-content-defaults";
import { appEnv } from "@/config/env";
import type { EditableSiteDocument } from "@/types/editable-content";

export const CURRENT_DOCUMENT_VERSION = 1;

const DRAFT_KEY = "baba.editableContent.draft";
const PUBLISHED_KEY = "baba.editableContent.published";

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function validateEditableSiteDocument(document: EditableSiteDocument): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isNumber(document.version)) errors.push("version must be a number");
  if (!isString(document.updatedAt)) errors.push("updatedAt must be a string");

  // Theme validation (lenient — all strings)
  if (document.theme) {
    if (!isObject(document.theme)) errors.push("theme must be an object");
    else {
      if (document.theme.colors && !isObject(document.theme.colors)) errors.push("theme.colors must be an object");
      if (document.theme.fonts && !isObject(document.theme.fonts)) errors.push("theme.fonts must be an object");
      if (document.theme.fontSize && !isObject(document.theme.fontSize)) errors.push("theme.fontSize must be an object");
      if (document.theme.spacing && !isObject(document.theme.spacing)) errors.push("theme.spacing must be an object");
    }
  }

  if (!isString(document.global.siteName)) errors.push("global.siteName must be a string");
  if (!isString(document.global.cityLabel)) errors.push("global.cityLabel must be a string");
  if (!isString(document.global.tagline)) errors.push("global.tagline must be a string");
  if (!isString(document.global.description)) errors.push("global.description must be a string");
  if (!isString(document.global.phone)) errors.push("global.phone must be a string");
  if (!isString(document.global.email)) errors.push("global.email must be a string");
  if (!isString(document.global.addressLine)) errors.push("global.addressLine must be a string");
  if (!isString(document.global.hoursLine)) errors.push("global.hoursLine must be a string");
  if (!isString(document.global.navCtaText)) errors.push("global.navCtaText must be a string");
  if (!isString(document.global.navCtaLink)) errors.push("global.navCtaLink must be a string");
  if (!isString(document.global.seoTitleSuffix)) errors.push("global.seoTitleSuffix must be a string");
  if (!Array.isArray(document.global.navLinks) || !document.global.navLinks.every((item) => isObject(item) && isString(item.to) && isString(item.label))) {
    errors.push("global.navLinks must be an array of { to, label }");
  }
  if (!isStringArray(document.global.footerBadges)) errors.push("global.footerBadges must be an array of strings");

  if (!isObject(document.home.sectionVisibility) || !Object.values(document.home.sectionVisibility).every(isBoolean)) {
    errors.push("home.sectionVisibility must contain only booleans");
  }
  if (!isString(document.home.hero.tagline)) errors.push("home.hero.tagline must be a string");
  if (!isString(document.home.hero.title)) errors.push("home.hero.title must be a string");
  if (!isString(document.home.hero.highlightText)) errors.push("home.hero.highlightText must be a string");
  if (!isString(document.home.hero.description)) errors.push("home.hero.description must be a string");
  if (!isString(document.home.hero.primaryCta.text) || !isString(document.home.hero.primaryCta.link)) {
    errors.push("home.hero.primaryCta must contain string text/link");
  }
  if (!isString(document.home.hero.secondaryCta.text) || !isString(document.home.hero.secondaryCta.link)) {
    errors.push("home.hero.secondaryCta must contain string text/link");
  }
  if (!isStringArray(document.home.hero.heroRailMedia)) errors.push("home.hero.heroRailMedia must be an array of strings");
  if (!Array.isArray(document.home.stats) || !document.home.stats.every((item) => isObject(item) && isNumber(item.value) && isString(item.suffix) && isString(item.label))) {
    errors.push("home.stats must be an array of { value, suffix, label }");
  }
  if (!Array.isArray(document.home.focusCards) || !document.home.focusCards.every((item) => isObject(item) && isString(item.title) && isString(item.src))) {
    errors.push("home.focusCards must be an array of { title, src }");
  }
  if (!Array.isArray(document.home.floorPlans) || !document.home.floorPlans.every((item) => isObject(item) && isString(item.title) && isNumber(item.bedrooms) && isNumber(item.bathrooms) && isString(item.sqft) && isString(item.description) && isString(item.image) && isStringArray(item.features) && isString(item.priceRange))) {
    errors.push("home.floorPlans contains invalid entries");
  }
  if (!Array.isArray(document.home.amenityPanels) || !document.home.amenityPanels.every((item) => isObject(item) && isString(item.title) && isString(item.description) && isString(item.image))) {
    errors.push("home.amenityPanels contains invalid entries");
  }
  if (!Array.isArray(document.home.whyCards) || !document.home.whyCards.every((item) => isObject(item) && isString(item.title) && isString(item.description) && isString(item.tag) && ["building", "paw", "car", "map", "shield", "sparkles"].includes(String(item.icon)))) {
    errors.push("home.whyCards contains invalid entries");
  }
  if (!isObject(document.home.neighborhood) || !isString(document.home.neighborhood.eyebrow) || !isString(document.home.neighborhood.title) || !isString(document.home.neighborhood.description)) {
    errors.push("home.neighborhood header fields are invalid");
  }
  if (!Array.isArray(document.home.neighborhood.highlights) || !document.home.neighborhood.highlights.every((item) => isObject(item) && isString(item.title) && isString(item.description) && isString(item.distance))) {
    errors.push("home.neighborhood.highlights contains invalid entries");
  }
  if (!Array.isArray(document.home.testimonials) || !document.home.testimonials.every((item) => isObject(item) && isString(item.quote) && isString(item.name) && isString(item.designation))) {
    errors.push("home.testimonials contains invalid entries");
  }
  if (!Array.isArray(document.home.faq) || !document.home.faq.every((item) => isObject(item) && isString(item.question) && isString(item.answer) && isString(item.category))) {
    errors.push("home.faq contains invalid entries");
  }
  if (!isObject(document.home.finalCta) || !isString(document.home.finalCta.tagline) || !isString(document.home.finalCta.title) || !isString(document.home.finalCta.description)) {
    errors.push("home.finalCta header fields are invalid");
  }
  if (!isString(document.home.finalCta.primary.text) || !isString(document.home.finalCta.primary.link)) {
    errors.push("home.finalCta.primary must contain string text/link");
  }
  if (!isString(document.home.finalCta.secondary.text) || !isString(document.home.finalCta.secondary.link)) {
    errors.push("home.finalCta.secondary must contain string text/link");
  }
  if (!isObject(document.home.ui) || !Object.values(document.home.ui).every(isString)) {
    errors.push("home.ui must contain only strings");
  }

  if (!isObject(document.gallery.sectionVisibility) || !Object.values(document.gallery.sectionVisibility).every(isBoolean)) {
    errors.push("gallery.sectionVisibility must contain only booleans");
  }
  if (!isString(document.gallery.heroEyebrow)) errors.push("gallery.heroEyebrow must be a string");
  if (!isString(document.gallery.heroTitle)) errors.push("gallery.heroTitle must be a string");
  if (!isString(document.gallery.heroDescription)) errors.push("gallery.heroDescription must be a string");
  if (!isString(document.gallery.heroImage)) errors.push("gallery.heroImage must be a string");
  if (!Array.isArray(document.gallery.items) || !document.gallery.items.every((item) => isObject(item) && isString(item.src) && isString(item.alt) && isString(item.label) && ["Exterior", "Interiors", "Amenities", "Floor Plans"].includes(String(item.category)))) {
    errors.push("gallery.items contains invalid entries");
  }
  if (!isString(document.gallery.cta.eyebrow) || !isString(document.gallery.cta.title) || !isString(document.gallery.cta.description)) {
    errors.push("gallery.cta header fields are invalid");
  }
  if (!isString(document.gallery.cta.primary.text) || !isString(document.gallery.cta.primary.link)) {
    errors.push("gallery.cta.primary must contain string text/link");
  }
  if (!isString(document.gallery.cta.secondary.text) || !isString(document.gallery.cta.secondary.link)) {
    errors.push("gallery.cta.secondary must contain string text/link");
  }

  if (!isObject(document.contact.sectionVisibility) || !Object.values(document.contact.sectionVisibility).every(isBoolean)) {
    errors.push("contact.sectionVisibility must contain only booleans");
  }
  if (!isString(document.contact.heroEyebrow)) errors.push("contact.heroEyebrow must be a string");
  if (!isString(document.contact.heroTitle)) errors.push("contact.heroTitle must be a string");
  if (!isString(document.contact.heroDescription)) errors.push("contact.heroDescription must be a string");
  if (!isString(document.contact.heroImage)) errors.push("contact.heroImage must be a string");
  if (!isString(document.contact.mapEmbedUrl)) errors.push("contact.mapEmbedUrl must be a string");
  if (!isString(document.contact.officeHoursTitle)) errors.push("contact.officeHoursTitle must be a string");
  if (!isStringArray(document.contact.officeHours)) errors.push("contact.officeHours must be an array of strings");
  if (!isString(document.contact.tourFormTitle)) errors.push("contact.tourFormTitle must be a string");
  if (!isString(document.contact.tourFormDescription)) errors.push("contact.tourFormDescription must be a string");
  if (!isString(document.contact.submitText)) errors.push("contact.submitText must be a string");
  if (!isObject(document.contact.formOptions) || !isStringArray(document.contact.formOptions.bedroom) || !isStringArray(document.contact.formOptions.moveIn) || !isStringArray(document.contact.formOptions.tourType)) {
    errors.push("contact.formOptions must contain string arrays");
  }
  if (!isObject(document.contact.integrations) || !isObject(document.contact.integrations.smtp)) {
    errors.push("contact.integrations.smtp is required");
  } else {
    if (!isBoolean(document.contact.integrations.smtp.enabled)) errors.push("contact.integrations.smtp.enabled must be a boolean");
    if (!isString(document.contact.integrations.smtp.endpoint)) errors.push("contact.integrations.smtp.endpoint must be a string");
    if (!isString(document.contact.integrations.smtp.method)) errors.push("contact.integrations.smtp.method must be a string");
    if (!isString(document.contact.integrations.smtp.authHeader)) errors.push("contact.integrations.smtp.authHeader must be a string");
    if (!isString(document.contact.integrations.smtp.fromEmail)) errors.push("contact.integrations.smtp.fromEmail must be a string");
    if (!isString(document.contact.integrations.smtp.toEmail)) errors.push("contact.integrations.smtp.toEmail must be a string");
    if (!isString(document.contact.integrations.smtp.subjectTemplate)) errors.push("contact.integrations.smtp.subjectTemplate must be a string");
  }
  if (
    !Array.isArray(document.contact.integrations?.submitHooks) ||
    !document.contact.integrations.submitHooks.every(
      (hook) =>
        isObject(hook) &&
        isString(hook.name) &&
        isString(hook.url) &&
        isString(hook.method) &&
        isBoolean(hook.enabled) &&
        isBoolean(hook.sendFormData) &&
        isString(hook.headersJson),
    )
  ) {
    errors.push("contact.integrations.submitHooks contains invalid entries");
  }
  if (!isObject(document.contact.ui) || !isString(document.contact.ui.callButtonPrefix) || !isString(document.contact.ui.browseButtonText) || !isString(document.contact.ui.formEyebrow)) {
    errors.push("contact.ui basic fields are invalid");
  }
  if (!isStringArray(document.contact.ui.infoBullets)) errors.push("contact.ui.infoBullets must be an array of strings");
  if (!isStringArray(document.contact.ui.featureBadges)) errors.push("contact.ui.featureBadges must be an array of strings");
  if (!isObject(document.contact.ui.labels) || !Object.values(document.contact.ui.labels).every(isString)) {
    errors.push("contact.ui.labels must contain only strings");
  }
  if (!isObject(document.contact.ui.placeholders) || !Object.values(document.contact.ui.placeholders).every(isString)) {
    errors.push("contact.ui.placeholders must contain only strings");
  }

  return { valid: errors.length === 0, errors };
}

export function coerceEditableSiteDocument(input: unknown): { document: EditableSiteDocument | null; errors: string[] } {
  if (!isObject(input)) {
    return { document: null, errors: ["payload is not an object"] };
  }

  const partial = input as EditableSiteDocument;
  if (!partial.version || !partial.global || !partial.home || !partial.gallery || !partial.contact) {
    return { document: null, errors: ["payload is missing required top-level sections"] };
  }

  if (isNumber(partial.version) && partial.version > CURRENT_DOCUMENT_VERSION) {
    return { document: null, errors: ["Document version too new"] };
  }

  const hydrated = hydrateDocument(partial);
  const validation = validateEditableSiteDocument(hydrated);
  return validation.valid ? { document: hydrated, errors: [] } : { document: null, errors: validation.errors };
}

function parseDocument(raw: string | null): EditableSiteDocument | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as EditableSiteDocument;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.version || !parsed.global || !parsed.home || !parsed.gallery || !parsed.contact) return null;
    return parsed;
  } catch {
    return null;
  }
}

function hydrateDocument(partial: EditableSiteDocument): EditableSiteDocument {
  return {
    ...defaultEditableSiteDocument,
    ...partial,
    theme: {
      ...defaultEditableSiteDocument.theme,
      ...partial.theme,
      colors: {
        ...defaultEditableSiteDocument.theme.colors,
        ...partial.theme?.colors,
      },
      fonts: {
        ...defaultEditableSiteDocument.theme.fonts,
        ...partial.theme?.fonts,
      },
      fontSize: {
        ...defaultEditableSiteDocument.theme.fontSize,
        ...partial.theme?.fontSize,
      },
      spacing: {
        ...defaultEditableSiteDocument.theme.spacing,
        ...partial.theme?.spacing,
      },
    },
    global: {
      ...defaultEditableSiteDocument.global,
      ...partial.global,
    },
    home: {
      ...defaultEditableSiteDocument.home,
      ...partial.home,
      sectionVisibility: {
        ...defaultEditableSiteDocument.home.sectionVisibility,
        ...partial.home?.sectionVisibility,
      },
      hero: {
        ...defaultEditableSiteDocument.home.hero,
        ...partial.home?.hero,
      },
      neighborhood: {
        ...defaultEditableSiteDocument.home.neighborhood,
        ...partial.home?.neighborhood,
      },
      finalCta: {
        ...defaultEditableSiteDocument.home.finalCta,
        ...partial.home?.finalCta,
      },
      ui: {
        ...defaultEditableSiteDocument.home.ui,
        ...partial.home?.ui,
      },
    },
    gallery: {
      ...defaultEditableSiteDocument.gallery,
      ...partial.gallery,
      sectionVisibility: {
        ...defaultEditableSiteDocument.gallery.sectionVisibility,
        ...partial.gallery?.sectionVisibility,
      },
      cta: {
        ...defaultEditableSiteDocument.gallery.cta,
        ...partial.gallery?.cta,
      },
    },
    contact: {
      ...defaultEditableSiteDocument.contact,
      ...partial.contact,
      sectionVisibility: {
        ...defaultEditableSiteDocument.contact.sectionVisibility,
        ...partial.contact?.sectionVisibility,
      },
      formOptions: {
        ...defaultEditableSiteDocument.contact.formOptions,
        ...partial.contact?.formOptions,
      },
      integrations: {
        ...defaultEditableSiteDocument.contact.integrations,
        ...partial.contact?.integrations,
        smtp: {
          ...defaultEditableSiteDocument.contact.integrations.smtp,
          ...partial.contact?.integrations?.smtp,
        },
        submitHooks: Array.isArray(partial.contact?.integrations?.submitHooks)
          ? partial.contact.integrations.submitHooks
          : defaultEditableSiteDocument.contact.integrations.submitHooks,
      },
      ui: {
        ...defaultEditableSiteDocument.contact.ui,
        ...partial.contact?.ui,
        labels: {
          ...defaultEditableSiteDocument.contact.ui.labels,
          ...partial.contact?.ui?.labels,
        },
        placeholders: {
          ...defaultEditableSiteDocument.contact.ui.placeholders,
          ...partial.contact?.ui?.placeholders,
        },
      },
    },
  };
}

function withUpdatedAt(document: EditableSiteDocument): EditableSiteDocument {
  return {
    ...document,
    updatedAt: new Date().toISOString(),
  };
}

export function readPublishedDocument(): EditableSiteDocument {
  if (typeof window === "undefined") return defaultEditableSiteDocument;
  const raw = window.localStorage.getItem(PUBLISHED_KEY);
  const parsed = parseDocument(raw);
  if (!parsed && raw !== null) {
    console.warn("[editable-content-store] Failed to parse published document from localStorage; falling back to defaults.");
  }
  return parsed ? hydrateDocument(parsed) : defaultEditableSiteDocument;
}

export function readDraftDocument(): EditableSiteDocument {
  if (typeof window === "undefined") return defaultEditableSiteDocument;
  const raw = window.localStorage.getItem(DRAFT_KEY);
  const parsed = parseDocument(raw);
  if (!parsed) {
    if (raw !== null) {
      console.warn("[editable-content-store] Failed to parse draft document from localStorage; falling back to published/defaults.");
    }
    return readPublishedDocument();
  }
  const hydrated = hydrateDocument(parsed);
  const validation = validateEditableSiteDocument(hydrated);
  if (!validation.valid) {
    console.warn("[editable-content-store] Draft document failed validation; falling back to published/defaults.", validation.errors);
    return readPublishedDocument();
  }
  return hydrated;
}

export function writeDraftDocument(document: EditableSiteDocument) {
  if (typeof window === "undefined") return;
  const hydrated = hydrateDocument(document);
  const payload = withUpdatedAt(hydrated);
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      toast.warning("Storage quota exceeded. Draft preserved in memory only.");
    }
  }
  // Persist to server file (non-blocking)
  fetch(`${appEnv.apiOrigin}/api/content/draft`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-studio-password": appEnv.studioPassword },
    body: JSON.stringify({ document: payload }),
  }).catch(() => {});
}

export function publishDraftDocument(document: EditableSiteDocument) {
  if (typeof window === "undefined") return;
  const hydrated = hydrateDocument(document);
  const next = JSON.stringify(withUpdatedAt(hydrated));
  window.localStorage.setItem(DRAFT_KEY, next);
  window.localStorage.setItem(PUBLISHED_KEY, next);
}

export function resetDraftToPublished() {
  if (typeof window === "undefined") return;
  const published = readPublishedDocument();
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(withUpdatedAt(published)));
}

export function resetAllEditableContent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
  window.localStorage.removeItem(PUBLISHED_KEY);
}

export function exportDraftAsJson(): string {
  return JSON.stringify(readDraftDocument(), null, 2);
}
