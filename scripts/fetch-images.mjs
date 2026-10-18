#!/usr/bin/env node
/**
 * Downloads every city hero image referenced in src/data/cities.ts and writes
 * self-hosted WebP renditions into public/img/cities/.
 *
 * The site previously hotlinked images.pexels.com directly. Pexels' licence
 * permits commercial use with no attribution requirement, but serving the files
 * from our own origin removes a third-party dependency from every city page and
 * lets us control format and weight.
 *
 * Emits two renditions per city — 1200w for desktop and 640w for mobile — plus
 * public/img/cities/manifest.json recording each image's dimensions and byte
 * size, so CityHero can set width/height and avoid layout shift.
 *
 * Usage:
 *   node scripts/fetch-images.mjs            # download + convert all
 *   node scripts/fetch-images.mjs --slug=austin   # one city, for spot checks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CITIES_TS = path.join(ROOT, 'src', 'data', 'cities.ts');
const OUT_DIR = path.join(ROOT, 'public', 'img', 'cities');
const TMP_DIR = path.join(ROOT, '.image-cache');

const WIDTHS = [1200, 640];
const QUALITY = 78;

const onlySlug = (() => {
  const arg = process.argv.find((a) => a.startsWith('--slug='));
  return arg ? arg.slice('--slug='.length) : null;
})();

// Pull `slug` + `imgSource` pairs straight out of cities.ts so this script
// never drifts from the data file it serves. `imgSource` is the upstream Pexels
// URL; the site itself renders the local `/img/cities/*.webp` paths that
// cities.ts derives from the slug.
function readCityImages() {
  const src = fs.readFileSync(CITIES_TS, 'utf8');
  const blocks = src.split(/\n  \{\n/).slice(1);
  const out = [];
  for (const block of blocks) {
    const slug = block.match(/slug: "([^"]+)"/)?.[1];
    const img = block.match(/imgSource: "([^"]+)"/)?.[1];
    if (slug && img) out.push({ slug, img });
  }
  return out;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'sounddip/1.0 (image self-hosting)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  const cities = readCityImages().filter((c) => !onlySlug || c.slug === onlySlug);
  if (cities.length === 0) {
    console.error(onlySlug ? `No city matched --slug=${onlySlug}` : 'No city images found in cities.ts');
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });

  const manifest = {};
  let failed = 0;

  for (const { slug, img } of cities) {
    const raw = path.join(TMP_DIR, `${slug}.src`);
    try {
      if (!fs.existsSync(raw)) await download(img, raw);
      const image = sharp(raw).rotate(); // .rotate() honours EXIF orientation
      const meta = await image.metadata();

      const renditions = {};
      for (const w of WIDTHS) {
        // Never upscale: if the source is narrower than the target, cap it.
        const target = Math.min(w, meta.width ?? w);
        const outPath = path.join(OUT_DIR, `${slug}-${target}.webp`);
        await image
          .clone()
          .resize({ width: target })
          .webp({ quality: QUALITY })
          .toFile(outPath);
        renditions[target] = {
          file: `/img/cities/${slug}-${target}.webp`,
          bytes: fs.statSync(outPath).size,
        };
      }

      const widest = Math.max(...Object.keys(renditions).map(Number));
      manifest[slug] = {
        source: img,
        width: widest,
        height: Math.round(((meta.height ?? 0) / (meta.width ?? 1)) * widest),
        renditions,
      };
      const kb = Math.round(renditions[widest].bytes / 1024);
      console.log(`  ✓ ${slug.padEnd(18)} ${widest}w  ${kb}kb  (${meta.format})`);
    } catch (err) {
      failed++;
      console.error(`  ✗ ${slug}: ${err.message}`);
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const totalBytes = Object.values(manifest).reduce(
    (sum, m) => sum + Object.values(m.renditions).reduce((s, r) => s + r.bytes, 0),
    0,
  );
  console.log(
    `\n${Object.keys(manifest).length} cities written to public/img/cities/ ` +
      `(${(totalBytes / 1024 / 1024).toFixed(1)} MB total, all renditions)`,
  );
  if (failed) {
    console.error(`${failed} failed — manifest is incomplete, do not deploy.`);
    process.exit(1);
  }
}

main();
