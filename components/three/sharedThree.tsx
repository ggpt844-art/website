"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import type { ReactNode } from "react";

export function SceneCanvas({
  children,
  background,
  cameraZ = 6,
  className,
}: {
  children: ReactNode;
  background?: string;
  cameraZ?: number;
  className?: string;
}) {
  return (
    <div
      className={className ?? "absolute inset-0"}
      style={background ? { background } : undefined}
      aria-hidden
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, cameraZ], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 4]} intensity={1} />
        <Environment preset="city" />
        {children}
      </Canvas>
    </div>
  );
}
