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

  // Reliable active-item detection: observe each text block and treat the block
  // whose center is nearest the viewport center as active. A centered rootMargin
  // band means a block only "activates" once it reaches the middle of the
  // screen, and the observer fires while scrolling in BOTH directions. This
  // replaces the fragile checkpoint / scroll-offset math entirely.
  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    const nodes = itemRefs.current;
    const indexByNode = new Map<Element, number>();
    nodes.forEach((node, index) => {
      if (node) {
        indexByNode.set(node, index);
      }
    });

    if (indexByNode.size === 0) {
      return;
    }

    // Indices whose center currently sits inside the viewport's center band.
    const inBand = new Set<number>();

    const pickActive = () => {
      // If nothing is in the band (e.g. a fast scroll skipped across a gap),
      // keep the last active item rather than flickering to the wrong one.
      if (inBand.size === 0) {
        return;
      }

      const viewportCenter = window.innerHeight / 2;
      let best = -1;
      let bestDistance = Number.POSITIVE_INFINITY;

      inBand.forEach((index) => {
        const node = nodes[index];
        if (!node) {
          return;
        }
        const rect = node.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });

      if (best !== -1) {
        setActiveIndex((prev) => (prev === best ? prev : best));
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = indexByNode.get(entry.target);
          if (index === undefined) {
            return;
          }
          if (entry.isIntersecting) {
            inBand.add(index);
          } else {
            inBand.delete(index);
          }
        });
        pickActive();
      },
      // Shrink the observer root to a thin band at the vertical center so a
      // block is only considered active while it passes through the middle.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    indexByNode.forEach((_index, node) => observer.observe(node));

    return () => observer.disconnect();
  }, [cardLength]);

  const mediaTransition = reduced ? { duration: 0 } : { duration: 0.45, ease: EASE };
  const textTransition = reduced ? { duration: 0 } : { duration: 0.3, ease: EASE };

  // Crossfade stack: every item's media is layered; only the active one is
  // fully opaque. Reused for the mobile (top) and desktop (right) panels.
  const renderMedia = (heightClass: string) => (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-muted shadow-soft ring-1 ring-border/50",
        heightClass,
        contentClassName,
      )}
    >
      {content.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <motion.div
            key={item.title + index}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={mediaTransition}
            aria-hidden={!isActive}
            style={{ pointerEvents: isActive ? "auto" : "none" }}
          >
            {item.content ?? null}
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2 lg:gap-x-16">
      {/* Text column. On mobile a sticky media panel rides along at the top. */}
      <div>
        <div className="sticky top-20 z-10 mb-8 md:hidden">{renderMedia("h-56 sm:h-64")}</div>

        <div>
          {content.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={item.title + index}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                className="flex min-h-[44vh] flex-col justify-center py-8 md:min-h-[55vh]"
              >
                <motion.h3
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0.4 }}
                  transition={textTransition}
                  className="font-display text-2xl font-semibold text-foreground md:text-3xl"
                >
                  {item.title}
                </motion.h3>
                <motion.p
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0.4 }}
                  transition={textTransition}
                  className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground"
                >
                  {item.description}
                </motion.p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky media panel (desktop). */}
      <div className="hidden md:block">
        <div className="sticky top-24">{renderMedia("h-80 lg:h-[26rem]")}</div>
      </div>
    </div>
  );
};
