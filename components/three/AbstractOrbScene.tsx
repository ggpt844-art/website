"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { Mesh } from "three";
import { SceneCanvas } from "./sharedThree";
import type { SceneProps } from "./sceneTypes";

/** Faceted hero solid — studio PBR read (Lusion / product-page clarity, not chrome game-ball). */
function Orb({
  accent,
  motionSpeed = 1,
  reducedMotion,
}: {
  accent: string;
  motionSpeed?: number;
  reducedMotion?: boolean;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    if (reducedMotion) return;
    ref.current.rotation.y += dt * 0.22 * motionSpeed;
    ref.current.rotation.x += dt * 0.04 * motionSpeed;
  });
  return (
    <Float floatIntensity={reducedMotion ? 0 : 0.35} speed={1.15} rotationIntensity={0} floatingRange={[-0.04, 0.04]}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.58, 5]} />
        <meshPhysicalMaterial
          color={accent}
          roughness={0.26}
          metalness={0.4}
          clearcoat={0.94}
          clearcoatRoughness={0.085}
          envMapIntensity={1.42}
          sheen={0.38}
          sheenRoughness={0.52}
          sheenColor={accent}
        />
      </mesh>
    </Float>
  );
}

export function AbstractOrbScene({
  accentColor = "#4d8bff",
  backgroundColor = "transparent",
  motionSpeed = 1,
  reducedMotion = false,
  quality = "high",
  lightingPreset,
  cameraSpec,
  isMobile,
}: SceneProps) {
  return (
    <SceneCanvas
      background={backgroundColor}
      cameraZ={5}
      cameraSpec={cameraSpec}
      reducedMotion={reducedMotion}
      isMobile={isMobile}
      lightingPreset={lightingPreset}
      quality={quality}
    >
      <Orb accent={accentColor} motionSpeed={motionSpeed} reducedMotion={reducedMotion} />
      <Sparkles
        count={reducedMotion ? 20 : quality === "low" ? 40 : 55}
        scale={6}
        size={1.6}
        speed={0.28}
        color={accentColor}
        opacity={0.85}
      />
    </SceneCanvas>
  );
}
