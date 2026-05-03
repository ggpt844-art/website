/**
 * Build a crisp full-width hero JPEG from public/hero-storefront.png (or .jpg).
 * Outputs public/hero-cover.jpg (cover crop, never upscaled past your photo’s pixel size).
 * For a truly sharp hero, use a source at least ~2000px wide; thumbnails will always look soft.
 */
import sharp from "sharp";
import { existsSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const inputPng = resolve(root, "public/hero-storefront.png");
const inputJpg = resolve(root, "public/hero-storefront.jpg");
const input = existsSync(inputPng) ? inputPng : existsSync(inputJpg) ? inputJpg : null;
const outJpg = resolve(root, "public/hero-cover.jpg");
/** Legacy path kept in sync for old links / CDNs */
const legacyJpg = resolve(root, "public/hero-1920.jpg");

if (!input) {
  console.error("No public/hero-storefront.png or .jpg — add a source image first.");
  process.exit(1);
}

const buf = await sharp(input)
  .rotate()
  /** Skip upscaling small sources — interpolating to 2560px pre-softens; browser scale is one pass. */
  .resize(2560, 1440, {
    fit: "cover",
    position: "center",
    kernel: sharp.kernel.lanczos3,
    withoutEnlargement: true,
  })
  .sharpen({ sigma: 0.45 })
  .jpeg({ quality: 96, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toBuffer();

writeFileSync(outJpg, buf);
writeFileSync(legacyJpg, buf);

console.log("Wrote", outJpg, "and", legacyJpg);
