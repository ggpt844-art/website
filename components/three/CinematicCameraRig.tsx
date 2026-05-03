"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { damp3 } from "maath/easing";
import * as THREE from "three";
import type { CameraSpec } from "@/lib/experience/experienceSchemas";
import { useRoofHeroScroll } from "./RoofHeroScrollContext";

export function CinematicCameraRig({
  spec,
  reducedMotion,
  mobile,
}: {
  spec: CameraSpec | null | undefined;
  reducedMotion?: boolean;
  mobile?: boolean;
}) {
  const roofScroll = useRoofHeroScroll();
  const { camera } = useThree();
  const basePos = useRef(new THREE.Vector3(0, 0, 6));
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const zStart = useRef(0);
  const idealPos = useRef(new THREE.Vector3());
  const smoothedPos = useRef(new THREE.Vector3());
  const lookScratch = useRef(new THREE.Vector3());
  const ready = useRef(false);

  useEffect(() => {
    if (!spec) {
      ready.current = false;
      return;
    }
    const [px, py, pz] = spec.initialPosition;
    const [tx, ty, tz] = spec.initialTarget;
    basePos.current.set(px, py, mobile ? pz + 0.6 : pz);
    target.current.set(tx, ty, tz);
    zStart.current = basePos.current.z;
    smoothedPos.current.copy(basePos.current);
    camera.position.copy(basePos.current);
    camera.lookAt(target.current);
    ready.current = true;
  }, [spec, camera, mobile]);

  useFrame((state, dt) => {
    if (!spec || !ready.current) return;

    const b = basePos.current;
    const s = smoothedPos.current;
    const i = idealPos.current;
    const staticCam = !!reducedMotion || spec.movementStyle === "static_premium";

    if (staticCam) {
      s.copy(b);
    } else {
      const t = state.clock.elapsedTime;
      const slow = mobile ? 0.55 : 1;
      const mx = spec.movementStyle;

      if (mx === "subtle_orbit" || mx === "luxury_drift") {
        const r = mobile ? 0.045 : 0.095;
        const spd = (mx === "luxury_drift" ? 0.04 : 0.064) * slow;
        const breath = mx === "luxury_drift" ? Math.sin(t * 0.33) * (mobile ? 0.018 : 0.032) : 0;
        i.set(b.x + Math.sin(t * spd) * r, b.y + breath, b.z + Math.cos(t * spd) * r * 0.4);
        const tau = mx === "luxury_drift" ? (mobile ? 0.95 : 0.72) : mobile ? 0.62 : 0.44;
        damp3(s, i, tau, dt);
      } else if (mx === "slow_dolly_in" || mx === "diagnostic_zoom_in" || mx === "scroll_reveal_zoom") {
        const cap = mobile ? 0.55 : 0.88;
        const endZ = zStart.current - cap;
        const step = (mobile ? 0.045 : 0.065) * dt * 60 * 0.001 * 14;
        i.set(b.x, b.y, Math.max(endZ, s.z - step));
        damp3(s, i, mobile ? 0.24 : 0.19, dt);
      } else if (mx === "inspection_pan") {
        const pan = Math.sin(t * 0.05 * slow) * (mobile ? 0.072 : 0.108);
        i.set(b.x + pan, b.y, b.z);
        damp3(s, i, mobile ? 0.52 : 0.38, dt);
      } else if (mx === "parallax_follow") {
        const r = mobile ? 0.048 : 0.085;
        const spd = 0.052 * slow;
        i.set(
          b.x + Math.cos(t * spd + 1.1) * r,
          b.y + Math.sin(t * spd * 0.55) * (mobile ? 0.022 : 0.038),
          b.z + Math.sin(t * spd) * r * 0.36,
        );
        damp3(s, i, mobile ? 0.58 : 0.42, dt);
      } else if (mx === "tilt_to_detail") {
        const r = mobile ? 0.035 : 0.055;
        const spd = 0.048 * slow;
        i.set(
          b.x + Math.sin(t * spd) * r * 0.6,
          b.y + Math.sin(t * spd * 0.9) * (mobile ? 0.025 : 0.045),
          b.z + Math.cos(t * spd * 0.7) * r,
        );
        damp3(s, i, mobile ? 0.55 : 0.4, dt);
      } else {
        const r = mobile ? 0.032 : 0.055;
        const spd = 0.048 * slow;
        i.set(b.x + Math.sin(t * spd) * r, b.y, b.z + Math.cos(t * spd) * r * 0.32);
        damp3(s, i, mobile ? 0.65 : 0.48, dt);
      }
    }

    camera.position.copy(s);

    const boost = reducedMotion ? 0 : Math.min(1, Math.max(0, roofScroll?.progress.current ?? 0));
    if (boost > 0.0001) {
      camera.position.z += boost * (mobile ? 0.32 : 0.58);
      camera.position.y += boost * (mobile ? 0.042 : 0.078);
      camera.position.x += boost * (mobile ? 0.024 : 0.048);
    }

    lookScratch.current.copy(target.current);
    lookScratch.current.y -= boost * 0.062;
    lookScratch.current.x += boost * 0.026;
    camera.lookAt(lookScratch.current);
  });

  return null;
}
