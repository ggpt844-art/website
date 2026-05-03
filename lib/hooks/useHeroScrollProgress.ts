"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks hero scroll into `progressRef` (0..1) without React rerenders — for R3F roofing camera/ground.
 * Retries until the section ref is attached (avoids a first-paint miss).
 */
export function useHeroScrollProgress(enabled: boolean) {
  const elementRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      progressRef.current = 0;
      return;
    }

    let remove: (() => void) | undefined;
    let raf = 0;

    const attach = () => {
      const el = elementRef.current;
      if (!el) {
        raf = requestAnimationFrame(attach);
        return;
      }

      const measure = () => {
        const rect = el.getBoundingClientRect();
        const range = Math.max(1, rect.height * 0.72);
        progressRef.current = Math.min(1, Math.max(0, -rect.top / range));
      };

      measure();
      window.addEventListener("scroll", measure, { passive: true });
      window.addEventListener("resize", measure);

      remove = () => {
        window.removeEventListener("scroll", measure);
        window.removeEventListener("resize", measure);
      };
    };

    raf = requestAnimationFrame(attach);

    return () => {
      cancelAnimationFrame(raf);
      remove?.();
    };
  }, [enabled]);

  return { elementRef, progressRef } as const;
}
