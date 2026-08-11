"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import Link from "next/link";
import { toast } from "sonner";
import { Reveal } from "@/lib/motion";
import { setPageMeta } from "@/lib/seo";
import { validateField, validators } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { useEditableContent } from "@/context/EditableContentContext";

const INITIAL_CONTACT_FORM = {
  fullName: "",
  email: "",
  phone: "",
  bedroom: "2BR",
  moveIn: "Within 30 days",
  tourType: "In-person",
  message: "",
};

export default function ContactPage() {
  const { current } = useEditableContent();
  const heroRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  const [form, setForm] = useState(INITIAL_CONTACT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fieldRules: Record<string, ReturnType<typeof validators.required>[]> = {
    fullName: [validators.required("Full name")],
    email: [validators.required("Email"), validators.email()],
    phone: [validators.required("Phone"), validators.phone()],
  };

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(form[field as keyof typeof form], fieldRules[field] ?? []);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateAll = (): boolean => {
    const next: Record<string, string | null> = {};
    let valid = true;
    for (const field of Object.keys(fieldRules)) {
      const error = validateField(form[field as keyof typeof form], fieldRules[field]);
      next[field] = error;
      if (error) valid = false;
    }
    setErrors(next);
    setTouched({ fullName: true, email: true, phone: true });
    return valid;
  };

  useEffect(() => {
    setPageMeta({
      title: `Contact ${current.global.siteName} Leasing`,
      description: `Request a tour, ask about availability, and contact the ${current.global.siteName} leasing team in ${current.global.cityLabel}.`,
      canonicalPath: "/contact",
      ogImage: "/images/banner.png",
    });
  }, [current.global.cityLabel, current.global.siteName]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateAll()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          form,
          submittedAt: new Date().toISOString(),
          page: "contact",
          siteName: current.global.siteName,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        errors?: Record<string, string>;
      };

      if (response.status === 200) {
        // Persisted — delivered, or saved gracefully when no channel is configured.
        toast.success("Tour request sent", {
          description: "Leasing will follow up shortly to confirm availability.",
        });
        setForm(INITIAL_CONTACT_FORM);
        setErrors({});
        setTouched({});
      } else if (response.status === 207) {
        // Saved, but at least one delivery channel failed — the lead is still safe.
        toast.warning("Request saved — delivery issue", {
          description:
            result.message ?? "We saved your request, but a delivery channel failed. Leasing will still receive it.",
        });
        setForm(INITIAL_CONTACT_FORM);
        setErrors({});
        setTouched({});
      } else if (response.status === 429) {
        toast.error("Too many requests", {
          description: result.message ?? "You've sent several requests. Please wait a moment and try again.",
        });
      } else if (response.status === 400) {
        // Surface any server-side field errors inline (mirrors client validation).
        const fieldErrors = result.errors;
        if (fieldErrors) {
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
          const touchedUpdates: Record<string, boolean> = {};
          for (const field of Object.keys(fieldErrors)) touchedUpdates[field] = true;
          setTouched((prev) => ({ ...prev, ...touchedUpdates }));
        }
        toast.error("Please check your details", {
          description: result.message ?? "Some fields need attention before we can send your request.",
        });
      } else {
        toast.error("Unable to send request", {
          description: result.message ?? "Something went wrong. Please try again later.",
        });
      }
    } catch {
      toast.error("Server unavailable", {
        description: "We couldn't reach the server. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const setSelect = (key: string) => (value: string | null) => {
    if (value === null) return;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const inputCls = "h-11";
  const labelCls = "text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-accent";

  return (
    <main id="main-content" className="bg-body-mesh">
      {/* Hero */}
      {current.contact.sectionVisibility.hero ? <section ref={heroRef} data-studio-section="ContactHero" className="relative min-h-[62svh] overflow-hidden md:min-h-[68svh]">
        <motion.div style={{ y: reduced ? 0 : heroY }} className="absolute inset-0 h-[115%] w-full">
          <OptimizedImage
            src={current.contact.heroImage}
            alt={`${current.global.siteName} exterior`}
            className="absolute inset-0 h-full w-full object-cover"
            sizes="100vw"
            loading="eager"
          />
        </motion.div>
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="absolute inset-0 bg-hero-radials" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-fade-top" />

        <div className="relative z-10 mx-auto flex min-h-[62svh] w-[min(1140px,92vw)] flex-col justify-end gap-6 pb-10 pt-16 md:min-h-[68svh] md:flex-row md:items-end md:gap-8 md:pb-12 md:pt-20">
          <Reveal className="flex-1">
            <div className="max-w-[640px]">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-primary">{current.contact.heroEyebrow}</p>
              <h1 className="mt-2 font-display text-2xl leading-[1.08] text-overlay-text sm:text-3xl md:text-5xl">{current.contact.heroTitle}</h1>
              <p className="mt-3 text-sm text-overlay-text/85 md:text-base">{current.contact.heroDescription}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={`tel:${current.global.phone.replace(/\D/g, "")}`} className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-overlay-text px-4 py-2 text-[0.64rem] font-extrabold uppercase tracking-[0.12em] text-overlay-dark shadow-soft transition hover:-translate-y-0.5 hover:shadow-soft-lg sm:px-5 sm:py-2.5 sm:text-[0.72rem] sm:tracking-[0.14em]">{current.contact.ui.callButtonPrefix} {current.global.phone}</a>
                <Link href="/gallery" className="inline-flex min-h-[44px] items-center justify-center rounded-full border-[1.5px] border-overlay-text/40 px-4 py-2 text-[0.64rem] font-extrabold uppercase tracking-[0.12em] text-overlay-text transition hover:-translate-y-0.5 hover:bg-overlay-text/10 sm:px-5 sm:py-2.5 sm:text-[0.72rem] sm:tracking-[0.14em]">{current.contact.ui.browseButtonText}</Link>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="w-full md:w-auto">
            <div className="max-w-[340px] rounded-2xl border border-overlay-text/12 bg-overlay-dark/30 p-5 shadow-glass backdrop-blur-xl">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-primary">Leasing Desk</p>
              <h2 className="mt-1 font-display text-xl text-overlay-text">{current.contact.officeHoursTitle}</h2>
              <ul className="mt-3 space-y-1 pl-4 text-[0.9rem] leading-relaxed text-overlay-text/80">
                {current.contact.officeHours.map((line) => (
                  <li key={line}><Badge variant="secondary" className="bg-overlay-text/15 text-overlay-text border-overlay-text/20">{line}</Badge></li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section> : null}

      {/* Form Section */}
      {current.contact.sectionVisibility.form ? <section className="py-16 md:py-24">
        <div className="mx-auto grid w-[min(1140px,92vw)] items-start gap-6 md:grid-cols-2">
          <Reveal>
            <Card className="border border-border bg-panel-gradient shadow-soft">
              <CardHeader>
                <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-accent">{current.contact.ui.formEyebrow}</p>
                <CardTitle className="mt-2 font-display text-2xl md:text-3xl">{current.contact.tourFormTitle}</CardTitle>
                <CardDescription className="mt-1 text-base text-muted-foreground">
                  {current.contact.tourFormDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1.5 pl-5 text-foreground">
                  {current.contact.ui.infoBullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Separator className="my-5" />
                <div className="flex flex-wrap gap-2">
                  {current.contact.ui.featureBadges.map((badge) => (
                    <Badge key={badge} variant="secondary">{badge}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.12}>
            <form className="grid gap-4 rounded-2xl border border-border bg-panel-gradient p-6 shadow-soft" onSubmit={handleSubmit}>
              <div className="grid gap-1">
                <Label htmlFor="fullName" className={labelCls}>{current.contact.ui.labels.fullName}</Label>
                <Input id="fullName" className={inputCls} value={form.fullName} onChange={set("fullName")} onBlur={handleBlur("fullName")} type="text" required placeholder={current.contact.ui.placeholders.fullName} aria-describedby={errors.fullName && touched.fullName ? "fullName-error" : undefined} />
                {touched.fullName && errors.fullName && <span id="fullName-error" className="text-xs text-red-500">{errors.fullName}</span>}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <Label htmlFor="email" className={labelCls}>{current.contact.ui.labels.email}</Label>
                  <Input id="email" className={inputCls} value={form.email} onChange={set("email")} onBlur={handleBlur("email")} type="email" required placeholder={current.contact.ui.placeholders.email} aria-describedby={errors.email && touched.email ? "email-error" : undefined} />
                  {touched.email && errors.email && <span id="email-error" className="text-xs text-red-500">{errors.email}</span>}
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="phone" className={labelCls}>{current.contact.ui.labels.phone}</Label>
                  <Input id="phone" className={inputCls} value={form.phone} onChange={set("phone")} onBlur={handleBlur("phone")} type="tel" required placeholder={current.contact.ui.placeholders.phone} aria-describedby={errors.phone && touched.phone ? "phone-error" : undefined} />
                  {touched.phone && errors.phone && <span id="phone-error" className="text-xs text-red-500">{errors.phone}</span>}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <Label htmlFor="bedroom" className={labelCls}>{current.contact.ui.labels.bedroomType}</Label>
                  <Select value={form.bedroom} onValueChange={setSelect("bedroom")}>
                    <SelectTrigger id="bedroom" className={inputCls}>
                      <SelectValue placeholder="Select bedroom" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {current.contact.formOptions.bedroom.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="moveIn" className={labelCls}>{current.contact.ui.labels.moveIn}</Label>
                  <Select value={form.moveIn} onValueChange={setSelect("moveIn")}>
                    <SelectTrigger id="moveIn" className={inputCls}>
                      <SelectValue placeholder="Select move-in timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {current.contact.formOptions.moveIn.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="tourType" className={labelCls}>{current.contact.ui.labels.tourPreference}</Label>
                <Select value={form.tourType} onValueChange={setSelect("tourType")}>
                  <SelectTrigger id="tourType" className={inputCls}>
                    <SelectValue placeholder="Select tour preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                        {current.contact.formOptions.tourType.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="message" className={labelCls}>{current.contact.ui.labels.message}</Label>
                <Textarea id="message" value={form.message} onChange={set("message")} rows={4} placeholder={current.contact.ui.placeholders.message} />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-soft-lg disabled:cursor-not-allowed disabled:opacity-70 sm:w-max sm:text-[0.72rem] sm:tracking-[0.14em]"
              >
                {isSubmitting ? "Sending..." : current.contact.submitText}
              </button>
            </form>
          </Reveal>
        </div>
      </section> : null}

      {current.contact.sectionVisibility.map ? (
        <section className="pb-16 md:pb-24">
          <div className="mx-auto w-[min(1140px,92vw)]">
            <Reveal>
              <div className="overflow-hidden rounded-2xl border border-border bg-panel-gradient shadow-soft">
                <iframe
                  src={current.contact.mapEmbedUrl}
                  title={`${current.global.siteName} map`}
                  className="h-[320px] w-full md:h-[420px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}
    </main>
  );
}
