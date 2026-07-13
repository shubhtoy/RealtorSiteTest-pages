import type { SiteConfig } from "@/types/siteConfig";
import { contactInfo, siteMetadata } from "@/config/content";

export const SITE_CONFIG_STORAGE_KEY = "baba.siteConfig";

export const defaultSiteConfig: SiteConfig = {
  siteName: "Baba Flats",
  cityLabel: "Atlanta",
  tagline: siteMetadata.tagline,
  description: siteMetadata.description,
  phone: contactInfo.phone,
  email: contactInfo.email,
  addressLine: "1204 Veterans Memorial Hwy SW, Atlanta, GA",
  hoursLine: "Mon–Fri 9am–6pm, Sat 10am–4pm",
  navCtaText: "Book a Tour",
  navCtaLink: "/contact",
};

export function mergeSiteConfig(partial?: Partial<SiteConfig> | null): SiteConfig {
  return {
    ...defaultSiteConfig,
    ...(partial ?? {}),
  };
}

export function readLocalSiteConfig(): Partial<SiteConfig> | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<SiteConfig>;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLocalSiteConfig(config: SiteConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function clearLocalSiteConfig() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SITE_CONFIG_STORAGE_KEY);
}
