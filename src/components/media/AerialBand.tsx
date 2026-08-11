"use client";

import { useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { useEditableContent } from "@/context/EditableContentContext";
import { resolveAppHref } from "@/lib/utils";

// Aerial drone flyover reused as a full-bleed cinematic background band.
// Served from the persisted uploads directory; falls back to a still image on
// reduced-motion preference or a video load error.
const AERIAL_VIDEO = "/uploads/ariel-view-1779388979231.mp4";
const POSTER = "/images/aerial.jpg";

/**
 * Full-bleed aerial-video background section with an overlaid tagline + CTA.
 * Autoplays muted/looping; degrades to a static poster for reduced-motion users
 * or if the video fails to load.
 */
export function AerialBand() {
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const { current } = useEditableContent();
  const global = current.global;

  return (
    <section
      data-studio-section="HomeAerial"
      aria-label="Aerial view of the neighborhood"
      className="relative h-[60vh] min-h-[420px] w-full overflow-hidden"
    >
      <div className="absolute inset-0">
        {!reduced && !failed ? (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={POSTER}
            aria-hidden
            onError={() => setFailed(true)}
          >
            <source src={AERIAL_VIDEO} type="video/mp4" />
          </video>
        ) : (
          <OptimizedImage
            src={POSTER}
            alt=""
            className="h-full w-full object-cover"
            sizes="100vw"
          />
        )}
      </div>

      {/* Legibility scrim. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/45" />

      <div className="relative z-10 mx-auto flex h-full w-[min(1140px,92vw)] flex-col items-start justify-end pb-12 md:pb-16">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/80">
          {global.cityLabel}
        </p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl leading-[1.05] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)] md:text-5xl">
          {global.tagline}
        </h2>
        <Link
          href={resolveAppHref(global.navCtaLink)}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-soft-lg"
        >
          {global.navCtaText}
        </Link>
      </div>
    </section>
  );
}
