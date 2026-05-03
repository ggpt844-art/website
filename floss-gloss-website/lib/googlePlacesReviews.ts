/**
 * Google Place Details (legacy) — reviews field. Server-only; keep API key in env.
 * @see https://developers.google.com/maps/documentation/places/web-service/place-details
 */

export type PlaceReviewPublic = {
  authorName: string;
  rating: number;
  text: string;
  relativeTime: string;
  profilePhotoUrl: string | null;
};

export type PlaceReviewsResult = {
  reviews: PlaceReviewPublic[];
  rating: number | null;
  userRatingsTotal: number | null;
  listingUrl: string | null;
  source: "live" | "placeholder" | "error";
};

/**
 * Floss & Gloss Dentistry (265 Queen St S, Mississauga). Used when `GOOGLE_PLACE_ID` is unset
 * so live reviews work with only an API key in `.env.local`.
 */
const DEFAULT_GOOGLE_PLACE_ID = "ChIJV0jW9btBK4gRqI-ivKAw1Bg";

const MIN_REVIEW_CHARS = 32;

const PLACEHOLDER: PlaceReviewsResult = {
  reviews: [
    {
      authorName: "Placeholder patient",
      rating: 5,
      text: "Add GOOGLE_MAPS_API_KEY (or GOOGLE_PLACES_API_KEY) to .env.local with Places API enabled. Place ID defaults to this practice if unset. This card is layout-only until then.",
      relativeTime: "",
      profilePhotoUrl: null,
    },
    {
      authorName: "Connect Places API",
      rating: 5,
      text: "In Google Cloud, enable Places API, restrict your key (server IPs or localhost for dev), and use Place Details. Override GOOGLE_PLACE_ID only if this template is reused for another office.",
      relativeTime: "",
      profilePhotoUrl: null,
    },
    {
      authorName: "Premium layout",
      rating: 5,
      text: "Reviews pull from the same data patients see on Google — stars, text, and author show here automatically once configured.",
      relativeTime: "",
      profilePhotoUrl: null,
    },
  ],
  rating: 5,
  userRatingsTotal: null,
  listingUrl: null,
  source: "placeholder",
};

function mapReview(r: {
  author_name?: string;
  rating?: number;
  text?: string;
  relative_time_description?: string;
  profile_photo_url?: string;
}): PlaceReviewPublic {
  let text = (r.text ?? "").trim().replace(/\s+/g, " ");
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1).trim();
  }
  return {
    authorName: r.author_name ?? "Google user",
    rating: Math.min(5, Math.max(1, r.rating ?? 5)),
    text,
    relativeTime: r.relative_time_description ?? "",
    profilePhotoUrl: r.profile_photo_url ?? null,
  };
}

const DISPLAY_LIMIT = 6;

/** Prefer 4–5★ reviews with enough detail; stable sort for the grid. */
function selectReviewsForDisplay(reviews: PlaceReviewPublic[]): PlaceReviewPublic[] {
  const substantial = reviews.filter((r) => r.rating >= 4 && r.text.length >= MIN_REVIEW_CHARS);
  const pool =
    substantial.length >= 2 ? substantial : reviews.filter((r) => r.text.length > 0);

  return [...pool]
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.text.length - a.text.length;
    })
    .slice(0, DISPLAY_LIMIT);
}

function stripQuotes(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1).trim();
  }
  return t;
}

function resolveMapsApiKey(): string {
  const a = process.env.GOOGLE_PLACES_API_KEY;
  const b = process.env.GOOGLE_MAPS_API_KEY;
  return stripQuotes(a || b || "");
}

/** Place Details fetch is on unless ENABLE_GOOGLE_PLACES_SOURCE is false/0/no/off */
function isPlacesFetchEnabled(): boolean {
  const v = stripQuotes(process.env.ENABLE_GOOGLE_PLACES_SOURCE ?? "true").toLowerCase();
  return v !== "false" && v !== "0" && v !== "no" && v !== "off";
}

export async function fetchPlaceReviews(): Promise<PlaceReviewsResult> {
  const key = resolveMapsApiKey();
  const placeId = stripQuotes(process.env.GOOGLE_PLACE_ID ?? "") || DEFAULT_GOOGLE_PLACE_ID;

  if (!isPlacesFetchEnabled() || !key) {
    return { ...PLACEHOLDER, source: "placeholder" };
  }

  const fields = ["reviews", "rating", "user_ratings_total", "url", "name"].join(",");
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${encodeURIComponent(fields)}&key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = (await res.json()) as {
      status: string;
      error_message?: string;
      result?: {
        reviews?: Array<Record<string, unknown>>;
        rating?: number;
        user_ratings_total?: number;
        url?: string;
      };
    };

    if (data.status !== "OK" || !data.result) {
      console.warn("[fetchPlaceReviews]", data.status, data.error_message);
      return {
        ...PLACEHOLDER,
        source: "error",
      };
    }

    const raw = data.result.reviews ?? [];
    const mapped = raw
      .map((x) => mapReview(x as Parameters<typeof mapReview>[0]))
      .filter((r) => r.text.length > 0);
    const reviews = selectReviewsForDisplay(mapped);

    if (reviews.length === 0) {
      return {
        reviews: PLACEHOLDER.reviews.slice(0, 2),
        rating: data.result.rating ?? null,
        userRatingsTotal: data.result.user_ratings_total ?? null,
        listingUrl: data.result.url ?? null,
        source: "placeholder",
      };
    }

    return {
      reviews,
      rating: data.result.rating ?? null,
      userRatingsTotal: data.result.user_ratings_total ?? null,
      listingUrl: data.result.url ?? null,
      source: "live",
    };
  } catch (e) {
    console.warn("[fetchPlaceReviews] network error", e);
    return { ...PLACEHOLDER, source: "error" };
  }
}
