import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://babaflats.com";

/**
 * Generates /sitemap.xml listing the public, indexable routes.
 *
 * The Studio editor (/studio) is intentionally excluded — it is disallowed in
 * robots.ts and marked noindex in its own metadata.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${siteUrl}/`, lastModified },
    { url: `${siteUrl}/gallery`, lastModified },
    { url: `${siteUrl}/contact`, lastModified },
  ];
}
