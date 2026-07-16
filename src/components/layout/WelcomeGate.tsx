"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useEditableContent } from "@/context/EditableContentContext";

// Full-bleed splash photo, with a graceful fallback if it fails to load.
const PRIMARY_BG = "/images/exterior.jpg";
const FALLBACK_BG = "/images/aerial.jpg";

/**
 * Welcome splash screen for the home page.
 *
 * A full-screen overlay (covering the nav) shown on every home-page load: the
 * visitor clicks/taps anywhere — or presses a key — to enter the site. It is
 * intentionally NOT persisted, so a refresh brings it back. There is no scroll
 * interaction. Rendered on the home route only.
 */
export default function WelcomeGate() {
  const pathname = usePathname();
  const { current } = useEditableContent();
  const welcome = current.welcome;
  const reduced = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [bgSrc, setBgSrc] = useState<string>(PRIMARY_BG);
  // Visible on first render (server + client) so there is no hydration jump and
  // the splash reliably reappears on every refresh.
  const [visible, setVisible] = useState<boolean>(true);

  const isHome = pathname === "/";

  const dismiss = useCallback(() => setVisible(false), []);

  // While the splash is up on the home page: lock body scroll, move focus to the
  // overlay, and let any key dismiss it. Cleans up on dismiss/unmount.
  useEffect(() => {
    if (!isHome || !visible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlayRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      setVisible(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isHome, visible]);

  if (!isHome) return null;

  const promptText = welcome.prompt || "Tap to enter";
  const headingId = "welcome-splash-heading";
  const messageId = "welcome-splash-message";

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          aria-describedby={messageId}
          tabIndex={-1}
          onClick={dismiss}
          className="fixed inset-0 z-[130] flex h-[100svh] w-screen cursor-pointer flex-col justify-end overflow-hidden bg-overlay-dark outline-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.5, ease: "easeInOut" } }}
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

          {/* Legibility scrim. */}
          <div className="pointer-events-none absolute inset-0 bg-overlay-dark/35" />
          <div className="pointer-events-none absolute inset-0 bg-hero-fade" />

          {/* Reading content, anchored lower-left. */}
          <motion.div
            className="relative z-10 px-6 pb-24 md:px-16 md:pb-24 lg:px-24"
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
              <h1
                id={headingId}
                className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-5xl md:text-6xl lg:text-7xl"
              >
                {welcome.heading}
              </h1>
              <p
                id={messageId}
                className="mt-5 max-w-xl text-base leading-relaxed text-white/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.4)] md:text-lg"
              >
                {welcome.message}
              </p>
            </div>
          </motion.div>

          {/* Bottom-centered "tap to enter" affordance. */}
          <motion.div
            className="relative z-10 mb-8 flex justify-center"
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={reduced ? { duration: 0 } : { duration: 0.6, delay: 0.5 }}
          >
            <span className="rounded-full border border-white/40 bg-white/5 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm md:text-xs">
              {promptText}
            </span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
