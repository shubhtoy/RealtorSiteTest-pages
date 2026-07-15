"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useEditableContent } from "@/context/EditableContentContext";

export default function SiteFooter() {
  const { current } = useEditableContent();
  const global = current.global;
  const footerLinks = global.navLinks;

  return (
    <footer 
      data-editable="site-footer"
      data-props={JSON.stringify({
        siteName: global.siteName,
        description: global.description,
        footerBadges: global.footerBadges,
        phone: global.phone,
        email: global.email,
        addressLine: global.addressLine,
        hoursLine: global.hoursLine,
      })}
      className="border-t border-border bg-panel-gradient py-12 md:py-16"
    >
      <div className="mx-auto w-[min(1140px,92vw)]">
        <div className="grid gap-10 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-soft md:grid-cols-3 md:p-8">
          {/* Brand */}
          <div>
            <Link href="/" className="font-display text-2xl tracking-tight text-primary" data-prop="siteName">{global.siteName}</Link>
            <div className="mt-2 flex flex-wrap gap-2" data-prop="footerBadges">
              {global.footerBadges.map((badge) => (
                <Badge key={badge} variant="secondary">{badge}</Badge>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground" data-prop="description">
              {global.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-foreground">Quick Links</h4>
            <nav className="mt-4 flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-foreground">Contact</h4>
            <div className="mt-4 flex flex-col gap-3">
              <a href={`tel:${global.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                <Phone className="h-4 w-4 text-primary" />
                {global.phone}
              </a>
              <a href={`mailto:${global.email}`} className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                <Mail className="h-4 w-4 text-primary" />
                {global.email}
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {global.addressLine}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                {global.hoursLine}
              </div>
              {global.reviewsUrl && (
                <a
                  href={global.reviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Star className="h-4 w-4 text-primary" />
                  Read our Google Reviews
                </a>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-6" />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {global.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
