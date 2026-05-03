import type { PackageConfig } from "@/lib/growth/schemas";
import { defaultFeatureFlagsForTier } from "./packageFeatures";

export function buildPackageConfig(tier: PackageConfig["tier"]): PackageConfig {
  return {
    tier,
    featureFlags: defaultFeatureFlagsForTier(tier),
  };
}

export function packageMeetsFeature(
  pkg: PackageConfig,
  flag: string,
): boolean {
  return pkg.featureFlags[flag] === true;
}
