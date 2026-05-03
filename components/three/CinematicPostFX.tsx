"use client";

import { useMemo } from "react";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

export type PostFxProfile = "studio" | "noir" | "golden" | "warehouse";

export function CinematicPostFX({ profile }: { profile: PostFxProfile }) {
  const chromaOffset = useMemo(() => new Vector2(0.00035, 0.00055), []);

  const isNoir = profile === "noir";
  const isGolden = profile === "golden";
  const isWarehouse = profile === "warehouse";

  const bloomThreshold = isNoir ? 0.84 : isGolden ? 0.78 : isWarehouse ? 0.82 : 0.82;
  const bloomIntensity = isNoir ? 0.2 : isGolden ? 0.36 : isWarehouse ? 0.22 : 0.26;
  const vignetteDark = isNoir ? 0.38 : isGolden ? 0.48 : isWarehouse ? 0.44 : 0.48;
  const vignetteOffset = isNoir ? 0.28 : 0.32;
  const noiseOpacity = isNoir ? 0.028 : 0.018;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.55}
        mipmapBlur
        intensity={bloomIntensity}
        radius={0.55}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={chromaOffset}
        radialModulation
        modulationOffset={0.12}
      />
      <Vignette eskil={false} offset={vignetteOffset} darkness={vignetteDark} />
      <Noise opacity={noiseOpacity} blendFunction={BlendFunction.SOFT_LIGHT} premultiply />
    </EffectComposer>
  );
}
