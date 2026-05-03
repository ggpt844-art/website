"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D } from "three";
import { SceneCanvas } from "./sharedThree";
import type { SceneProps } from "./sceneTypes";
import { WetGroundPlane } from "./WetGroundPlane";
import { RoofHeroGlb } from "./RoofHeroGlb";

function ShingleRoof({ accent }: { accent: string }) {
  const cols = 12;
  const rows = 18;
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  useMemo(() => {
    if (!ref.current) return;
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dummy.position.set(c * 0.36 - cols * 0.18, r * 0.18 - rows * 0.09, 0);
        dummy.scale.set(0.34, 0.16, 0.05);
        dummy.updateMatrix();
        ref.current.setMatrixAt(i++, dummy.matrix);
      }
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [dummy, ref]);

  return (
    <group rotation={[-Math.PI / 4, 0, 0]} position={[0, -0.2, 0]}>
      <instancedMesh ref={ref} args={[undefined, undefined, cols * rows]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#1b1f29"
          roughness={0.82}
          metalness={0.08}
          envMapIntensity={1.05}
        />
      </instancedMesh>
      {/* Ridge cap + vent stacks — foreground read without a GLB */}
      <mesh position={[0, 1.68, -0.35]} rotation={[0, 0, 0]}>
        <boxGeometry args={[4.2, 0.09, 0.14]} />
        <meshStandardMaterial color="#242a38" roughness={0.75} metalness={0.12} envMapIntensity={1} />
      </mesh>
      <mesh position={[-0.85, 1.52, -0.12]}>
        <boxGeometry args={[0.22, 0.28, 0.22]} />
        <meshStandardMaterial color="#2e3445" roughness={0.88} metalness={0.06} />
      </mesh>
      <mesh position={[0.55, 1.48, -0.08]}>
        <cylinderGeometry args={[0.075, 0.09, 0.32, 12]} />
        <meshStandardMaterial color="#3a4152" roughness={0.55} metalness={0.25} envMapIntensity={1.1} />
      </mesh>
      <mesh position={[0.3, 0.25, 0.05]}>
        <circleGeometry args={[0.2, 32]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.35} />
      </mesh>
    </group>
  );
}

function Rain({ count, reducedMotion }: { count: number; reducedMotion?: boolean }) {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 8,
        z: (Math.random() - 0.5) * 4,
        y: Math.random() * 6,
        v: 1.2 + Math.random() * 1.5,
      })),
    [count],
  );

  useFrame((_, dt) => {
    if (!ref.current || reducedMotion) return;
    seeds.forEach((s, i) => {
      s.y -= dt * s.v;
      if (s.y < -2) s.y = 4;
      dummy.position.set(s.x, s.y, s.z);
      dummy.scale.set(0.012, 0.18, 0.012);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#8cb4ff" transparent opacity={0.62} />
    </instancedMesh>
  );
}

export function RoofPlaneRainScene({
  accentColor = "#ff6a3d",
  backgroundColor = "transparent",
  reducedMotion = false,
  quality = "high",
  lightingPreset,
  cameraSpec,
  isMobile,
  heroGlbUrl,
}: SceneProps) {
  const drops = quality === "low" ? 60 : quality === "medium" ? 140 : 220;
  const fogNear = lightingPreset?.toLowerCase().includes("storm") ? 4.5 : 5;
  const fogFar = lightingPreset?.toLowerCase().includes("storm") ? 13 : 14;

  return (
    <SceneCanvas
      background={backgroundColor}
      cameraZ={6}
      cameraSpec={cameraSpec}
      reducedMotion={reducedMotion}
      isMobile={isMobile}
      lightingPreset={lightingPreset}
      quality={quality}
      contactShadow={false}
    >
      <fog attach="fog" args={["#05070d", fogNear, fogFar]} />
      <WetGroundPlane accent={accentColor} />
      <ShingleRoof accent={accentColor} />
      <Rain count={drops} reducedMotion={reducedMotion} />
      <RoofHeroGlb url={heroGlbUrl} />
    </SceneCanvas>
  );
}
