export type AssetCategory =
  | "logo"
  | "heroCandidate"
  | "galleryProject"
  | "beforeAfter"
  | "team"
  | "interior"
  | "equipment"
  | "service"
  | "testimonial"
  | "background"
  | "icon"
  | "socialIcon"
  | "trackingPixel"
  | "lowQuality"
  | "unrelated"
  | "unknown";

export interface AssetCandidate {
  url: string;
  sourcePageUrl: string;
  sourcePageType:
    | "home"
    | "service"
    | "gallery"
    | "about"
    | "contact"
    | "testimonials"
    | "reviews"
    | "unknown";
  filename: string;
  altText?: string;
  titleAttr?: string;
  nearbyHeadings: string[];
  nearbyText?: string;
  parentLinkText?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  extractionMethod:
    | "img-src"
    | "img-srcset"
    | "picture-source"
    | "data-src"
    | "data-bg"
    | "inline-bg"
    | "css-bg"
    | "og-image"
    | "twitter-image"
    | "json-ld"
    | "favicon"
    | "next-image"
    | "screenshot";
  sourceConfidence: number;
  category: AssetCategory;
  qualityScore: number;
  businessRelevanceScore: number;
  authenticityScore: number;
  heroSuitabilityScore: number;
  proofSuitabilityScore: number;
  rejectReason?: string;
}

export interface AssetProfileJson {
  logoUrl?: string;
  heroCandidates: AssetCandidate[];
  galleryImages: AssetCandidate[];
  teamImages: AssetCandidate[];
  beforeAfterCandidates: AssetCandidate[];
  serviceImages: AssetCandidate[];
  interiorImages: AssetCandidate[];
  rejectedImages: AssetCandidate[];
  screenshots: {
    desktop?: string;
    mobile?: string;
    aboveFold?: string;
  };
  assetQualityScore: number;
  fallbackNeeded: boolean;
  notes: string[];
}
