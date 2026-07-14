"use client";

import { Link, NavLink } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { useEditableContent } from "@/context/EditableContentContext";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-xs font-bold uppercase tracking-[0.14em] transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`;

export default function SiteHeader() {
  const { current } = useEditableContent();
  const reduced = useReducedMotion();
  const navLinks = current.global.navLinks.map((link) => ({
    ...link,
    end: link.to === "/",
  }));

  return (
    <motion.header
      role="banner"
      data-editable="site-header"
      data-props={JSON.stringify({
        siteName: current.global.siteName,
        cityLabel: current.global.cityLabel,
        tagline: current.global.tagline,
        navCtaText: current.global.navCtaText,
        navCtaLink: current.global.navCtaLink,
      })}
      initial={reduced ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-background focus:px-4 focus:py-2 focus:text-foreground"
      >
        Skip to content
      </a>
      <div className="mx-auto flex w-[min(1140px,92vw)] flex-wrap items-center justify-between gap-3 py-2.5 md:py-3">
        <Link to="/" className="flex items-center gap-2">
          <span data-prop="siteName" className="font-display text-xl tracking-tight text-primary sm:text-2xl">{current.global.siteName}</span>
          <Badge data-prop="cityLabel" variant="secondary" className="hidden md:inline-flex">{current.global.cityLabel}</Badge>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            data-prop="cta"
            to={current.global.navCtaLink}
            className="inline-flex items-center justify-center rounded-full bg-primary px-3.5 py-2 min-h-[44px] whitespace-nowrap text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-soft-lg sm:px-4 sm:text-[0.65rem] sm:tracking-[0.14em]"
          >
            {current.global.navCtaText}
          </Link>
        </div>

        <nav className="flex w-full flex-wrap items-center justify-center gap-1.5 md:hidden" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <NavLink
              key={`mobile-${link.to}`}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-full px-2.5 py-2.5 min-h-[44px] inline-flex items-center text-[0.58rem] font-semibold uppercase tracking-[0.1em] transition-colors sm:px-3 sm:text-[0.62rem] sm:tracking-[0.12em] ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}
