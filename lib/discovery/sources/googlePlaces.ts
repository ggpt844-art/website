/**
 * Google Places API (New) — Text Search. Server-side only; uses GOOGLE_MAPS_API_KEY.
 * https://developers.google.com/maps/documentation/places/web-service/text-search
 */
import { APP_CONFIG } from "@/lib/utils/config";
import type { DiscoveredBusiness, DiscoverySource, DiscoverySourceContext } from "../types";

const PLACES_TEXT_SEARCH = "https://places.googleapis.com/v1/places:searchText";

const FIELD_MASK =
  "places.displayName,places.formattedAddress,places.websiteUri,places.internationalPhoneNumber,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.id,places.googleMapsUri,places.types";

function regionCodeFromContext(ctx: DiscoverySourceContext): string {
  const c = (ctx.country ?? "CA").toUpperCase();
  if (c === "UK" || c === "GB") return "GB";
  if (c.length === 2) return c;
  return "CA";
}

type PlacesSearchPlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  types?: string[];
};

type PlacesSearchResponse = { places?: PlacesSearchPlace[] };

function mapPlace(p: PlacesSearchPlace, ctx: DiscoverySourceContext): DiscoveredBusiness | null {
  const name = p.displayName?.text?.trim();
  if (!name) return null;
  const phone = p.internationalPhoneNumber ?? p.nationalPhoneNumber;
  const sourceUrl =
    p.googleMapsUri ??
    (p.id ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(p.id)}` : "");
  if (!sourceUrl) return null;

  return {
    name,
    niche: ctx.niche,
    city: ctx.city,
    region: ctx.region,
    country: ctx.country ?? "CA",
    phone: phone?.trim() || undefined,
    address: p.formattedAddress?.trim() || undefined,
    websiteUrl: p.websiteUri?.trim() || undefined,
    rating: p.rating,
    reviewCount: p.userRatingCount,
    category: p.types?.[0] ?? ctx.niche,
    source: "maps_like_result",
    sourceUrl,
    confidence: 0.9,
    rawJson: { placeId: p.id, types: p.types } as Record<string, unknown>,
  };
}

export const googlePlacesSource: DiscoverySource = {
  name: "google_places",
  available: APP_CONFIG.enableGooglePlacesSource && Boolean(process.env.GOOGLE_MAPS_API_KEY?.trim()),
  rateLimitMs: 350,
  async search(ctx) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
    if (!APP_CONFIG.enableGooglePlacesSource || !apiKey) return [];

    const maxResultCount = Math.min(Math.max(ctx.limit, 1), 20);

    const res = await fetch(PLACES_TEXT_SEARCH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: ctx.query,
        maxResultCount,
        regionCode: regionCodeFromContext(ctx),
        languageCode: "en",
      }),
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Google Places Text Search failed: ${res.status} ${text.slice(0, 400)}`);
    }

    let data: PlacesSearchResponse;
    try {
      data = JSON.parse(text) as PlacesSearchResponse;
    } catch {
      return [];
    }

    const out: DiscoveredBusiness[] = [];
    for (const p of data.places ?? []) {
      const b = mapPlace(p, ctx);
      if (b) out.push(b);
    }
    return out;
  },
};
