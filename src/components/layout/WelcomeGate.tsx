"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useEditableContent } from "@/context/EditableContentContext";

const WELCOME_SESSION_KEY = "baba.welcomeGate.seen";

// Background photo for the hero, with a graceful fallback if it fails to load.
const PRIMARY_BG = "/images/exterior.jpg";
const FALLBACK_BG = "/images/aerial.jpg";

// Minimum upward travel (px) of a touch gesture that counts as "swipe up to enter".
const SWIPE_UP_THRESHOLD = 30;

export default function WelcomeGate() {
  const { current } = useEditableContent();
  const welcome = current.welcome;
  const reduced = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [bgSrc, setBgSrc] = useState<string>(PRIMARY_BG);

  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(WELCOME_SESSION_KEY) !== "1";
    } catch {
      return false;
    }
  });

  const dismiss = useCallback(() => {
    setVisible((wasVisible) => {
      if (!wasVisible) return wasVisible;
      try {
        window.sessionStorage.setItem(WELCOME_SESSION_KEY, "1");
      } catch {
        /* ignore storage errors (private mode / quota) */
      }
      return false;
    });
  }, []);

  // While open: lock body scroll, trap + manage focus, and listen for every
  // "enter the site" gesture (keyboard, wheel/scroll, touch swipe up). Clicks/
  // taps are handled inline on the overlay and the scroll affordance.
  useEffect(() => {
    if (!visible) return;

    previouslyFocused.current = (document.activeElement as HTMLElement) ?? null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" ||
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "Spacebar"
      ) {
        event.preventDefault();
        dismiss();
      } else if (event.key === "Tab") {
        // Modal: keep focus on the dialog surface itself.
        event.preventDefault();
        dialogRef.current?.focus();
      }
    };

    const onWheel = () => dismiss();

    let touchStartY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY ?? 0;
      if (touchStartY - currentY > SWIPE_UP_THRESHOLD) dismiss();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [visible, dismiss]);

  const headingId = "welcome-gate-heading";
  const messageId = "welcome-gate-message";
  const promptText = welcome.prompt || "Scroll to explore";

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          aria-describedby={messageId}
          tabIndex={-1}
          onClick={dismiss}
          className="welcome-gate fixed inset-0 z-[130] h-[100svh] w-screen cursor-pointer overflow-hidden bg-overlay-dark outline-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: reduced ? 0 : -20,
            transition: { duration: reduced ? 0 : 0.5, ease: "easeInOut" },
          }}
        >
          {/* Full-bleed background photo with a slow ken-burns zoom. */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: reduced ? 1 : 1.06 }}
            transition={reduced ? { duration: 0 } : { duration: 12, ease: "easeOut" }}
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

          {/* Legibility scrim: a slight overall darken + bottom-weighted gradient. */}
          <div className="pointer-events-none absolute inset-0 bg-overlay-dark/30" />
          <div className="pointer-events-none absolute inset-0 bg-hero-fade" />

          {/* Reading content, anchored lower-left, sitting directly on the photo. */}
          <motion.div
            className="relative z-10 flex h-full flex-col justify-end px-6 pb-32 md:px-16 md:pb-28 lg:px-24"
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                duration: reduced ? 0 : 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: reduced ? 0 : 0.1,
              },
            }}
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

          {/* Bottom-centered "scroll to explore" affordance with a looping chevron. */}
          <motion.button
            type="button"
            onClick={dismiss}
            className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 rounded-md px-4 py-2 text-white/85 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={{
              opacity: 1,
              transition: { duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.5 },
            }}
          >
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] md:text-xs">
              {promptText}
            </span>
            <motion.span
              className="flex"
              animate={reduced ? { y: 0 } : { y: [0, 8, 0] }}
              transition={
                reduced ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <ChevronDown className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </motion.span>
          </motion.button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
