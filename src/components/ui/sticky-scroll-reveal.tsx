"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type StickyScrollItem = {
  title: string;
  description: string;
  content?: React.ReactNode;
};

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: StickyScrollItem[];
  contentClassName?: string;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const reduced = useReducedMotion();
  const cardLength = content.length;

  // Robust, simple active-item detection: on every scroll/resize (rAF-throttled)
  // pick the text block whose vertical center is closest to the viewport center.
  // This updates continuously in BOTH scroll directions and has no dead zones or
  // "nothing in band" edge cases (the failure mode of the observer approach).
  useEffect(() => {
    if (typeof window === "undefined") return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const viewportCenter = window.innerHeight / 2;
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let i = 0; i < itemRefs.current.length; i += 1) {
        const node = itemRefs.current[i];
        if (!node) continue;
        const rect = node.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      }

      setActiveIndex((prev) => (prev === best ? prev : best));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [cardLength]);

  const mediaTransition = reduced ? { duration: 0 } : { duration: 0.5, ease: EASE };
  const textTransition = reduced ? { duration: 0 } : { duration: 0.3, ease: EASE };

  // Crossfade stack: every item's media is layered; only the active one is fully
  // opaque. Reused by the mobile (top, sticky) and desktop (right, sticky) panels.
  const renderMedia = (heightClass: string) => (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-muted shadow-soft ring-1 ring-border/50",
        heightClass,
        contentClassName,
      )}
    >
      {content.map((item, index) => (
        <motion.div
          key={item.title + index}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: index === activeIndex ? 1 : 0 }}
          transition={mediaTransition}
          aria-hidden={index !== activeIndex}
          style={{ pointerEvents: index === activeIndex ? "auto" : "none" }}
        >
          {item.content ?? null}
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2 lg:gap-x-16">
      {/* Text column. On mobile a sticky media panel rides along at the top. */}
      <div>
        <div className="sticky top-20 z-10 mb-8 md:hidden">{renderMedia("h-56 sm:h-64")}</div>

        {content.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={item.title + index}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className="flex min-h-[48vh] flex-col justify-center py-8 md:min-h-[60vh]"
            >
              <motion.h3
                initial={false}
                animate={{ opacity: isActive ? 1 : 0.35 }}
                transition={textTransition}
                className="font-display text-2xl font-semibold text-foreground md:text-3xl"
              >
                {item.title}
              </motion.h3>
              <motion.p
                initial={false}
                animate={{ opacity: isActive ? 1 : 0.35 }}
                transition={textTransition}
                className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground"
              >
                {item.description}
              </motion.p>
            </div>
          );
        })}
      </div>

      {/* Sticky media panel (desktop). */}
      <div className="hidden md:block">
        <div className="sticky top-24">{renderMedia("h-80 lg:h-[26rem]")}</div>
      </div>
    </div>
  );
};
