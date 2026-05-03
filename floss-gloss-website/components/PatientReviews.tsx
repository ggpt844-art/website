import { GoogleReviewShareSlider } from "@/components/GoogleReviewShareSlider";
import { CURATED_GOOGLE_REVIEW_SHARES } from "@/lib/curatedGoogleReviewShares";
import type { PlaceReviewsResult } from "@/lib/googlePlacesReviews";

type PatientReviewsProps = Pick<PlaceReviewsResult, "rating" | "userRatingsTotal" | "listingUrl" | "source"> & {
  brandName: string;
  ink: string;
  ink65: string;
  navy: string;
  gold: string;
  cream: string;
  sea: string;
};

export function PatientReviews({
  rating,
  userRatingsTotal,
  listingUrl,
  source,
  brandName,
  ink,
  ink65,
  navy,
  gold,
  cream,
  sea,
}: PatientReviewsProps) {
  const showGoogleLink = Boolean(listingUrl);

  return (
    <section
      id="reviews"
      className="border-t border-black/[0.05] py-20 md:py-28"
      style={{ backgroundColor: cream, color: ink }}
    >
      <div className="layout-shell">
        <div className="reviews-header flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.28em]"
              style={{ color: sea }}
            >
              Social proof
            </p>
            <h2
              className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-[2.75rem]"
              style={{ color: navy }}
            >
              What our patients say
            </h2>
            <p className="mt-4" style={{ color: ink65 }}>
              {source === "live" && rating != null ? (
                <>
                  <span className="font-semibold" style={{ color: navy }}>
                    {rating.toFixed(1)} on Google
                  </span>
                  {userRatingsTotal != null ? (
                    <span> · {userRatingsTotal.toLocaleString()} reviews</span>
                  ) : null}{" "}
                  — highlights in the carousel; full reviews on Google.
                </>
              ) : (
                <>
                  Patient stories in the carousel link through to our Google profile, where every review
                  is posted in full.
                </>
              )}
            </p>
          </div>
          {showGoogleLink && listingUrl ? (
            <a
              href={listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center rounded-sm border px-6 py-3 text-xs font-bold uppercase tracking-widest transition hover:opacity-92"
              style={{
                borderColor: "rgba(10, 22, 40, 0.2)",
                backgroundColor: navy,
                color: "#ffffff",
              }}
            >
              Read on Google
            </a>
          ) : null}
        </div>

        {CURATED_GOOGLE_REVIEW_SHARES.length > 0 ? (
          <GoogleReviewShareSlider
            slides={CURATED_GOOGLE_REVIEW_SHARES}
            googleListingUrl={listingUrl ?? null}
            navy={navy}
            gold={gold}
            ink65={ink65}
            sea={sea}
          />
        ) : null}

        <p className="mt-10 text-center text-xs" style={{ color: ink65 }}>
          Reviews shown for <strong style={{ color: navy }}>{brandName}</strong>.
        </p>
      </div>
    </section>
  );
}
