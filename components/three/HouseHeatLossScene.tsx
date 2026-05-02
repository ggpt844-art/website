"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D } from "three";
import { SceneCanvas } from "./sharedThree";
import type { SceneProps } from "./sceneTypes";

function House({ accent }: { accent: string }) {
  return (
    <group position={[0, -0.4, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.6, 1.4, 1.4]} />
        <meshStandardMaterial color="#1f2330" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.9, 0.9, 4]} />
        <meshStandardMaterial color="#2b2f3d" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.85, 0.71]}>
        <planeGeometry args={[2.5, 0.05]} />
        <meshBasicMaterial color={accent} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function HeatParticles({ count, accent, reducedMotion }: { count: number; accent: string; reducedMotion?: boolean }) {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const seeds = useMemo(
    () => Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 2.4,
      z: (Math.random() - 0.5) * 1.2,
      y: 0.5 + Math.random() * 0.6,
      v: 0.4 + Math.random() * 0.6,
      s: 0.04 + Math.random() * 0.05,
    })),
    [count],
  );

  useFrame((_, dt) => {
    if (!ref.current || reducedMotion) return;
    seeds.forEach((s, i) => {
      s.y += dt * s.v;
      if (s.y > 3.6) s.y = 0.5;
      dummy.position.set(s.x, s.y, s.z);
      dummy.scale.setScalar(s.s);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial color={accent} transparent opacity={0.7} />
    </instancedMesh>
  );
}

export function HouseHeatLossScene({
  accentColor = "#ff8a3d",
  backgroundColor = "transparent",
  reducedMotion = false,
  quality = "high",
}: SceneProps) {
  const count = quality === "low" ? 40 : quality === "medium" ? 90 : 160;
  return (
    <SceneCanvas background={backgroundColor} cameraZ={6}>
      <House accent={accentColor} />
      <HeatParticles count={count} accent={accentColor} reducedMotion={reducedMotion} />
    </SceneCanvas>
  );
}
