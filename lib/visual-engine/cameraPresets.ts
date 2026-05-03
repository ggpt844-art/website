import type { FlowArchetype, SceneType } from "@/lib/experience/experienceSchemas";
import type { CameraAngle, MovementStyle } from "@/lib/visual-engine/cameraTypes";

export type { CameraAngle, MovementStyle } from "@/lib/visual-engine/cameraTypes";

export interface CameraSpec {
  initialPosition: [number, number, number];
  initialTarget: [number, number, number];
  focalLength: string;
  cameraAngle: CameraAngle;
  movementStyle: MovementStyle;
  scrollCameraMoves: string[];
  hoverCameraMoves: string[];
  zoomMoments: string[];
  focusTargets: string[];
  mobileCameraFallback: string;
  reducedMotionCameraFallback: string;
}

export function buildCameraSpec(args: {
  sceneType: SceneType;
  archetype: FlowArchetype;
  accentLabel: string;
}): CameraSpec {
  const { sceneType, archetype, accentLabel } = args;

  const scrollFor = (
    hero: string,
    diagnostic: string,
    process: string,
  ): string[] => [
    `hero: ${hero}`,
    `diagnostic: ${diagnostic}`,
    `process: ${process}`,
  ];

  if (sceneType === "roof_storm_hotspot") {
    return {
      initialPosition: [2.2, 1.1, 5.8],
      initialTarget: [0, -0.15, 0],
      focalLength: "50mm equivalent — slight tele for roof readability",
      cameraAngle: "angled_product_launch",
      movementStyle:
        archetype === "emergency_conversion" ? "slow_dolly_in" : "inspection_pan",
      scrollCameraMoves: scrollFor(
        "wide storm roof read with leak hotspot legible",
        "zoom bias toward leak glow — guides diagnostic CTA",
        "pan to inspection overlay cadence — no whip pan",
      ),
      hoverCameraMoves: [
        "2° tilt toward leak hotspot",
        "micro parallax on foreground rain layer",
      ],
      zoomMoments: ["post-hero subtle dolly-in capped at 4% scale"],
      focusTargets: ["leak glow", "primary CTA band", accentLabel],
      mobileCameraFallback:
        "higher wide position [2.8, 1.4, 7], slower dolly, rain particle count reduced",
      reducedMotionCameraFallback:
        "static angled_product_launch — locked composition, no orbit",
    };
  }

  if (sceneType === "thermal_house_cutaway") {
    return {
      initialPosition: [3.2, 1.4, 5.2],
      initialTarget: [0, 0.2, 0],
      focalLength: "35mm — readable cutaway geometry",
      cameraAngle: "cutaway_technical",
      movementStyle: "diagnostic_zoom_in",
      scrollCameraMoves: scrollFor(
        "wide house cutaway establishing heat loss story",
        "zoom into attic thermal gradient — pairs with problem copy",
        "pull back to contained heat — proof of solution framing",
      ),
      hoverCameraMoves: ["gentle yaw ±4°", "vertical tilt toward heat plume"],
      zoomMoments: ["controlled zoom in on attic void only"],
      focusTargets: ["thermal gradient", "attic plane", "CTA card"],
      mobileCameraFallback:
        "camera pulls back, target lifts +0.25Y for thumb-zone legibility",
      reducedMotionCameraFallback:
        "static cutaway_technical — single locked hero frame",
    };
  }

  if (sceneType === "abstract_smile_sculpture" || sceneType === "clinical_glow_sphere") {
    return {
      initialPosition: [0, 0.15, 4.2],
      initialTarget: [0, 0, 0],
      focalLength: "85mm macro feel — premium clinical",
      cameraAngle:
        sceneType === "clinical_glow_sphere" ? "editorial_centered" : "close_macro_detail",
      movementStyle:
        sceneType === "clinical_glow_sphere" ? "luxury_drift" : "subtle_orbit",
      scrollCameraMoves: scrollFor(
        "close enamel / sculpture detail — calm confidence",
        "soft rotation emphasizing symmetry — treatment alignment",
        "pull back to editorial full composition — consultation calm",
      ),
      hoverCameraMoves: [" whisper orbit ±6°", "specular-safe tilt cap 2°"],
      zoomMoments: ["single luxury dolly capped 3%"],
      focusTargets: ["specular edge", "trust strip alignment", accentLabel],
      mobileCameraFallback:
        "macro distance +0.6Z, orbit speed halved, drift amplitude reduced",
      reducedMotionCameraFallback:
        "editorial_centered static — hero sculpture crisp, no spin",
    };
  }

  if (sceneType === "hvac_airflow_stack") {
    return {
      initialPosition: [2.6, 1.0, 5.5],
      initialTarget: [0, 0.1, 0],
      focalLength: "40mm — home silhouette + airflow vectors",
      cameraAngle: "wide_cinematic_establishing",
      movementStyle: "parallax_follow",
      scrollCameraMoves: scrollFor(
        "establishing comfort story — wide home silhouette",
        "vector-led read toward registers — diagnostic cue",
        "stabilize on equipment mid-plane — process trust",
      ),
      hoverCameraMoves: ["vector-follow tilt under 3°", "horizontal inspection pan"],
      zoomMoments: [],
      focusTargets: ["airflow ribbons", "comfort CTA", accentLabel],
      mobileCameraFallback:
        "wide push +1Z, parallax gain reduced 60%",
      reducedMotionCameraFallback:
        "static wide_cinematic_establishing, vectors as still overlay",
    };
  }

  if (
    sceneType === "terrain_landform_study" ||
    sceneType === "renovation_layer_cutaway"
  ) {
    return {
      initialPosition: [2.8, 2.0, 6.0],
      initialTarget: [0, -0.2, 0],
      focalLength: "28mm mild wide — landform / layers",
      cameraAngle:
        sceneType === "renovation_layer_cutaway" ? "split_depth_perspective" : "top_down_diagnostic",
      movementStyle: "inspection_pan",
      scrollCameraMoves: scrollFor(
        "oblique read of strata / layers — authority",
        "pan across problem plane — guides quote",
        "settle on scope card anchor",
      ),
      hoverCameraMoves: ["slow pan bias", "depth peel hint without roll"],
      zoomMoments: [],
      focusTargets: ["layer stack", "scope overlay", accentLabel],
      mobileCameraFallback:
        "raised camera, slower pan, fewer foreground particles",
      reducedMotionCameraFallback:
        "static split_depth or top_down — graphic still composition",
    };
  }

  /** Default precision / abstract */
  return {
    initialPosition: [1.8, 0.9, 5.2],
    initialTarget: [0, 0, 0],
    focalLength: "45mm — balanced product hero",
    cameraAngle: "editorial_centered",
    movementStyle: archetype === "portfolio_led" ? "luxury_drift" : "static_premium",
    scrollCameraMoves: scrollFor(
      "establish object read — restrained",
      "subtle push toward proof / diagnostic tie-in",
      "settle behind final CTA plane",
    ),
    hoverCameraMoves: ["micro tilt capped 2°"],
    zoomMoments: [],
    focusTargets: ["hero mass", "CTA", accentLabel],
    mobileCameraFallback: "+0.8Z pullback, drift disabled",
    reducedMotionCameraFallback: "editorial_centered locked frame",
  };
}
