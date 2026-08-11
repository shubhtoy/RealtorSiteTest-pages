"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { setPageMeta } from "@/lib/seo";
import { Reveal } from "@/lib/motion";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { FocusCards } from "@/components/ui/focus-cards";
import { AmenityShowcase } from "@/components/ui/amenity-showcase";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { useGoogleReviewItems } from "@/lib/use-google-reviews";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { AerialBand } from "@/components/media/AerialBand";
import { Building2, CarFront, PawPrint, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { useEditableContent } from "@/context/EditableContentContext";
import { resolveAppHref } from "@/lib/utils";

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.25 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const durationMs = 1800;
    const fps = 30;
    const totalFrames = Math.max(1, Math.round((durationMs / 1000) * fps));
    let frame = 0;

    const timer = setInterval(() => {
      frame += 1;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(value * eased);
      setCount(next >= value ? value : next);

      if (frame >= totalFrames) {
        clearInterval(timer);
      }
    }, 1000 / fps);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl text-primary md:text-5xl">
        {count}
        {suffix}
      </div>
      <p className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
    </div>
  );
}

export default function HomePage() {
  const { current } = useEditableContent();
  const home = current.home;
  const global = current.global;

  useEffect(() => {
    setPageMeta({
      title: `${global.siteName} ${global.seoTitleSuffix}`,
      description: global.description,
      canonicalPath: "/",
      ogImage: "/images/banner.png",
    });
  }, [global.description, global.seoTitleSuffix, global.siteName]);

  const amenitiesPanels = useMemo(
    () =>
      home.amenityPanels.map((panel) => ({
        title: panel.title,
        description: panel.description,
        content: <OptimizedImage src={panel.image} alt={panel.title} className="h-full w-full object-cover" sizes="(max-width: 768px) 92vw, (max-width: 1024px) 50vw, 24rem" />,
      })),
    [home.amenityPanels],
  );

  const movingTestimonials = useMemo(
    () =>
      home.testimonials.map((item) => ({
        quote: item.quote,
        name: item.name,
        title: item.designation,
      })),
    [home.testimonials],
  );

  const googleReviewItems = useGoogleReviewItems(
    home.reviews?.source === "google",
    home.reviews?.minRating ?? 4,
    home.reviews?.maxCount ?? 8,
  );
  const testimonialItems =
    home.reviews?.source === "google" && googleReviewItems && googleReviewItems.length > 0
      ? googleReviewItems
      : movingTestimonials;

  const heroRailProducts = useMemo(() => {
    const repeated = Array.from({ length: 15 }, (_, i) => {
      const image = home.hero.heroRailMedia[i % home.hero.heroRailMedia.length];
      return {
        title: `${global.siteName} View ${i + 1}`,
        link: "/gallery",
        thumbnail: image,
      };
    });
    return repeated;
  }, [global.siteName, home.hero.heroRailMedia]);

  const whyCards = useMemo(
    () =>
      home.whyCards.map((item) => {
        const icon =
          item.icon === "building" ? <Building2 className="h-5 w-5 text-primary" /> :
          item.icon === "paw" ? <PawPrint className="h-5 w-5 text-primary" /> :
          item.icon === "car" ? <CarFront className="h-5 w-5 text-primary" /> :
          item.icon === "map" ? <MapPin className="h-5 w-5 text-primary" /> :
          item.icon === "sparkles" ? <Sparkles className="h-5 w-5 text-primary" /> :
          <ShieldCheck className="h-5 w-5 text-primary" />;

        return {
          title: item.title,
          description: item.description,
          tag: item.tag,
          icon,
        };
      }),
    [home.whyCards],
  );

  const faqCategories = useMemo(() => {
    const cats: string[] = [];
    for (const item of home.faq) {
      if (!cats.includes(item.category)) cats.push(item.category);
    }
    return cats;
  }, [home.faq]);
  const [activeFaqCat, setActiveFaqCat] = useState<string>("");
  useEffect(() => { if (faqCategories.length && !activeFaqCat) setActiveFaqCat(faqCategories[0]); }, [faqCategories, activeFaqCat]);
  const filteredFaq = useMemo(() => home.faq.filter(f => f.category === activeFaqCat), [home.faq, activeFaqCat]);
  const defaultFaqValue = useMemo(() => ["item-0"], []);
  const eyebrowClass = "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-accent";
  const sectionTitleClass = "mt-2 font-display text-[1.9rem] leading-[1.08] md:text-5xl";
  const sectionCopyClass = "mx-auto mt-3 max-w-3xl text-[0.98rem] leading-relaxed text-muted-foreground md:text-[1.04rem]";
  const primaryButtonClass =
    "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 min-h-[44px] text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-soft-lg sm:px-6 sm:py-3 sm:text-[0.68rem] sm:tracking-[0.16em]";
  const secondaryButtonClass =
    "inline-flex items-center justify-center rounded-full border border-primary/45 px-5 py-2.5 min-h-[44px] text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-primary transition hover:-translate-y-0.5 hover:bg-primary/10 sm:px-6 sm:py-3 sm:text-[0.68rem] sm:tracking-[0.16em]";

  return (
    <div className="bg-body-mesh pb-24 md:pb-0">
      <section data-studio-section="HomeHero" className="relative overflow-hidden bg-background pb-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_72%)]" />
        <div className="relative z-30 mx-auto w-[min(1140px,92vw)] pt-14 md:pt-20">
          <Reveal>
            <div className="mx-auto max-w-4xl rounded-3xl border border-border/70 bg-card/90 p-4 text-center shadow-soft backdrop-blur md:p-8">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary">{home.hero.tagline}</p>
              <h1 className="mt-3 font-display text-3xl leading-[1.04] text-foreground sm:text-4xl md:text-6xl">
                {home.hero.title}
                <span className="block text-primary">{home.hero.highlightText}</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground md:text-[1.08rem]">
                {home.hero.description}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href={home.hero.primaryCta.link}
                  className={primaryButtonClass}
                >
                  {home.hero.primaryCta.text}
                </Link>
                <Link
                  href={home.hero.secondaryCta.link}
                  className={secondaryButtonClass}
                >
                  {home.hero.secondaryCta.text}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
        <div className="relative z-10 -mt-20 md:-mt-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-20 bg-gradient-to-b from-background to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-36 bg-gradient-to-t from-background via-background/90 to-transparent" />
          <HeroParallax
            products={heroRailProducts}
            showHeader={false}
            className="h-[94vh] py-6 md:h-[128vh] md:py-8"
            cardClassName="h-64 w-[17.5rem] sm:w-[20rem] md:h-96 md:w-[24rem]"
          />
        </div>
      </section>

      {home.sectionVisibility.stats ? <section data-studio-section="HomeStats" className="bg-background py-12 md:py-24">
        <div className="mx-auto grid w-[min(1140px,92vw)] grid-cols-2 gap-8 md:grid-cols-4">
          {home.stats.map((item) => (
            <StatCounter key={item.label} value={item.value} suffix={item.suffix} label={item.label} />
          ))}
        </div>
      </section> : null}

      {home.sectionVisibility.residences ? <section data-studio-section="HomeResidences" className="bg-background py-12 md:py-24">
        <div className="mx-auto w-[min(1140px,92vw)]">
          <Reveal className="mb-10 text-center">
            <p className={eyebrowClass}>{home.ui.residencesEyebrow}</p>
            <h2 className={sectionTitleClass}>{home.ui.residencesTitle}</h2>
            <p className={sectionCopyClass}>
              {home.ui.residencesDescription}
            </p>
          </Reveal>
          <FocusCards cards={home.focusCards} />
        </div>
      </section> : null}

      <AerialBand />

      {home.sectionVisibility.unitExplorer ? <section data-studio-section="HomeFloorPlans" className="bg-secondary/30 py-12 md:py-24">
        <div className="mx-auto w-[min(1140px,92vw)]">
          <Reveal className="mb-6 text-center">
            <p className={eyebrowClass}>{home.ui.unitExplorerEyebrow}</p>
            <h2 className={sectionTitleClass}>{home.ui.unitExplorerTitle}</h2>
            <p className={sectionCopyClass}>
              {home.ui.unitExplorerDescription}
            </p>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {home.floorPlans.map((unit) => (
              <CardContainer key={unit.title} containerClassName="py-0" className="w-full">
                <CardBody className="h-auto w-full">
                  <CardItem translateZ={50} className="w-full">
              <article
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card-gradient p-4 shadow-soft transition duration-200 hover:shadow-soft-lg md:p-5"
              >
                <OptimizedImage
                  src={unit.image}
                  alt={unit.title}
                  className="h-44 w-full rounded-xl object-cover md:h-52"
                  sizes="(max-width: 768px) 92vw, (max-width: 1024px) 30vw, 33vw"
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="min-w-0 break-words font-display text-xl leading-tight text-foreground">{unit.title}</h3>
                  <Badge variant="secondary" className="shrink-0 font-bold uppercase tracking-wider">
                    {unit.sqft}
                  </Badge>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]">{unit.description}</p>

                <ul className="mt-4 space-y-1.5 text-sm text-foreground/85">
                  {unit.features.slice(0, 2).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-auto pt-4 text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-accent">
                  {unit.priceRange}
                </p>

                <Link
                  href={resolveAppHref("/contact")}
                  className="group/cta mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5"
                >
                  Schedule a tour
                  <span aria-hidden className="transition-transform group-hover/cta:translate-x-0.5">→</span>
                </Link>
              </article>
                  </CardItem>
                </CardBody>
              </CardContainer>
            ))}
          </div>
        </div>
      </section> : null}

      {home.sectionVisibility.amenities ? <section data-studio-section="HomeAmenities" className="bg-background py-12 md:py-24">
        <div className="mx-auto w-[min(1140px,92vw)]">
          <Reveal className="mb-8 text-center">
            <p className={eyebrowClass}>{home.ui.amenitiesEyebrow}</p>
            <h2 className={sectionTitleClass}>{home.ui.amenitiesTitle}</h2>
            <p className={sectionCopyClass}>
              {home.ui.amenitiesDescription}
            </p>
          </Reveal>
          <AmenityShowcase items={amenitiesPanels} />
        </div>
      </section> : null}

      {home.sectionVisibility.why ? <section data-studio-section="HomeWhy" className="bg-background py-12 md:py-24">
        <div className="mx-auto w-[min(1140px,92vw)]">
          <Reveal className="mb-4 text-center">
            <p className={eyebrowClass}>{home.ui.whyEyebrow}</p>
            <h2 className={sectionTitleClass}>{home.ui.whyTitle}</h2>
            <p className={sectionCopyClass}>
              {home.ui.whyDescription}
            </p>
          </Reveal>
          <div className="grid items-start gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-10">
            <div className="rounded-3xl bg-[linear-gradient(145deg,hsl(var(--primary)/0.16),hsl(var(--accent)/0.1),transparent)] p-6 md:sticky md:top-24 md:p-8">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-accent">{home.ui.whyStickyEyebrow}</p>
              <h3 className="mt-2 font-display text-2xl leading-tight md:text-3xl">
                {home.ui.whyStickyTitle}
              </h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                {home.ui.whyStickyDescription}
              </p>
              <div className="mt-5 overflow-hidden rounded-2xl">
                <OptimizedImage
                  src={home.hero.heroRailMedia[1] ?? home.hero.heroRailMedia[0]}
                  alt="Baba Flats lifestyle"
                  className="h-56 w-full object-cover"
                  sizes="(max-width: 768px) 92vw, (max-width: 1024px) 40vw, 34vw"
                />
              </div>
            </div>

            <div className="space-y-1">
              {whyCards.map((item) => (
                <article key={item.title} className="border-b border-border/55 py-5 first:pt-0 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded-full bg-primary/12 p-2 text-primary">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-display text-[1.06rem] leading-tight text-foreground">{item.title}</h4>
                        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-accent/90">{item.tag}</span>
                      </div>
                      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section> : null}

      {home.sectionVisibility.neighborhood ? <section data-studio-section="HomeNeighborhood" className="bg-secondary/30 py-12 md:py-24">
        <div className="mx-auto w-[min(1140px,92vw)]">
          <Reveal className="mb-8 text-center">
            <p className={eyebrowClass}>{home.neighborhood.eyebrow}</p>
            <h2 className={sectionTitleClass}>{home.neighborhood.title}</h2>
            <p className={sectionCopyClass}>{home.neighborhood.description}</p>
          </Reveal>
          <div className="grid items-start gap-8 md:grid-cols-[0.88fr_1.12fr] md:gap-10">
            <div className="rounded-3xl bg-[linear-gradient(145deg,hsl(var(--primary)/0.16),hsl(var(--accent)/0.1),transparent)] p-6 md:sticky md:top-24 md:p-8">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-accent">{home.ui.neighborhoodStickyEyebrow}</p>
              <h3 className="mt-2 font-display text-2xl leading-tight md:text-3xl">{home.ui.neighborhoodStickyTitle}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                {home.ui.neighborhoodStickyDescription}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {home.neighborhood.highlights.slice(0, 4).map((highlight) => (
                  <div key={`${highlight.title}-chip`} className="rounded-xl border border-border/70 bg-background/70 p-3">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-accent/90">
                      {highlight.distance ?? "Nearby"}
                    </p>
                    <p className="mt-1 text-sm font-medium leading-tight text-foreground">{highlight.title}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl">
                <OptimizedImage
                  src={home.hero.heroRailMedia[0]}
                  alt="Baba Flats neighborhood"
                  className="h-52 w-full object-cover"
                  sizes="(max-width: 768px) 92vw, (max-width: 1024px) 40vw, 34vw"
                />
              </div>
            </div>

            <div className="space-y-1">
              {home.neighborhood.highlights.map((highlight) => (
                <article key={highlight.title} className="border-b border-border/55 py-5 first:pt-0 last:border-b-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-[1.08rem] leading-tight text-foreground">{highlight.title}</h4>
                      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">{highlight.description}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 border-primary/25 bg-primary/6 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-primary">
                      {highlight.distance ?? "Nearby"}
                    </Badge>
                  </div>

                  <div className="mt-3 h-1.5 w-28 rounded-full bg-gradient-to-r from-primary/45 via-accent/35 to-transparent" />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section> : null}

      {home.sectionVisibility.testimonials ? <section data-studio-section="HomeTestimonials" className="bg-background py-12 md:py-24">
        <div className="mx-auto w-[min(1140px,92vw)]">
          <Reveal className="mb-6 text-center">
            <p className={eyebrowClass}>{home.ui.testimonialsEyebrow}</p>
            <h2 className={sectionTitleClass}>{home.ui.testimonialsTitle}</h2>
            <p className={sectionCopyClass}>
              {home.ui.testimonialsDescription}
            </p>
          </Reveal>
          <InfiniteMovingCards items={testimonialItems} speed="normal" pauseOnHover className="max-w-none py-2" />
        </div>
      </section> : null}

      {home.sectionVisibility.faq ? <section data-studio-section="HomeFaq" className="bg-background py-12 md:py-24">
        <div className="mx-auto w-[min(760px,92vw)]">
          <Reveal className="mb-8 text-center">
            <p className={eyebrowClass}>{home.ui.faqEyebrow}</p>
            <h2 className={sectionTitleClass}>{home.ui.faqTitle}</h2>
            <p className={sectionCopyClass}>
              {home.ui.faqDescription}
            </p>
          </Reveal>
          <div className="grid items-start gap-6 md:grid-cols-[0.85fr_1.15fr] md:gap-10">
            <div className="rounded-3xl bg-[linear-gradient(145deg,hsl(var(--primary)/0.14),transparent)] p-6 md:p-7">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-accent">{home.ui.faqHelpEyebrow}</p>
              <h3 className="mt-2 font-display text-2xl leading-tight">{home.ui.faqHelpTitle}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                {home.ui.faqHelpDescription}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={resolveAppHref(home.finalCta.primary.link)}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 min-h-[44px] text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-primary-foreground"
                >
                  {home.ui.faqHelpPrimaryLabel}
                </a>
                <Link
                  href={home.finalCta.secondary.link}
                  className="inline-flex items-center justify-center rounded-full border border-primary/35 px-4 py-2 min-h-[44px] text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-primary"
                >
                  {home.ui.faqHelpSecondaryLabel}
                </Link>
              </div>
            </div>

            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {faqCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFaqCat(cat)}
                    className={`rounded-full px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] transition ${activeFaqCat === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-muted"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <Accordion key={activeFaqCat} defaultValue={defaultFaqValue} className="border-t border-border">
                {filteredFaq.map((item, index) => (
                  <AccordionItem key={item.question} value={`item-${index}`} className="border-b border-border">
                    <AccordionTrigger className="py-4 text-base font-semibold leading-snug text-foreground hover:no-underline md:text-[1.02rem]">
                      <span className="text-left pr-2">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-[0.95rem] leading-relaxed text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section> : null}

      {home.sectionVisibility.map ? <section className="bg-secondary/30 py-12 md:py-24">
        <div className="mx-auto w-[min(1140px,92vw)]">
          <Reveal className="mb-8 text-center">
            <p className={eyebrowClass}>{home.ui.mapEyebrow}</p>
            <h2 className={sectionTitleClass}>{home.ui.mapTitle}</h2>
            <p className={sectionCopyClass}>
              {global.addressLine}. {home.ui.mapDescription}
            </p>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
            <div className="rounded-2xl border border-border/70 bg-card-gradient p-5 shadow-soft">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-accent">{home.ui.mapCardOfficeLabel}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{global.addressLine}</p>
              <p className="mt-4 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-accent">{home.ui.mapCardCallLabel}</p>
              <p className="mt-2 text-sm text-muted-foreground">{global.phone}</p>
              <p className="mt-4 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-accent">{home.ui.mapCardHoursLabel}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{global.hoursLine}</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/70 shadow-soft">
              <iframe
                src={current.contact.mapEmbedUrl}
                title="Baba Flats Map"
                className="h-[360px] w-full md:h-[420px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section> : null}

      {home.sectionVisibility.finalCta ? <section className="bg-background py-12 md:py-24">
        <div className="mx-auto w-[min(1140px,92vw)]">
          <div className="rounded-2xl border border-border bg-panel-gradient p-6 shadow-soft md:p-8">
            <p className={eyebrowClass}>{home.finalCta.tagline}</p>
            <h2 className="mt-2 font-display text-[1.9rem] leading-[1.08] md:text-4xl">{home.finalCta.title}</h2>
            <p className="mt-2 max-w-3xl text-muted-foreground">{home.finalCta.description}</p>
            <Separator className="my-5" />
            <div className="flex flex-wrap gap-3">
              <a
                href={resolveAppHref(home.finalCta.primary.link)}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 min-h-[44px] text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-soft-lg"
              >
                {home.finalCta.primary.text}
              </a>
              <Link
                href={home.finalCta.secondary.link}
                className="inline-flex items-center justify-center rounded-full border border-primary/60 px-5 py-2.5 min-h-[44px] text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary transition hover:-translate-y-0.5 hover:bg-primary/8"
              >
                {home.finalCta.secondary.text}
              </Link>
            </div>
          </div>
        </div>
      </section> : null}

      {home.sectionVisibility.mobileBar ? <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex w-[min(560px,96vw)] gap-2">
          <a
            href={resolveAppHref(home.finalCta.primary.link)}
            className="flex-1 rounded-full bg-primary px-4 py-3 min-h-[44px] inline-flex items-center justify-center text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-primary-foreground"
          >
            {home.ui.mobilePrimaryLabel}
          </a>
          <Link
            href={home.finalCta.secondary.link}
            className="flex-1 rounded-full border border-primary px-4 py-3 min-h-[44px] inline-flex items-center justify-center text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-primary"
          >
            {home.ui.mobileSecondaryLabel}
          </Link>
        </div>
      </div> : null}
    </div>
  );
}
