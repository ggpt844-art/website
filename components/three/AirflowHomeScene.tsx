"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D, Color } from "three";
import { SceneCanvas } from "./sharedThree";
import type { SceneProps } from "./sceneTypes";

function HouseSilhouette() {
  return (
    <mesh position={[0, -0.4, 0]}>
      <boxGeometry args={[2.6, 1.6, 1.4]} />
      <meshStandardMaterial color="#1a1f2c" roughness={0.85} />
    </mesh>
  );
}

function AirStream({
  count,
  accent,
  reducedMotion,
  warm,
}: {
  count: number;
  accent: string;
  reducedMotion?: boolean;
  warm?: boolean;
}) {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const color = useMemo(() => new Color(warm ? "#ff7a4d" : accent), [warm, accent]);
  const seeds = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2 + Math.random() * 0.4,
      r: 1.6 + Math.random() * 0.5,
      y: (Math.random() - 0.5) * 1.5,
      v: 0.4 + Math.random() * 0.6,
      s: 0.03 + Math.random() * 0.03,
    })),
    [count],
  );

  useFrame((_, dt) => {
    if (!ref.current || reducedMotion) return;
    seeds.forEach((s, i) => {
      s.angle += dt * s.v * 0.6;
      const x = Math.cos(s.angle) * s.r;
      const z = Math.sin(s.angle) * s.r;
      dummy.position.set(x, s.y, z);
      dummy.scale.setScalar(s.s);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </instancedMesh>
  );
}

export function AirflowHomeScene({
  accentColor = "#4d8bff",
  backgroundColor = "transparent",
  reducedMotion = false,
  quality = "high",
  lightingPreset,
  cameraSpec,
  isMobile,
}: SceneProps) {
  const count = quality === "low" ? 60 : quality === "medium" ? 110 : 180;
  return (
    <SceneCanvas
      background={backgroundColor}
      cameraZ={6}
      cameraSpec={cameraSpec}
      reducedMotion={reducedMotion}
      isMobile={isMobile}
      lightingPreset={lightingPreset}
      quality={quality}
    >
      <HouseSilhouette />
      <AirStream count={count} accent={accentColor} reducedMotion={reducedMotion} />
      <AirStream count={Math.round(count * 0.5)} accent={accentColor} warm reducedMotion={reducedMotion} />
    </SceneCanvas>
  );
}
