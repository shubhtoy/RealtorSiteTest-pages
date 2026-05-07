import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Link } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { Reveal } from "@/lib/motion";
import { setPageMeta } from "@/lib/seo";
import { OptimizedImage } from "@/components/media/OptimizedImage";
import { useEditableContent } from "@/context/EditableContentContext";
import { resolveAppHref } from "@/lib/utils";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const categories = ["All", "Exterior", "Interiors", "Amenities", "Floor Plans"] as const;
type Category = (typeof categories)[number];

export default function GalleryPage() {
  const { current } = useEditableContent();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  useEffect(() => {
    setPageMeta({
      title: `${current.global.siteName} Gallery ${current.global.cityLabel}`,
      description: `Explore interior, exterior, amenity, and floor plan photos from ${current.global.siteName} apartments in ${current.global.cityLabel}.`,
      canonicalPath: "/gallery",
      ogImage: "/images/banner.png",
    });
  }, [current.global.cityLabel, current.global.siteName]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return current.gallery.items;
    return current.gallery.items.filter((item) => item.category === activeCategory);
  }, [activeCategory, current.gallery.items]);

  useEffect(() => {
    setLightboxIndex(-1);
  }, [activeCategory]);

  const lightboxSlides = useMemo(
    () =>
      filteredItems.map((item) => ({
        src: resolveAppHref(item.src),
        alt: item.alt,
        title: item.label,
        description: item.category,
      })),
    [filteredItems],
  );

  return (
    <main id="main-content" className="bg-body-mesh">
      {current.gallery.sectionVisibility.hero ? <section ref={heroRef} className="relative min-h-[46svh] overflow-hidden md:min-h-[52svh]">
        <motion.div style={{ y: reducedMotion ? 0 : heroY }} className="absolute inset-0 h-[116%] w-full">
          <OptimizedImage
            src={current.gallery.heroImage}
            alt={`${current.global.siteName} gallery hero`}
            className="absolute inset-0 h-full w-full object-cover"
            sizes="100vw"
            loading="eager"
          />
        </motion.div>
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="absolute inset-0 bg-hero-radials" />
        <div className="relative z-10 mx-auto flex min-h-[46svh] w-[min(1140px,92vw)] items-end pb-10 pt-16 md:min-h-[52svh] md:pb-14 md:pt-20">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary">{current.gallery.heroEyebrow}</p>
              <h1 className="mt-3 font-display text-3xl text-overlay-text sm:text-4xl md:text-6xl">{current.gallery.heroTitle}</h1>
              <p className="mt-3 text-sm text-overlay-text/85 md:mt-4 md:text-base">{current.gallery.heroDescription}</p>
            </div>
          </Reveal>
        </div>
      </section> : null}

      {current.gallery.sectionVisibility.media ? <section className="py-16 md:py-24">
        <div className="mx-auto w-[min(1140px,92vw)]">
          <Reveal>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`inline-flex items-center justify-center rounded-full px-3 py-2.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] transition-colors sm:px-4 sm:py-2 sm:text-[0.68rem] sm:tracking-[0.14em] ${
                    activeCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, index) => {
              const isVideo = item.type === "video" || /\.(mp4|webm|ogg)$/i.test(item.src);
              const isSvg = /\.svg$/i.test(item.src);
              return (
                <figure
                  key={`${item.src}-${item.label}`}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/60"
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${item.label} in lightbox`}
                  onClick={() => !isVideo && setLightboxIndex(index)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !isVideo) {
                      e.preventDefault();
                      setLightboxIndex(index);
                    }
                  }}
                >
                  {isVideo ? (
                    <video
                      src={resolveAppHref(item.src)}
                      muted
                      loop
                      playsInline
                      autoPlay
                      className="h-64 w-full object-cover md:h-72"
                    />
                  ) : isSvg ? (
                    <img
                      src={resolveAppHref(item.src)}
                      alt={item.alt}
                      loading="lazy"
                      className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.04] md:h-72"
                    />
                  ) : (
                    <OptimizedImage
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.04] md:h-72"
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-overlay-card-fade" />
                  <figcaption className="absolute bottom-0 z-10 px-3 py-3 text-xs font-semibold uppercase tracking-widest text-overlay-text">
                    {item.label}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section> : null}

      {current.gallery.sectionVisibility.cta ? <section className="py-16 md:py-24">
        <div className="mx-auto w-[min(1140px,92vw)]">
          <Reveal>
            <div className="rounded-2xl border border-border bg-panel-gradient p-5 shadow-soft md:p-8">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-accent">{current.gallery.cta.eyebrow}</p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl md:text-5xl">{current.gallery.cta.title}</h2>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                {current.gallery.cta.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={resolveAppHref(current.gallery.cta.primary.link)}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-soft-lg"
                >
                  {current.gallery.cta.primary.text}
                </a>
                <Link
                  to={current.gallery.cta.secondary.link}
                  className="inline-flex items-center justify-center rounded-full border border-primary/60 px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary transition hover:-translate-y-0.5 hover:bg-primary/8"
                >
                  {current.gallery.cta.secondary.text}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section> : null}

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex >= 0 ? lightboxIndex : 0}
        slides={lightboxSlides}
        plugins={[Captions, Counter, Thumbnails, Zoom]}
        captions={{ descriptionTextAlign: "center" }}
        counter={{ container: { style: { top: 18, left: 18 } } }}
        thumbnails={{ position: "bottom", border: 0, borderRadius: 10, gap: 10 }}
        zoom={{ maxZoomPixelRatio: 3, zoomInMultiplier: 2 }}
      />
    </main>
  );
}
