"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { SceneCanvas } from "./sharedThree";
import type { SceneProps } from "./sceneTypes";

function TerrainStack({ accent, reducedMotion }: { accent: string; reducedMotion?: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (!ref.current || reducedMotion) return;
    ref.current.rotation.y += dt * 0.05;
  });
  return (
    <group ref={ref}>
      <mesh position={[0, -0.7, 0]}>
        <boxGeometry args={[3.6, 0.14, 2.4]} />
        <meshStandardMaterial color="#1d231c" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[3.2, 0.18, 2.0]} />
        <meshStandardMaterial color="#2a3024" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.27, 0]}>
        <boxGeometry args={[2.8, 0.2, 1.6]} />
        <meshStandardMaterial color="#383f2d" roughness={0.85} />
      </mesh>
      <group position={[0, -0.05, 0]}>
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 7 }, (_, c) => (
            <mesh key={`${r}-${c}`} position={[c * 0.36 - 1.08, 0, r * 0.36 - 0.72]}>
              <boxGeometry args={[0.32, 0.08, 0.32]} />
              <meshStandardMaterial color="#9c8458" roughness={0.7} metalness={0.05} />
            </mesh>
          )),
        )}
      </group>
      <mesh position={[1.2, 0.05, -0.6]}>
        <boxGeometry args={[0.5, 0.1, 0.5]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

export function TerrainLayersScene({
  accentColor = "#39d98a",
  backgroundColor = "transparent",
  reducedMotion = false,
}: SceneProps) {
  return (
    <SceneCanvas background={backgroundColor} cameraZ={5}>
      <TerrainStack accent={accentColor} reducedMotion={reducedMotion} />
    </SceneCanvas>
  );
}
