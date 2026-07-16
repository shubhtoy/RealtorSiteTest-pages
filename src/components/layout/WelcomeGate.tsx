"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useEditableContent } from "@/context/EditableContentContext";

// Full-bleed background photo for the landing hero, with a graceful fallback.
const PRIMARY_BG = "/images/exterior.jpg";
const FALLBACK_BG = "/images/aerial.jpg";

/**
 * Landing hero ("welcome") shown at the very top of the home page.
 *
 * This is NOT a fixed dismiss-on-scroll overlay. It is a normal full-height
 * section that the visitor scrolls PAST to enter the detailed site — so a small
 * scroll doesn't make it vanish, and scrolling back up brings it into view
 * again (standard "big image + scroll to explore" landing pattern). Rendered on
 * the home route only.
 */
export default function WelcomeGate() {
  const pathname = usePathname();
  const { current } = useEditableContent();
  const welcome = current.welcome;
  const reduced = useReducedMotion();
  const [bgSrc, setBgSrc] = useState<string>(PRIMARY_BG);

  // Landing hero is home-only.
  if (pathname !== "/") return null;

  const promptText = welcome.prompt || "Scroll to explore";

  const scrollToContent = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({
      top: window.innerHeight,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return (
    <section
      aria-label={`Welcome to ${current.global.siteName}`}
      className="relative h-[100svh] w-full overflow-hidden bg-overlay-dark"
    >
      {/* Full-bleed background photo with a slow ken-burns zoom. */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: reduced ? 1 : 1.08 }}
        transition={reduced ? { duration: 0 } : { duration: 18, ease: "easeOut" }}
      >
        <Image
          src={bgSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          onError={() => setBgSrc((prev) => (prev === PRIMARY_BG ? FALLBACK_BG : prev))}
        />
      </motion.div>

      {/* Legibility scrim: overall darken + bottom-weighted gradient. */}
      <div className="pointer-events-none absolute inset-0 bg-overlay-dark/35" />
      <div className="pointer-events-none absolute inset-0 bg-hero-fade" />

      {/* Reading content, anchored lower-left, directly on the photo. */}
      <motion.div
        className="relative z-10 flex h-full flex-col justify-end px-6 pb-32 md:px-16 md:pb-28 lg:px-24"
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduced ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }
        }
      >
        <div className="max-w-2xl">
          <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white/80 md:text-xs">
            {current.global.siteName}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-5xl md:text-6xl lg:text-7xl">
            {welcome.heading}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.4)] md:text-lg">
            {welcome.message}
          </p>
        </div>
      </motion.div>

      {/* Bottom-centered "scroll to explore" affordance; clicking eases down. */}
      <motion.button
        type="button"
        onClick={scrollToContent}
        aria-label="Scroll to enter the site"
        className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 rounded-md px-4 py-2 text-white/85 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
        initial={{ opacity: reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 0.6, delay: 0.5 }}
      >
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] md:text-xs">
          {promptText}
        </span>
        <motion.span
          className="flex"
          animate={reduced ? { y: 0 } : { y: [0, 8, 0] }}
          transition={reduced ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </motion.span>
      </motion.button>
    </section>
  );
}
