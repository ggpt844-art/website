"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, Float } from "@react-three/drei";
import { Mesh } from "three";
import { SceneCanvas } from "./sharedThree";
import type { SceneProps } from "./sceneTypes";

function Sphere({ accent, reducedMotion }: { accent: string; reducedMotion?: boolean }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current || reducedMotion) return;
    ref.current.rotation.y += dt * 0.15;
  });
  return (
    <Float floatIntensity={reducedMotion ? 0 : 1.2} speed={1.2}>
      <mesh ref={ref}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshPhysicalMaterial
          color={accent}
          metalness={0.2}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transmission={0.6}
          thickness={1.2}
          ior={1.4}
          attenuationColor={accent}
        />
      </mesh>
    </Float>
  );
}

function Ring({ accent, radius, tilt, reducedMotion }: { accent: string; radius: number; tilt: number; reducedMotion?: boolean }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current || reducedMotion) return;
    ref.current.rotation.z += dt * 0.05;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.01, 16, 200]} />
      <meshBasicMaterial color={accent} transparent opacity={0.35} />
    </mesh>
  );
}

export function GlowSphereScene({
  accentColor = "#c97a8b",
  backgroundColor = "transparent",
  reducedMotion = false,
}: SceneProps) {
  return (
    <SceneCanvas background={backgroundColor} cameraZ={5}>
      <Sphere accent={accentColor} reducedMotion={reducedMotion} />
      <Ring accent={accentColor} radius={2.2} tilt={Math.PI / 3} reducedMotion={reducedMotion} />
      <Ring accent={accentColor} radius={2.6} tilt={Math.PI / 2.4} reducedMotion={reducedMotion} />
      <Sparkles count={reducedMotion ? 40 : 120} scale={6} size={2.5} speed={0.3} color={accentColor} />
    </SceneCanvas>
  );
}
