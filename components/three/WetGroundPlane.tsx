"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRoofHeroScroll } from "./RoofHeroScrollContext";

const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const frag = `
uniform float uTime;
uniform vec3 uAccent;
uniform float uScroll;
varying vec2 vUv;

void main() {
  vec2 p = vUv * 14.0;
  float wave = sin(p.x * 1.3 + uTime * 0.8) * sin(p.y * 1.1 - uTime * 1.1);
  float rip = sin(length(vUv - vec2(0.48, 0.52)) * 22.0 - uTime * 2.8) * 0.06;
  vec3 base = vec3(0.02, 0.035, 0.072);
  vec2 leakUv = vUv - vec2(0.62, 0.38);
  float leak = smoothstep(0.42, 0.0, length(leakUv)) * 0.85;
  vec3 acc = uAccent * (0.09 * leak + 0.035 * wave);
  float wet = 0.22 + 0.12 * wave + rip + uScroll * 0.14;
  vec3 col = base + acc + vec3(wet * 0.09);
  float edge = smoothstep(0.0, 0.14, vUv.x) * smoothstep(1.0, 0.86, vUv.x)
    * smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
  gl_FragColor = vec4(col, 0.9 * edge);
}
`;

/** Storm deck / wet tar paper — leak tint echoes hero accent; scroll amplifies ripple. */
export function WetGroundPlane({ accent }: { accent: string }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const roof = useRoofHeroScroll();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(accent) },
      uScroll: { value: 0 },
    }),
    [accent],
  );

  useFrame((state) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    m.uniforms.uScroll.value = roof?.progress.current ?? 0;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0.07]} position={[0, -1.82, 0.25]} renderOrder={-3}>
      <planeGeometry args={[24, 15, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vert}
        fragmentShader={frag}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
