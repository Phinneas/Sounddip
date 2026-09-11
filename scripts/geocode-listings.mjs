#!/usr/bin/env node
/**
 * Geocodes every visible CMS listing to a lat/lng and writes the result to
 * public/listings.geo.json, which the "Sessions near you" map reads.
 *
 * Uses Nominatim (OpenStreetMap) — free, no API key. Runs once; the output
 * JSON is committed so the deployed build needs no geocoding step.
 *
 * Usage:
 *   node scripts/geocode-listings.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'public', 'listings.geo.json');
const CMS_API = 'https://sounddip-cms.buzzuw2.workers.dev';
const VISIBLE_STATUSES = ['active', 'active-secondary'];
const USER_AGENT = 'sounddip/1.0 (sound bath directory; geocoding listings)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchAllListings() {
  const all = [];
  let page = 1;
  let hasNext = true;
  while (hasNext && page <= 20) {
    const data = await fetchJson(`${CMS_API}/api/listings?limit=500&page=${page}&depth=1`);
    const docs = data.docs || [];
    all.push(...docs);
    hasNext = !!data.hasNextPage;
    if (!docs.length) break;
    page++;
  }
  return all.filter((l) => l._status === 'published' && VISIBLE_STATUSES.includes(l.listingStatus));
}

function locationQuery(listing) {
  const city = listing.city && typeof listing.city === 'object' ? listing.city : null;
  const cityName = city?.name || '';
  const region = city?.region || listing.state || '';
  const neighborhood = listing.neighborhood && listing.neighborhood.toLowerCase() !== 'unknown' ? listing.neighborhood.trim() : '';
  const parts = [neighborhood, cityName, region].filter(Boolean);
  return parts.join(', ');
}

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&countrycodes=us&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Geocode HTTP ${res.status} for "${query}"`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), place: data[0].display_name, query };
}

async function main() {
  console.log('Fetching visible listings from CMS…');
  const listings = await fetchAllListings();
  console.log(`Found ${listings.length} visible listings to geocode.`);

  const out = [];
  let ok = 0;
  let failed = 0;

  for (const l of listings) {
    const query = locationQuery(l);
    const city = l.city && typeof l.city === 'object' ? l.city : null;
    const cityFallback = [city?.name, city?.region].filter(Boolean).join(', ');
    try {
      let geo = await geocode(query);
      if (!geo && cityFallback && cityFallback !== query) {
        geo = await geocode(cityFallback); // fall back to city + state
      }
      if (!geo) {
        failed++;
        console.warn(`  ⚠ no result: "${l.name}" (${query})`);
        continue;
      }
      out.push({
        id: l.id,
        name: l.name,
        city: city?.name || '',
        citySlug: city?.slug || '',
        neighborhood: l.neighborhood || '',
        lat: geo.lat,
        lng: geo.lng,
        bookingUrl: l.bookingUrl || '',
        sessionDescription: l.sessionDescription || '',
        price: l.price || '',
        duration: l.duration || '',
        listingStatus: l.listingStatus,
      });
      ok++;
    } catch (err) {
      failed++;
      console.warn(`  ✗ ${err.message}`);
    }
    await sleep(1100); // Nominatim's 1 req/sec usage policy
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n');
  console.log(`\nDone: ${ok} geocoded, ${failed} failed.`);
  console.log(`Wrote ${OUT_PATH}`);
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
