"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { SceneSpec, VisualDirection } from "@/lib/experience/experienceSchemas";
import type { SceneId, SceneProps } from "./sceneTypes";
import { PremiumCinematicFallback } from "@/components/demo/PremiumCinematicFallback";

/** Referenced from each `dynamic(..., { loading })` — options object must be inline for Next.js. */
function ThreeSceneLoadingPlaceholder() {
  return (
    <div
      className="absolute inset-0 bg-[#0a1018]"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 18%, rgba(77, 139, 255, 0.14), transparent 55%), #05070d",
      }}
      aria-hidden
    />
  );
}

const RoofPlaneRainScene = dynamic(
  () => import("./RoofPlaneRainScene").then((m) => m.RoofPlaneRainScene),
  { ssr: false, loading: ThreeSceneLoadingPlaceholder },
);
const HouseHeatLossScene = dynamic(
  () => import("./HouseHeatLossScene").then((m) => m.HouseHeatLossScene),
  { ssr: false, loading: ThreeSceneLoadingPlaceholder },
);
const AirflowHomeScene = dynamic(
  () => import("./AirflowHomeScene").then((m) => m.AirflowHomeScene),
  { ssr: false, loading: ThreeSceneLoadingPlaceholder },
);
const TerrainLayersScene = dynamic(
  () => import("./TerrainLayersScene").then((m) => m.TerrainLayersScene),
  { ssr: false, loading: ThreeSceneLoadingPlaceholder },
);
const ToothOrbScene = dynamic(
  () => import("./ToothOrbScene").then((m) => m.ToothOrbScene),
  { ssr: false, loading: ThreeSceneLoadingPlaceholder },
);
const GlowSphereScene = dynamic(
  () => import("./GlowSphereScene").then((m) => m.GlowSphereScene),
  { ssr: false, loading: ThreeSceneLoadingPlaceholder },
);
const AbstractOrbScene = dynamic(
  () => import("./AbstractOrbScene").then((m) => m.AbstractOrbScene),
  { ssr: false, loading: ThreeSceneLoadingPlaceholder },
);

export function ThreeSceneRouter({
  scene,
  sceneSpec,
  visualDirection,
  ...props
}: {
  scene: SceneId;
  sceneSpec?: SceneSpec | null;
  visualDirection?: VisualDirection | null;
} & SceneProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(m.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    m.addEventListener?.("change", handler);
    const mq = window.matchMedia("(max-width: 767px)");
    const setM = () => setIsMobile(mq.matches);
    setM();
    mq.addEventListener?.("change", setM);
    return () => {
      m.removeEventListener?.("change", handler);
      mq.removeEventListener?.("change", setM);
    };
  }, []);

  const tierQuality: SceneProps["quality"] =
    sceneSpec?.performanceTier === "low"
      ? "low"
      : sceneSpec?.performanceTier === "medium"
        ? "medium"
        : "high";

  const merged = {
    ...props,
    reducedMotion: props.reducedMotion ?? reducedMotion,
    quality: props.quality ?? (isMobile ? "low" : tierQuality),
    lightingPreset: props.lightingPreset ?? sceneSpec?.lightingPreset,
    materialPreset: props.materialPreset ?? sceneSpec?.materialPreset,
    cameraSpec: props.cameraSpec ?? sceneSpec?.cameraSpec,
    isMobile: props.isMobile ?? isMobile,
  };

  const useStatic = merged.reducedMotion && !!sceneSpec?.fallbacks;

  if (useStatic && sceneSpec?.fallbacks) {
    return (
      <PremiumCinematicFallback
        sceneSpec={sceneSpec}
        visualDirection={visualDirection}
        accentColor={merged.accentColor ?? "#888"}
        mode={merged.reducedMotion ? "reduced_motion" : "static_performance"}
      />
    );
  }

  switch (scene) {
    case "roof-plane-rain":
      return <RoofPlaneRainScene {...merged} />;
    case "house-heat-loss":
      return <HouseHeatLossScene {...merged} />;
    case "airflow-home":
      return <AirflowHomeScene {...merged} />;
    case "terrain-layers":
      return <TerrainLayersScene {...merged} />;
    case "tooth-orb":
      return <ToothOrbScene {...merged} />;
    case "glow-sphere":
      return <GlowSphereScene {...merged} />;
    case "abstract-orb":
    default:
      return <AbstractOrbScene {...merged} />;
  }
}
