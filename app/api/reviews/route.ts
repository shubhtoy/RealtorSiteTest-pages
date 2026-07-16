import "server-only";

import { NextResponse } from "next/server";

import { isGoogleReviewsConfigured, serverEnv } from "@/lib/server-env";

// External fetch + secrets require the Node.js runtime (not Edge).
export const runtime = "nodejs";
// Cache the upstream result for an hour so we stay well under Places API quota.
export const revalidate = 3600;

type GoogleReview = {
  author_name?: string;
  rating?: number;
  text?: string;
  relative_time_description?: string;
  profile_photo_url?: string;
  author_url?: string;
};

type PlaceDetails = {
  result?: {
    reviews?: GoogleReview[];
    rating?: number;
    user_ratings_total?: number;
    url?: string;
  };
  status?: string;
  error_message?: string;
};

/**
 * Public read-only endpoint returning Google reviews for the configured Place.
 *
 * The API key is a server-only secret and never reaches the client — the
 * browser calls this route, which proxies the Google Places Details API. When
 * the integration is not configured it returns `configured: false` with an
 * empty list, so the reviews section simply hides itself.
 */
export async function GET() {
  if (!isGoogleReviewsConfigured()) {
    return NextResponse.json({ ok: true, configured: false, reviews: [] });
  }

  const params = new URLSearchParams({
    place_id: serverEnv.googlePlaceId,
    fields: "reviews,rating,user_ratings_total,url",
    reviews_sort: "newest",
    key: serverEnv.googlePlacesApiKey,
  });
  const url = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;

  try {
    const response = await fetch(url, { next: { revalidate } });
    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          configured: true,
          error: `Places API responded ${response.status}`,
          reviews: [],
        },
        { status: 502 },
      );
    }

    const data = (await response.json()) as PlaceDetails;
    if (data.status && data.status !== "OK") {
      return NextResponse.json(
        { ok: false, configured: true, error: data.error_message || data.status, reviews: [] },
        { status: 502 },
      );
    }

    const result = data.result ?? {};
    const reviews = (result.reviews ?? []).map((review) => ({
      author: review.author_name ?? "Google user",
      rating: typeof review.rating === "number" ? review.rating : 0,
      text: review.text ?? "",
      time: review.relative_time_description ?? "",
      photo: review.profile_photo_url ?? "",
      url: review.author_url ?? "",
    }));

    return NextResponse.json({
      ok: true,
      configured: true,
      rating: result.rating ?? null,
      total: result.user_ratings_total ?? null,
      url: result.url ?? null,
      reviews,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        error: error instanceof Error ? error.message : "Failed to fetch reviews",
        reviews: [],
      },
      { status: 500 },
    );
  }
}
