"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";

export function ParallaxImage({
  src,
  alt,
  className,
  speed = -0.15,
}: {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  return (
    <div ref={ref} className={className} style={{ overflow: "hidden" }}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y: reduced ? 0 : y }}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function ParallaxSection({
  bgSrc,
  bgAlt,
  children,
  speed = -0.12,
  className,
  id,
}: {
  bgSrc: string;
  bgAlt: string;
  children: ReactNode;
  speed?: number;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  return (
    <section ref={ref} id={id} className={`relative min-h-[92svh] overflow-hidden ${className ?? ""}`}>
      {/* Parallax background image */}
      <motion.img
        src={bgSrc}
        alt={bgAlt}
        style={{ y: reduced ? 0 : y }}
        className="absolute inset-0 h-[125%] w-full object-cover"
      />
      {/* Dark overlay: bottom-heavy gradient + warm radials */}
      <div className="absolute inset-0 bg-section-fade" />
      <div className="absolute inset-0 bg-section-radials" />
      {/* Feathered top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      {/* Feathered bottom edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      {/* Content */}
      <div className="relative z-10 flex min-h-[92svh] items-center py-16 md:py-24">
        <div className="mx-auto w-[min(1140px,92vw)]">{children}</div>
      </div>
    </section>
  );
}
