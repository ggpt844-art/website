"use client";

import { createContext, useContext, type MutableRefObject } from "react";

export type RoofHeroScrollValue = {
  progress: MutableRefObject<number>;
};

export const RoofHeroScrollContext = createContext<RoofHeroScrollValue | null>(null);

export function useRoofHeroScroll() {
  return useContext(RoofHeroScrollContext);
}
