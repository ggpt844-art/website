"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { SceneId, SceneProps } from "./sceneTypes";

const RoofPlaneRainScene = dynamic(
  () => import("./RoofPlaneRainScene").then((m) => m.RoofPlaneRainScene),
  { ssr: false, loading: () => null },
);
const HouseHeatLossScene = dynamic(
  () => import("./HouseHeatLossScene").then((m) => m.HouseHeatLossScene),
  { ssr: false, loading: () => null },
);
const AirflowHomeScene = dynamic(
  () => import("./AirflowHomeScene").then((m) => m.AirflowHomeScene),
  { ssr: false, loading: () => null },
);
const TerrainLayersScene = dynamic(
  () => import("./TerrainLayersScene").then((m) => m.TerrainLayersScene),
  { ssr: false, loading: () => null },
);
const ToothOrbScene = dynamic(
  () => import("./ToothOrbScene").then((m) => m.ToothOrbScene),
  { ssr: false, loading: () => null },
);
const GlowSphereScene = dynamic(
  () => import("./GlowSphereScene").then((m) => m.GlowSphereScene),
  { ssr: false, loading: () => null },
);
const AbstractOrbScene = dynamic(
  () => import("./AbstractOrbScene").then((m) => m.AbstractOrbScene),
  { ssr: false, loading: () => null },
);

export function ThreeSceneRouter({
  scene,
  ...props
}: { scene: SceneId } & SceneProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(m.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    m.addEventListener?.("change", handler);
    return () => m.removeEventListener?.("change", handler);
  }, []);

  const merged = { ...props, reducedMotion: props.reducedMotion ?? reducedMotion };

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
