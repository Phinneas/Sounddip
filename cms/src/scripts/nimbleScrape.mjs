// nimbleScrape.mjs — nationwide sound-bath listing scraper via Nimble.
//
// Primary source: Nimble Search (focus: "location") → name, website, address,
// phone, zip (parsed), rating, review_count. Enrichment: google_maps_search
// template → lat/lng, categories, place_id. Merged per metro by normalized name.
//
// Verification policy: listings that look operational are classified
// `auto-verified` (visible on the site with a neutral "Listed" badge — NOT
// "Vetted in person"). Two paths:
//   (a) Fixed location (address OR phone): website + reviews >= MIN_REVIEWS.
//   (b) Mobile/traveling practitioner (no NAP): website + reviews >= MOBILE_MIN_REVIEWS.
// Everything else is `needs-verification` (hidden until human review). This
// keeps the "vetted" claim honest while still auto-publishing the good-looking set.
//
// DRY_RUN=true (default): no writes to the CMS, just a per-metro report.
// Set DRY_RUN=false to write (creates missing city docs + listings).
//
// Env: NIMBLE_API_KEY (required), CMS_API, METROS (comma slugs), QUERIES,
// MAX_RESULTS, MIN_REVIEWS, DRY_RUN, CONCURRENCY.

import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { execSync } from 'node:child_process';

const NIMBLE_KEY = process.env.NIMBLE_API_KEY || readFileSync('/tmp/sd_nimble_key', 'utf8').trim();
const CMS_API = process.env.CMS_API || 'https://sounddip-cms.buzzuw2.workers.dev';
const METROS = (process.env.METROS || 'austin,atlanta').split(',').map(s => s.trim()).filter(Boolean);
const QUERIES = (process.env.QUERIES || 'sound bath').split(',').map(s => s.trim()).filter(Boolean);
const MAX_RESULTS = Number(process.env.MAX_RESULTS || 20);
const MIN_REVIEWS = Number(process.env.MIN_REVIEWS || 10);
const MOBILE_MIN_REVIEWS = Number(process.env.MOBILE_MIN_REVIEWS || 40);
const DRY_RUN = process.env.DRY_RUN !== 'false';
const WRITE_MODE = process.env.WRITE_MODE || 'rest'; // 'rest' (CMS API) or 'd1' (direct SQL via wrangler)
const CONCURRENCY = Number(process.env.CONCURRENCY || 2);

const metroTargets = JSON.parse(readFileSync(new URL('./metroTargets.json', import.meta.url), 'utf8'));

// ── helpers ──
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function postJson(url, body, { timeoutMs = 110000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${NIMBLE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch { json = { _raw: text }; }
    return { ok: res.ok, status: res.status, json };
  } finally { clearTimeout(t); }
}

async function getJson(url, { timeoutMs = 30000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${NIMBLE_KEY}` }, signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; } finally { clearTimeout(t); }
}

// CMS REST API helpers — no auth (Listings collection allows public create).
async function cmsGet(path) {
  const res = await fetch(`${CMS_API}${path}`);
  if (!res.ok) return null;
  return await res.json();
}

async function cmsPost(path, body) {
  const res = await fetch(`${CMS_API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = { _raw: text }; }
  return { ok: res.ok, status: res.status, json };
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sqlEscape(s) {
  return String(s ?? '').replace(/'/g, "''");
}

function sqlVal(s) {
  if (s == null || s === '') return 'NULL';
  return `'${sqlEscape(s)}'`;
}

function sqlNum(n) {
  if (n == null || isNaN(n)) return 'NULL';
  return String(n);
}

function normalizeName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b(sound healing|sound therapy|sound bath|in|austin|tx|los angeles|ca|new york|ny|atlanta|ga)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseZip(address) {
  const m = String(address || '').match(/\b(\d{5})(?:-\d{4})?\b\s*$/);
  return m ? m[1] : null;
}

function parseState(address) {
  const m = String(address || '').match(/,\s+([A-Z]{2})\s+\d{5}/);
  return m ? m[1] : null;
}

function cleanWebsite(url) {
  const u = String(url || '');
  // Drop Google Maps search links — not a business website.
  if (/google\.com\/maps|search\/\?api=1/.test(u)) return null;
  if (!u) return null;
  return u.startsWith('http') ? u : `https://${u}`;
}

function parseRating(r) {
  const m = String(r || '').match(/([0-9.]+)/);
  return m ? parseFloat(m[1]) : null;
}

function inferModalities(title, categories) {
  const t = String(title || '').toLowerCase();
  const cats = (categories || []).join(' ').toLowerCase();
  const tags = [];
  if (/\bgong\b/.test(t)) tags.push('gong');
  if (/\bcrystal\b/.test(t)) tags.push('crystal');
  if (/singing bowl|tibetan|himalayan/.test(t)) tags.push('tibetan-bowls');
  if (/reiki/.test(t)) tags.push('reiki');
  if (/breath/.test(t)) tags.push('breathwork');
  if (/voice|vocal/.test(t)) tags.push('voice');
  if (tags.length === 0) tags.push('other');
  return tags;
}

// ── Nimble calls ──
async function nimbleLocationSearch(query) {
  const { ok, status, json } = await postJson('https://sdk.nimbleway.com/v2/search', {
    query, focus: 'location', max_results: MAX_RESULTS, search_depth: 'lite',
  });
  if (!ok) { console.error(`  [location search failed: ${status}] ${query}`); return []; }
  return (json.results || []).map(r => ({
    name: r.title,
    website: cleanWebsite(r.url),
    address: r.additional_data?.address,
    phone: r.additional_data?.phone,
    rating: r.additional_data?.rating ?? null,
    reviews: r.additional_data?.review_count != null ? Number(r.additional_data.review_count) : null,
    description: r.description,
    source: 'nimble_location_search',
  }));
}

async function nimbleMapsSearch(query) {
  const { ok, status, json } = await postJson('https://sdk.nimbleway.com/v2/extract/templates/run', {
    template: 'google_maps_search', params: { query },
  });
  if (!ok || !json?.data?.parsing) { console.error(`  [maps search failed: ${status}] ${query}`); return []; }
  const results = json.data.parsing.entities?.SearchResult || [];
  return results.map(r => ({
    name: r.title,
    lat: r.latitude != null ? parseFloat(r.latitude) : null,
    lng: r.longitude != null ? parseFloat(r.longitude) : null,
    categories: r.business_category || [],
    place_id: r.place_id,
    business_status: r.business_status,
    website: r.place_information?.website_url || null,
    rating: parseRating(r.rating),
    reviews: r.number_of_reviews != null ? Number(r.number_of_reviews) : null,
    source: 'nimble_google_maps_search',
  }));
}

// ── CMS reads (for dedup) ──
async function readExisting() {
  const cities = (await cmsGet('/api/cities?limit=100'))?.docs || [];
  const listings = (await cmsGet('/api/listings?limit=500&depth=0'))?.docs || [];
  const cityById = new Map(); // slug → id
  for (const c of cities) cityById.set(c.slug, c.id);
  const existingNames = new Set(listings.map(l => normalizeName(l.name)));
  const existingUrls = new Set(listings.map(l => l.bookingUrl).filter(Boolean));
  return { cityById, existingNames, existingUrls, cityCount: cities.length, listingCount: listings.length };
}

// ── per-metro pipeline ──
async function scrapeMetro(metro, existing) {
  const queries = QUERIES.map(q => `${q} in ${metro.name}, ${metro.state}`);
  const byName = new Map();

  for (const q of queries) {
    const [loc, maps] = await Promise.all([
      nimbleLocationSearch(q),
      nimbleMapsSearch(q),
    ]);
    for (const r of loc) {
      const key = normalizeName(r.name);
      if (!key) continue;
      if (!byName.has(key)) byName.set(key, { loc: r, maps: null });
    }
    for (const r of maps) {
      const key = normalizeName(r.name);
      if (!key) continue;
      const entry = byName.get(key) || { loc: null, maps: null };
      entry.maps = r;
      byName.set(key, entry);
    }
    await sleep(300);
  }

  // Build merged listing records.
  const merged = [];
  for (const [, { loc, maps }] of byName) {
    const name = loc?.name || maps?.name;
    if (!name) continue;
    const website = loc?.website || (maps?.website ? cleanWebsite(maps.website) : null);
    const address = loc?.address || null;
    const phone = loc?.phone || null;
    const reviews = loc?.reviews ?? maps?.reviews ?? null;
    const rating = loc?.rating ?? maps?.rating ?? null;
    const lat = maps?.lat ?? null;
    const lng = maps?.lng ?? null;
    const categories = maps?.categories || [];
    const place_id = maps?.place_id || null;

    // Auto-verify if it looks operational. Two paths:
    //  (a) Has a physical location (address OR phone): website + reviews >= MIN_REVIEWS.
    //  (b) No NAP (mobile/traveling practitioner): website + reviews >= MOBILE_MIN_REVIEWS.
    //      This catches itinerant sound-bath practitioners who run sessions at
    //      homes, studios, and retreats rather than a fixed address.
    const hasNAP = !!(address || phone);
    const autoVerified = !!(
      website &&
      reviews != null &&
      (hasNAP ? reviews >= MIN_REVIEWS : reviews >= MOBILE_MIN_REVIEWS)
    );

    const alreadyExists = existing.existingNames.has(normalizeName(name)) ||
      (website && existing.existingUrls.has(website));

    merged.push({
      name, website, address, phone,
      zip: parseZip(address), state: parseState(address) || metro.state,
      lat, lng, categories, place_id, rating, reviews,
      modalityTags: inferModalities(name, categories),
      listingStatus: autoVerified ? 'auto-verified' : 'needs-verification',
      _status: autoVerified ? 'published' : 'draft',
      citySlug: metro.slug,
      alreadyExists,
    });
  }

  return merged;
}

// ── main ──
(async () => {
  console.log(`\n=== Nimble scrape ${DRY_RUN ? 'DRY RUN' : 'LIVE'} ===`);
  console.log(`metros: ${METROS.join(', ')} | queries: ${QUERIES.join(', ')} | max_results: ${MAX_RESULTS} | min_reviews: ${MIN_REVIEWS}\n`);

  const existing = await readExisting();
  console.log(`CMS: ${existing.cityCount} cities, ${existing.listingCount} listings (for dedup)\n`);

  const targets = metroTargets.filter(m => METROS.includes(m.slug));
  if (!targets.length) { console.error('No matching metros.'); process.exit(1); }

  let totalNew = 0, totalAuto = 0, totalFlagged = 0, totalDup = 0;
  let totalWritten = 0, totalWriteFailed = 0;
  const allFresh = []; // collected for D1 write mode
  for (const metro of targets) {
    console.log(`── ${metro.name}, ${metro.state} (${metro.slug}) ──`);
    const merged = await scrapeMetro(metro, existing);
    const fresh = merged.filter(m => !m.alreadyExists);
    const dups = merged.filter(m => m.alreadyExists);
    const auto = fresh.filter(m => m.listingStatus === 'auto-verified');
    const flagged = fresh.filter(m => m.listingStatus === 'needs-verification');
    console.log(`  raw merged: ${merged.length} | already in CMS: ${dups.length} | new: ${fresh.length} (auto-verified: ${auto.length}, needs-verification: ${flagged.length})`);

    const cityId = existing.cityById.get(metro.slug);
    if (!DRY_RUN && !cityId) {
      console.log(`  ⚠ city "${metro.slug}" not found in CMS — create it first. Skipping writes.`);
    }
    if (!DRY_RUN && cityId) {
      if (WRITE_MODE === 'rest') {
        let written = 0, failed = 0;
        for (const m of fresh) {
          const slug = `${slugify(m.name)}-${metro.slug}`;
          const body = {
            name: m.name, slug, city: cityId,
            address: m.address || undefined, state: m.state || undefined,
            zip: m.zip || undefined, lat: m.lat ?? undefined, lng: m.lng ?? undefined,
            phone: m.phone || undefined, bookingUrl: m.website || undefined,
            modalityTags: m.modalityTags, source: 'Nimble (google_maps_search + location search)',
            listingStatus: m.listingStatus,
          };
          const path = m.listingStatus === 'auto-verified' ? '/api/listings' : '/api/listings?draft=true';
          const { ok, status, json } = await cmsPost(path, body);
          if (ok) { written++; }
          else { failed++; console.error(`    ✗ failed: ${m.name} (${status}) ${json?.errors?.[0]?.message || ''}`); }
          await sleep(100);
        }
        console.log(`  written: ${written} (${failed} failed)`);
        totalWritten += written; totalWriteFailed += failed;
      } else if (WRITE_MODE === 'd1') {
        for (const m of fresh) allFresh.push({ ...m, cityId, slug: `${slugify(m.name)}-${metro.slug}` });
      }
    }

    console.log(`  -- auto-verified sample (up to 5) --`);
    auto.slice(0, 5).forEach(m => console.log(`    ✓ ${m.name} | ${m.reviews}★ ${m.rating} | ${m.address || '(no addr)'} | ${m.phone || '(no phone)'} | ${m.website} | lat ${m.lat}`));
    console.log(`  -- needs-verification sample (up to 3) --`);
    flagged.slice(0, 3).forEach(m => console.log(`    ? ${m.name} | reviews ${m.reviews} | ${m.address || '(no addr)'} | ${m.phone || '(no phone)'} | ${m.website || '(no site)'}`));
    console.log('');
    totalNew += fresh.length; totalAuto += auto.length; totalFlagged += flagged.length; totalDup += dups.length;
  }

  // ── D1 direct write mode ──
  if (!DRY_RUN && WRITE_MODE === 'd1' && allFresh.length > 0) {
    // Query max listing ID to assign explicit IDs (avoids last_insert_rowid issues).
    const cmsDir = new URL('../../', import.meta.url).pathname;
    let maxId = 0;
    try {
      const out = execSync(`npx wrangler d1 execute sounddip --remote --command "SELECT MAX(id) AS mx FROM listings" --json`, { cwd: cmsDir, stdio: 'pipe', timeout: 30000 });
      const parsed = JSON.parse(String(out));
      maxId = parsed[0]?.results?.[0]?.mx || 0;
    } catch {}
    let nextId = maxId + 1;
    console.log(`\n  D1 write: ${allFresh.length} listings (starting at id=${nextId}, max was ${maxId})`);

    const lines = [];
    for (const m of allFresh) {
      const listingId = nextId++;
      const status = m.listingStatus === 'auto-verified' ? 'published' : 'draft';
      lines.push(
        `INSERT INTO listings (id, name, slug, city_id, address, state, zip, lat, lng, phone, booking_url, modality_description, source, listing_status, _status, featured) ` +
        `VALUES (${listingId}, ${sqlVal(m.name)}, ${sqlVal(m.slug)}, ${m.cityId}, ${sqlVal(m.address)}, ${sqlVal(m.state)}, ${sqlVal(m.zip)}, ${sqlNum(m.lat)}, ${sqlNum(m.lng)}, ${sqlVal(m.phone)}, ${sqlVal(m.website)}, ${sqlVal(m.modalityTags.join(', '))}, ${sqlVal('Nimble (google_maps_search + location search)')}, ${sqlVal(m.listingStatus)}, ${sqlVal(status)}, 0);`
      );
      for (let i = 0; i < m.modalityTags.length; i++) {
        lines.push(
          `INSERT INTO listings_modality_tags ("order", parent_id, value) VALUES (${i}, ${listingId}, ${sqlVal(m.modalityTags[i])});`
        );
      }
    }
    const sqlFile = '/tmp/sd_scrape_inserts.sql';
    writeFileSync(sqlFile, lines.join('\n'));
    try {
      execSync(`npx wrangler d1 execute sounddip --remote --file=${sqlFile}`, { cwd: cmsDir, stdio: 'pipe', timeout: 60000 });
      console.log(`  D1 write: SUCCESS — ${allFresh.length} listings inserted`);
      totalWritten = allFresh.length;
    } catch (err) {
      console.error(`  D1 write: FAILED — ${err.message}`);
      if (err.stdout) console.error(String(err.stdout).slice(0, 800));
      if (err.stderr) console.error(String(err.stderr).slice(0, 800));
      totalWriteFailed = allFresh.length;
    }
    try { unlinkSync(sqlFile); } catch {}
  }

  console.log(`=== TOTALS ===`);
  console.log(`new: ${totalNew} (auto-verified: ${totalAuto}, needs-verification: ${totalFlagged}) | already in CMS: ${totalDup}`);
  if (!DRY_RUN) console.log(`written: ${totalWritten} (${totalWriteFailed} failed) [mode: ${WRITE_MODE}]`);
  if (DRY_RUN) console.log('(DRY RUN — nothing written. Set DRY_RUN=false to write.)');
})();
