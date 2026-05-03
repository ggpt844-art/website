"use client";

import { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function GlbModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const root = useMemo(() => {
    const g = scene.clone(true);
    g.traverse((o) => {
      if (o instanceof THREE.Mesh && o.material && !Array.isArray(o.material)) {
        const m = o.material as THREE.MeshStandardMaterial;
        m.envMapIntensity = (m.envMapIntensity ?? 1) * 1.15;
        if (m.roughness != null) m.roughness = Math.min(1, m.roughness + 0.06);
      }
    });
    return g;
  }, [scene]);
  return (
    <primitive
      object={root}
      position={[1.05, -0.05, 0.55]}
      scale={0.38}
      rotation={[0, -0.42, 0]}
    />
  );
}

/** Optional `/public/models/*.glb` — only mounts when `url` is set in demo JSON. */
export function RoofHeroGlb({ url }: { url?: string | null }) {
  if (!url) return null;
  return (
    <Suspense fallback={null}>
      <GlbModel url={url} />
    </Suspense>
  );
}
