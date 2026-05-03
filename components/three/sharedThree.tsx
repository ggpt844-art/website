"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import type { ReactNode } from "react";
import * as THREE from "three";
import type { CameraSpec } from "@/lib/experience/experienceSchemas";
import { CinematicCameraRig } from "./CinematicCameraRig";
import { CinematicPostFX, type PostFxProfile } from "./CinematicPostFX";

type EnvPreset =
  | "apartment"
  | "city"
  | "dawn"
  | "forest"
  | "lobby"
  | "night"
  | "park"
  | "studio"
  | "sunset"
  | "warehouse";

type EnvConfig = {
  preset: EnvPreset;
  environmentIntensity: number;
  ambient: number;
  key: number;
  fill: number;
  exposure: number;
  postFxProfile: PostFxProfile;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
};

/** Map planner lighting copy to HDRI + light levels — Lusion / Oryzo-style product clarity. */
function envFromLightingPreset(lightingPreset: string | undefined): EnvConfig {
  const p = (lightingPreset ?? "").toLowerCase();
  if (p.includes("storm") || p.includes("dark")) {
    return {
      preset: "night",
      environmentIntensity: 0.72,
      ambient: 0.12,
      key: 0.55,
      fill: 0.18,
      exposure: 1.06,
      postFxProfile: "noir",
      hemiSky: "#1a1f35",
      hemiGround: "#050608",
      hemiIntensity: 0.35,
    };
  }
  if (p.includes("golden") || p.includes("sunset") || (p.includes("warm") && p.includes("bleed"))) {
    return {
      preset: "sunset",
      environmentIntensity: 1.05,
      ambient: 0.22,
      key: 0.88,
      fill: 0.35,
      exposure: 1.02,
      postFxProfile: "golden",
      hemiSky: "#ffd7b8",
      hemiGround: "#3d2818",
      hemiIntensity: 0.4,
    };
  }
  if (
    p.includes("clinical") ||
    p.includes("studio") ||
    p.includes("chiaroscuro") ||
    p.includes("single key") ||
    p.includes("soft studio")
  ) {
    return {
      preset: "studio",
      environmentIntensity: 1.22,
      ambient: 0.18,
      key: 1.05,
      fill: 0.42,
      exposure: 1.05,
      postFxProfile: "studio",
      hemiSky: "#f5f8ff",
      hemiGround: "#a8b0c4",
      hemiIntensity: 0.45,
    };
  }
  if (p.includes("plenum") || p.includes("warehouse") || p.includes("cool plenum")) {
    return {
      preset: "warehouse",
      environmentIntensity: 0.88,
      ambient: 0.2,
      key: 0.92,
      fill: 0.38,
      exposure: 1,
      postFxProfile: "warehouse",
      hemiSky: "#c8d4e8",
      hemiGround: "#1e2430",
      hemiIntensity: 0.38,
    };
  }
  if (p.includes("exterior") || p.includes("terrain") || p.includes("cool exterior")) {
    return {
      preset: "dawn",
      environmentIntensity: 1,
      ambient: 0.26,
      key: 0.92,
      fill: 0.36,
      exposure: 1,
      postFxProfile: "golden",
      hemiSky: "#dbe8ff",
      hemiGround: "#2a3440",
      hemiIntensity: 0.42,
    };
  }
  if (p.includes("ember") || p.includes("amber") || p.includes("alert")) {
    return {
      preset: "lobby",
      environmentIntensity: 1.08,
      ambient: 0.2,
      key: 1,
      fill: 0.33,
      exposure: 1.03,
      postFxProfile: "golden",
      hemiSky: "#ffe8d6",
      hemiGround: "#2a1810",
      hemiIntensity: 0.4,
    };
  }
  return {
    preset: "studio",
    environmentIntensity: 1.15,
    ambient: 0.2,
    key: 0.98,
    fill: 0.4,
    exposure: 1.04,
    postFxProfile: "studio",
    hemiSky: "#f4f7fd",
    hemiGround: "#9aa5bb",
    hemiIntensity: 0.45,
  };
}

export function SceneCanvas({
  children,
  background,
  cameraZ = 6,
  className,
  cameraSpec,
  reducedMotion,
  isMobile,
  lightingPreset,
  quality = "high",
  contactShadow = true,
}: {
  children: ReactNode;
  background?: string;
  cameraZ?: number;
  className?: string;
  cameraSpec?: CameraSpec | null;
  reducedMotion?: boolean;
  isMobile?: boolean;
  lightingPreset?: string;
  quality?: "low" | "medium" | "high";
  contactShadow?: boolean;
}) {
  const pos = cameraSpec?.initialPosition ?? ([0, 0, cameraZ] as [number, number, number]);
  const env = envFromLightingPreset(lightingPreset);
  const lp = (lightingPreset ?? "").toLowerCase();
  const useContact =
    contactShadow &&
    quality === "high" &&
    !isMobile &&
    !reducedMotion &&
    !lp.includes("storm");

  const usePostFx = quality === "high" && !isMobile && !reducedMotion;

  return (
    <div
      className={className ?? "absolute inset-0"}
      style={background ? { background } : undefined}
      aria-hidden
    >
      <Canvas
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        camera={{ position: pos, fov: 36, near: 0.08, far: 96 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = env.exposure;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = false;
        }}
      >
        <CinematicCameraRig
          spec={cameraSpec}
          reducedMotion={reducedMotion}
          mobile={isMobile}
        />
        <hemisphereLight
          color={env.hemiSky}
          groundColor={env.hemiGround}
          intensity={env.hemiIntensity}
        />
        <ambientLight intensity={env.ambient} />
        <spotLight
          position={[-6, 8, 2]}
          angle={0.35}
          penumbra={0.85}
          intensity={1.15}
          color="#fff8f0"
          distance={40}
          decay={2}
        />
        <directionalLight position={[4.2, 6.5, 4.5]} intensity={env.key} />
        <directionalLight position={[-3.5, 2.8, -2.2]} intensity={env.fill} color="#e8eeff" />
        <Environment preset={env.preset} environmentIntensity={env.environmentIntensity} />
        {useContact ? (
          <ContactShadows
            position={[0, -2.15, 0]}
            opacity={0.55}
            scale={14}
            blur={2.4}
            far={8.5}
            frames={1}
          />
        ) : null}
        {children}
        {usePostFx ? <CinematicPostFX profile={env.postFxProfile} /> : null}
      </Canvas>
    </div>
  );
}
