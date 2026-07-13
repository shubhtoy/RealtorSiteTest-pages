import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useEditableContent } from "@/context/EditableContentContext";

const WELCOME_SESSION_KEY = "baba.welcomeGate.seen";

export default function WelcomeGate() {
  const { current } = useEditableContent();
  const welcome = current.welcome;
  const reduced = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

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
        event.preventDefault();
        dialogRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [visible, dismiss]);

  const headingId = "welcome-gate-heading";
  const messageId = "welcome-gate-message";

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
          className="welcome-gate fixed inset-0 z-[130] flex cursor-pointer items-center justify-center outline-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.5, ease: "easeOut" } }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_24%,hsl(var(--primary)/0.18),transparent_36%),radial-gradient(circle_at_84%_78%,hsl(var(--accent)/0.18),transparent_40%),linear-gradient(160deg,hsl(var(--overlay-dark)),hsl(var(--overlay-dark)/0.96))]" />

          <motion.div
            className="relative z-10 flex w-[min(46rem,92vw)] flex-col items-center px-6 text-center"
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.25 } }}
          >
            <p className="mb-4 text-[0.6rem] font-semibold uppercase tracking-[0.26em] text-overlay-text/70 md:mb-6">
              {current.global.siteName}
            </p>
            <h1
              id={headingId}
              className="font-display text-4xl leading-tight tracking-[-0.03em] text-overlay-text md:text-6xl"
            >
              {welcome.heading}
            </h1>
            <p id={messageId} className="mt-5 max-w-2xl text-base text-overlay-text/80 md:text-lg">
              {welcome.message}
            </p>

            <motion.p
              className="mt-10 inline-flex items-center gap-2 rounded-full border border-overlay-text/25 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-overlay-text/80 md:text-sm"
              initial={{ opacity: reduced ? 1 : 0 }}
              animate={
                reduced
                  ? { opacity: 1 }
                  : { opacity: [0.55, 1, 0.55], transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }
              }
            >
              {welcome.prompt}
            </motion.p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
