"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { appEnv } from "@/config/env";
import { Reveal } from "@/lib/motion";
import { useEditableContent } from "@/context/EditableContentContext";

type Review = {
  author: string;
  rating: number;
  text: string;
  time: string;
  photo?: string;
};

type ReviewsResponse = {
  reviews?: Review[];
  rating?: number | null;
  total?: number | null;
  url?: string | null;
};

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className="flex" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < rounded ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

/**
 * Google reviews section. Fetches the server-proxied Places reviews and renders
 * them as cards. If the integration is not configured (or returns no reviews)
 * the component renders nothing, so the page is unaffected until a
 * GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID are set.
 */
export function GoogleReviews() {
  const { current } = useEditableContent();
  const embedUrl = appEnv.reviewsEmbedUrl;
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // A keyless widget embed is configured — no API fetch needed.
    if (embedUrl) {
      setLoaded(true);
      return;
    }
    let active = true;
    fetch(`${appEnv.apiOrigin}/api/reviews`)
      .then((res) => res.json())
      .then((json: ReviewsResponse) => {
        if (active) {
          setData(json);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [embedUrl]);

  // Preferred keyless path: render a free Google-reviews widget in an iframe.
  if (embedUrl) {
    return (
      <section className="bg-background py-12 md:py-24">
        <div className="mx-auto w-[min(1140px,92vw)]">
          <Reveal className="mb-8 text-center">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-accent">Google Reviews</p>
            <h2 className="mt-2 font-display text-[1.9rem] leading-[1.08] md:text-5xl">What residents say on Google</h2>
          </Reveal>
          <iframe
            src={embedUrl}
            title="Google reviews"
            loading="lazy"
            className="h-[560px] w-full rounded-2xl border border-border/60 bg-background"
          />
          {current.global.reviewsUrl ? (
            <div className="mt-8 text-center">
              <a
                href={current.global.reviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-primary/45 px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary transition hover:-translate-y-0.5 hover:bg-primary/10"
              >
                Read all reviews on Google
              </a>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  const reviews = data?.reviews ?? [];
  if (!loaded || reviews.length === 0) return null;

  const link = data?.url || current.global.reviewsUrl;

  return (
    <section className="bg-background py-12 md:py-24">
      <div className="mx-auto w-[min(1140px,92vw)]">
        <Reveal className="mb-8 text-center">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-accent">Google Reviews</p>
          <h2 className="mt-2 font-display text-[1.9rem] leading-[1.08] md:text-5xl">What residents say on Google</h2>
          {typeof data?.rating === "number" ? (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Stars value={data.rating} />
              <span className="font-semibold text-foreground">{data.rating.toFixed(1)}</span>
              {typeof data.total === "number" ? <span>· {data.total} reviews</span> : null}
            </div>
          ) : null}
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((review, index) => (
            <article
              key={`${review.author}-${index}`}
              className="flex h-full flex-col rounded-2xl border border-border/70 bg-card-gradient p-5 shadow-soft"
            >
              <div className="flex items-center gap-3">
                {review.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- external Google avatar URL, not optimizable
                  <img
                    src={review.photo}
                    alt=""
                    width={40}
                    height={40}
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{review.author}</p>
                  {review.time ? <p className="text-xs text-muted-foreground">{review.time}</p> : null}
                </div>
              </div>
              <div className="mt-3">
                <Stars value={review.rating} />
              </div>
              <p className="mt-3 line-clamp-6 text-sm leading-relaxed text-muted-foreground">{review.text}</p>
            </article>
          ))}
        </div>

        {link ? (
          <div className="mt-8 text-center">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-primary/45 px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary transition hover:-translate-y-0.5 hover:bg-primary/10"
            >
              Read all reviews on Google
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
