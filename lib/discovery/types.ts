import type { SourceType } from "@prisma/client";

export interface DiscoveredBusiness {
  name: string;
  niche: string;
  city: string;
  region?: string;
  country?: string;
  phone?: string;
  email?: string;
  address?: string;
  websiteUrl?: string;
  socialLinks?: Record<string, string>;
  directoryLinks?: Record<string, string>;
  rating?: number;
  reviewCount?: number;
  category?: string;
  source: SourceType;
  sourceUrl: string;
  confidence: number;
  rawJson?: Record<string, unknown>;
}

export interface DiscoverySourceContext {
  city: string;
  region?: string;
  country?: string;
  niche: string;
  query: string;
  limit: number;
}

export interface DiscoverySource {
  name: string;
  available: boolean;
  rateLimitMs: number;
  search(ctx: DiscoverySourceContext): Promise<DiscoveredBusiness[]>;
}
