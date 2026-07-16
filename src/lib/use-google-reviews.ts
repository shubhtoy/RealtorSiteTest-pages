"use client";

import { useEffect, useState } from "react";
import { appEnv } from "@/config/env";

export type ReviewTestimonial = {
  quote: string;
  name: string;
  title: string;
};

type ApiReview = { author?: string; rating?: number; text?: string; time?: string };

/**
 * Fetches Google reviews from the server route (Places API) and returns them as
 * testimonial cards, filtered to `minRating` and capped at `maxCount`. Returns
 * `null` while disabled/loading so callers can fall back to manual testimonials.
 * The star filter + count come from the Studio-configurable `home.reviews`.
 */
export function useGoogleReviewItems(
  enabled: boolean,
  minRating: number,
  maxCount: number,
): ReviewTestimonial[] | null {
  const [items, setItems] = useState<ReviewTestimonial[] | null>(null);

  useEffect(() => {
    if (!enabled) {
      setItems(null);
      return;
    }
    let active = true;
    fetch(`${appEnv.apiOrigin}/api/reviews`)
      .then((res) => res.json())
      .then((data: { reviews?: ApiReview[] }) => {
        if (!active) return;
        const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
        const mapped = reviews
          .filter((r) => (r.rating ?? 0) >= minRating && (r.text ?? "").trim().length > 0)
          .slice(0, Math.max(1, maxCount))
          .map((r) => ({
            quote: r.text ?? "",
            name: r.author ?? "Google user",
            title: `${"★".repeat(Math.max(0, Math.round(r.rating ?? 0)))}${r.time ? ` · ${r.time}` : ""}`,
          }));
        setItems(mapped);
      })
      .catch(() => {
        if (active) setItems([]);
      });
    return () => {
      active = false;
    };
  }, [enabled, minRating, maxCount]);

  return items;
}
