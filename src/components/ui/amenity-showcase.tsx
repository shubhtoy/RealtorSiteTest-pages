"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type AmenityShowcaseItem = {
  title: string;
  description: string;
  content?: React.ReactNode;
};

/**
 * Amenities showcase: a tabbed feature panel. The visitor picks an amenity from
 * the list and the large media panel crossfades to it. This replaces the older
 * scroll-linked "sticky reveal" (which rendered inconsistently and felt janky)
 * with a click-driven interaction that always renders correctly and reads well
 * on every viewport.
 */
export function AmenityShowcase({
  items,
  className,
}: {
  items: AmenityShowcaseItem[];
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  if (items.length === 0) return null;
  const currentItem = items[active] ?? items[0];

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:items-center md:gap-10 lg:gap-14",
        className,
      )}
    >
      {/* Tab list: horizontal scroll on mobile, vertical stack on desktop. */}
      <div
        role="tablist"
        aria-label="Amenities"
        className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-2.5 md:overflow-visible md:pb-0"
      >
        {items.map((item, index) => {
          const isActive = index === active;
          return (
            <button
              key={item.title + index}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(index)}
              className={cn(
                "group relative shrink-0 rounded-2xl border px-5 py-4 text-left transition-colors md:shrink",
                isActive
                  ? "border-primary/40 bg-primary/[0.06] shadow-soft"
                  : "border-border/60 bg-card/50 hover:border-border hover:bg-card",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="amenity-active-bar"
                  className="absolute inset-y-3 left-0 hidden w-1 rounded-full bg-primary md:block"
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
                />
              ) : null}
              <span
                className={cn(
                  "font-display text-base font-semibold transition-colors md:text-lg",
                  isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {item.title}
              </span>
              <span
                className={cn(
                  "mt-1 hidden text-sm leading-relaxed md:block",
                  isActive ? "text-muted-foreground" : "text-muted-foreground/70",
                )}
              >
                {item.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Media panel: fixed-height, sized parent so the fill image renders. */}
      <div className="relative h-72 w-full overflow-hidden rounded-3xl bg-muted shadow-soft-lg ring-1 ring-border/50 sm:h-80 md:h-[30rem] lg:h-[34rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="absolute inset-0"
            initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {currentItem.content ?? null}
          </motion.div>
        </AnimatePresence>

        {/* Caption over the photo — shown on mobile where tab descriptions are hidden. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-5 md:hidden">
          <p className="text-sm leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
            {currentItem.description}
          </p>
        </div>
      </div>
    </div>
  );
}
