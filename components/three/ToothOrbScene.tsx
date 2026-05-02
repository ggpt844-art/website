"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { Mesh } from "three";
import { SceneCanvas } from "./sharedThree";
import type { SceneProps } from "./sceneTypes";

function ToothOrb({ accent, reducedMotion }: { accent: string; reducedMotion?: boolean }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current || reducedMotion) return;
    ref.current.rotation.y += dt * 0.12;
  });
  return (
    <Float floatIntensity={reducedMotion ? 0 : 0.6} speed={1}>
      <mesh ref={ref}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.05}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.02}
          transmission={0.4}
          thickness={1}
          ior={1.5}
          attenuationColor={accent}
        />
      </mesh>
    </Float>
  );
}

function SmileArc({ accent }: { accent: string }) {
  return (
    <mesh rotation={[Math.PI / 2.2, 0, 0]} position={[0, -0.1, 0]}>
      <torusGeometry args={[1.7, 0.015, 16, 100, Math.PI]} />
      <meshBasicMaterial color={accent} transparent opacity={0.55} />
    </mesh>
  );
}

export function ToothOrbScene({
  accentColor = "#2563eb",
  backgroundColor = "transparent",
  reducedMotion = false,
}: SceneProps) {
  return (
    <SceneCanvas background={backgroundColor} cameraZ={5}>
      <ToothOrb accent={accentColor} reducedMotion={reducedMotion} />
      <SmileArc accent={accentColor} />
      <Sparkles count={reducedMotion ? 30 : 60} scale={5} size={1.5} speed={0.2} color={accentColor} />
    </SceneCanvas>
  );
}
