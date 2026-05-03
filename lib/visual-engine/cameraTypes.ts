/** Camera taxonomy — kept separate to avoid circular imports with experience schemas. */

export const CameraAngleSchemaValues = [
  "low_angle_power",
  "top_down_diagnostic",
  "close_macro_detail",
  "wide_cinematic_establishing",
  "angled_product_launch",
  "cutaway_technical",
  "editorial_centered",
  "split_depth_perspective",
] as const;

export type CameraAngle = (typeof CameraAngleSchemaValues)[number];

export const MovementStyleSchemaValues = [
  "slow_dolly_in",
  "subtle_orbit",
  "parallax_follow",
  "scroll_reveal_zoom",
  "diagnostic_zoom_in",
  "inspection_pan",
  "tilt_to_detail",
  "static_premium",
  "luxury_drift",
] as const;

export type MovementStyle = (typeof MovementStyleSchemaValues)[number];
