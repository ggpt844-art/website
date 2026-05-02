"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { Mesh } from "three";
import { SceneCanvas } from "./sharedThree";
import type { SceneProps } from "./sceneTypes";

function Orb({ accent, motionSpeed = 1, reducedMotion }: { accent: string; motionSpeed?: number; reducedMotion?: boolean }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    if (reducedMotion) return;
    ref.current.rotation.y += dt * 0.3 * motionSpeed;
    ref.current.rotation.x += dt * 0.05 * motionSpeed;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.6, 6]} />
      <MeshDistortMaterial
        color={accent}
        roughness={0.15}
        metalness={0.6}
        distort={0.35}
        speed={reducedMotion ? 0 : 1.2}
      />
    </mesh>
  );
}

export function AbstractOrbScene({
  accentColor = "#4d8bff",
  backgroundColor = "transparent",
  motionSpeed = 1,
  reducedMotion = false,
}: SceneProps) {
  return (
    <SceneCanvas background={backgroundColor} cameraZ={5}>
      <Orb accent={accentColor} motionSpeed={motionSpeed} reducedMotion={reducedMotion} />
      <Sparkles count={reducedMotion ? 30 : 80} scale={6} size={2} speed={0.4} color={accentColor} />
    </SceneCanvas>
  );
}
