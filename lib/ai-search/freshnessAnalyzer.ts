export function analyzeFreshness() {
  return {
    lastUpdated: new Date().toISOString().slice(0, 10),
    staleSections: [] as string[],
    recommendedRefreshes: [
      "Refresh FAQ seasonally with owner-approved copy",
      "Rotate gallery when new approved project photos exist",
    ],
  };
}
