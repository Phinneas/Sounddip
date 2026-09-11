// generateEditorial.mjs — generates editorial content (tagline, scene, venues,
// beginner) for placeholder cities using real listing data from D1 + DeepSeek.
//
// Run with: DEEPSEEK_API_KEY=sk-... node cms/src/scripts/generateEditorial.mjs
//
// Reads published listings from D1 via wrangler, extracts scene signals per
// city, calls DeepSeek with few-shot examples matching the site's editorial
// voice, and writes results to /tmp/sd_editorial.json. Then updates cities.ts.

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
if (!DEEPSEEK_KEY) { console.error('DEEPSEEK_API_KEY required'); process.exit(1); }

const CMS_DIR = new URL('../../', import.meta.url).pathname;
const CITIES_TS = new URL('../../../src/data/cities.ts', import.meta.url).pathname;

// ── Step 1: Query D1 for all published listings ──
console.log('Querying D1 for published listings...');
const d1Out = execSync(
  `npx wrangler d1 execute sounddip --remote --json --command "` +
  `SELECT l.name, l.address, l.booking_url, l.modality_description, ` +
  `c.slug as city_slug, c.name as city_name, c.region as city_region, ` +
  `GROUP_CONCAT(lmt.value) as modality_tags ` +
  `FROM listings l JOIN cities c ON l.city_id = c.id ` +
  `LEFT JOIN listings_modality_tags lmt ON lmt.parent_id = l.id ` +
  `WHERE l._status = 'published' GROUP BY l.id ORDER BY c.slug"`,
  { cwd: CMS_DIR, stdio: 'pipe', timeout: 30000 }
);
const listings = JSON.parse(String(d1Out))[0].results;
console.log(`  ${listings.length} published listings across ${new Set(listings.map(l => l.city_slug)).size} cities`);

// ── Step 2: Identify placeholder cities from cities.ts ──
const citiesTs = readFileSync(CITIES_TS, 'utf8');
const placeholderSlugs = [...citiesTs.matchAll(/slug: "([^"]+)"(?:(?!slug: ")[\s\S])*?beginner: "Browse the listings below/g)]
  .map(m => m[1]);
console.log(`  ${placeholderSlugs.length} placeholder cities to generate editorial for`);

// ── Step 3: Extract scene signals per city ──
function extractSignals(citySlug) {
  const cityListings = listings.filter(l => l.city_slug === citySlug);
  if (!cityListings.length) return null;

  const names = cityListings.map(l => l.name);
  const withAddress = cityListings.filter(l => l.address);
  const mobile = cityListings.filter(l => !l.address);
  const withWebsite = cityListings.filter(l => l.booking_url);

  // Neighborhood extraction from addresses
  const neighborhoods = {};
  withAddress.forEach(l => {
    const parts = String(l.address).split(',');
    // "123 Main St, Austin, TX 78704" → neighborhood is implicit in the address
    // We'll just note the city/sub-city if it differs
    if (parts.length >= 3) {
      const subCity = parts[parts.length - 2].trim();
      if (subCity && subCity.length > 2) {
        neighborhoods[subCity] = (neighborhoods[subCity] || 0) + 1;
      }
    }
  });

  // Modality breakdown
  const modalities = {};
  cityListings.forEach(l => {
    String(l.modality_tags || '').split(',').forEach(t => {
      t = t.trim();
      if (t) modalities[t] = (modalities[t] || 0) + 1;
    });
  });

  // Top practitioners (by name — we don't have review counts in D1)
  const practitioners = cityListings.map(l => ({
    name: l.name,
    address: l.address || null,
    website: l.booking_url || null,
    modalities: l.modality_tags || '',
    description: l.modality_description || '',
  }));

  return {
    total: cityListings.length,
    withAddress: withAddress.length,
    mobile: mobile.length,
    withWebsite: withWebsite.length,
    neighborhoods: Object.entries(neighborhoods).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n, c]) => `${n} (${c})`),
    modalities: Object.entries(modalities).sort((a, b) => b[1] - a[1]).map(([m, c]) => `${m}: ${c}`),
    practitioners: practitioners.slice(0, 10),
  };
}

// ── Step 4: Build prompt and call DeepSeek ──
const FEWSHOT = `Here are two examples of the editorial voice for existing cities:

=== AUSTIN (example) ===
TAGLINE: The quietest city in the loudest state.
SCENE: Austin's sound bath scene is small enough to feel like a secret and just developed enough to take seriously. The city's wellness culture runs deep — yoga studios here have been filling for twenty years — but sound healing arrived late and hasn't been colonized by studio chains yet. What you find instead are independent practitioners working out of converted bungalows, yoga lofts on the east side, and the occasional backyard pop-up in Barton Hills.

The city's music identity is everywhere here, even in the healing space. Practitioners tend to have a background in actual performance — several are working musicians who found their way to sound healing through recording and acoustics. That shows in the sessions: there's more improvisation, more attention to room resonance, less clinical rigidity than you'd find in a coastal city.

Letsbatch — a party-booking platform — currently outranks every local practitioner in search results, which tells you exactly how much room there is. No editorial has covered the scene. No directory exists. Austin is a first-mover opportunity for anyone willing to show up consistently.
VENUES: [{"name":"Meditation Bar","note":"The most developed studio in the city — multiple weekly sessions, trained practitioners, consistent format."},{"name":"East Austin yoga lofts","note":"Several studios on the east side host rotating sound practitioners; check individual studio schedules."},{"name":"Private home sessions","note":"A meaningful portion of Austin's practitioners work by appointment only — worth asking around."}]
BEGINNER: Start with Meditation Bar on a weeknight — the sessions run 60 minutes, the room is well-designed for sound, and the instructors explain what's happening before you lie down. Bring a mat and something warm. Austin studios run cold.

=== DENVER (example) ===
TAGLINE: Denver metro plus the Boulder cluster — the densest sound healing concentration outside LA.
SCENE: Denver and Boulder together form the densest sound healing cluster outside of Los Angeles. Boulder specifically has nationally recognized practitioners — several have trained with lineage teachers, run certification programs, and attract students from across the country. Denver captures the metro demand; Boulder has the institutional depth.

The Denver scene is more accessible and mainstream than Boulder's — studios in RiNo and Capitol Hill have added sound sessions to yoga programming, and the format is increasingly showing up in corporate wellness programs given Denver's tech and outdoor industry presence. The price range is reasonable and the quality floor is higher than you'd expect from a market this size.
VENUES: [{"name":"RiNo arts district","note":"Highest concentration of studios with sound programming in Denver proper."},{"name":"Boulder practitioner network","note":"Multiple nationally recognized practitioners, retreat formats, certification training. Worth the 45-minute drive."},{"name":"Capitol Hill Denver","note":"Several established yoga studios with rotating sound practitioners."}]
BEGINNER: Start in Denver proper rather than driving to Boulder — the RiNo studios have well-run group sessions at accessible price points. Once you've been to two or three sessions and know you want to go deeper, a Boulder retreat or workshop with a credentialed teacher is a natural next step.`;

async function generateEditorial(cityName, region, signals) {
  const dataSummary = `
CITY: ${cityName}, ${region}
TOTAL PUBLISHED LISTINGS: ${signals.total}
LISTINGS WITH PHYSICAL ADDRESS: ${signals.withAddress}
MOBILE/TRAVELING PRACTITIONERS (no address): ${signals.mobile}
LISTINGS WITH WEBSITE: ${signals.withWebsite}
NEIGHBORHOOD/AREA CLUSTERS: ${signals.neighborhoods.join(', ') || 'data insufficient'}
MODALITY BREAKDOWN: ${signals.modalities.join(', ') || 'data insufficient'}
TOP PRACTITIONERS (name | address | website | modalities):
${signals.practitioners.map(p => `  - ${p.name} | ${p.address || 'mobile/no address'} | ${p.website || 'no website'} | ${p.modalities || 'unknown'}`).join('\n')}`;

  const prompt = `You are the editorial writer for Sounddip, a sound bath practitioner directory. Write editorial content for a city page in the site's distinctive voice: opinionated, specific, grounded in real practitioner data, never generic. Name real practitioners from the data. Compare to other cities when relevant. Give practical beginner advice.

${FEWSHOT}

Now generate editorial content for this city based on the real listing data below. Match the voice exactly — be specific, opinionated, and grounded in the data. Name real practitioners. If the scene is small, say so honestly. Don't fabricate details not in the data — but DO make editorial judgments about what the data tells you.

${dataSummary}

Return JSON with this exact shape:
{"tagline": "short hook (5-12 words)", "scene": "2-3 paragraphs of editorial narrative. Use \\n\\n for paragraph breaks.", "venues": [{"name": "real practitioner or area name from the data", "note": "1-sentence editorial note"}, ...up to 3], "beginner": "2-3 sentences of practical first-timer advice referencing real practitioners"}`;

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_KEY}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  });
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || '';
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

// ── Step 5: Generate for all placeholder cities ──
const results = {};
for (const slug of placeholderSlugs) {
  const signals = extractSignals(slug);
  if (!signals) { console.log(`  ⚠ ${slug}: no listings found, skipping`); continue; }

  // Find city name/region from signals
  const cityListings = listings.filter(l => l.city_slug === slug);
  const cityName = cityListings[0]?.city_name || slug;
  const cityRegion = cityListings[0]?.city_region || '';

  console.log(`  generating: ${cityName}, ${cityRegion} (${signals.total} listings)...`);
  try {
    const editorial = await generateEditorial(cityName, cityRegion, signals);
    if (editorial) {
      results[slug] = editorial;
      console.log(`    ✓ tagline: "${editorial.tagline?.slice(0, 60)}..."`);
    } else {
      console.log(`    ✗ failed to parse`);
    }
  } catch (err) {
    console.log(`    ✗ error: ${err.message}`);
  }
  await new Promise(r => setTimeout(r, 500)); // rate limit
}

// ── Step 6: Write results to JSON ──
writeFileSync('/tmp/sd_editorial.json', JSON.stringify(results, null, 2));
console.log(`\n${Object.keys(results).length} cities generated → /tmp/sd_editorial.json`);

// ── Step 7: Update cities.ts ──
let updated = citiesTs;
let count = 0;
for (const [slug, editorial] of Object.entries(results)) {
  // Find the placeholder entry and replace its fields
  const taglineOld = `Sound baths in `;
  // We need to find the block for this slug and replace tagline, scene, venues, beginner
  // Strategy: find the slug, then replace the next tagline, scene, venues, beginner within that block

  const slugPattern = `slug: "${slug}"`;
  const slugIdx = updated.indexOf(slugPattern);
  if (slugIdx === -1) continue;

  // Find the next slug after this one (or end of array)
  const nextSlugIdx = updated.indexOf('slug: "', slugIdx + slugPattern.length);
  const blockEnd = nextSlugIdx === -1 ? updated.indexOf('];', slugIdx) : nextSlugIdx;
  const block = updated.slice(slugIdx, blockEnd);

  let newBlock = block;

  // Replace tagline
  newBlock = newBlock.replace(
    /tagline: "Sound baths in [^"]+\."[^"]*"/,
    `tagline: "${editorial.tagline.replace(/"/g, '\\"')}"`
  );

  // Replace scene
  const sceneStr = editorial.scene.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  newBlock = newBlock.replace(
    /scene: `[^`]*`/,
    `scene: \`${sceneStr}\``
  );

  // Replace venues
  const venuesStr = editorial.venues.map(v =>
    `      { name: "${v.name.replace(/"/g, '\\"')}", note: "${v.note.replace(/"/g, '\\"')}" },`
  ).join('\n');
  newBlock = newBlock.replace(
    /venues: \[\],/,
    `venues: [\n${venuesStr}\n    ],`
  );

  // Replace beginner
  newBlock = newBlock.replace(
    /beginner: "Browse the listings below[^"]*"/,
    `beginner: "${editorial.beginner.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`
  );

  if (newBlock !== block) {
    updated = updated.slice(0, slugIdx) + newBlock + updated.slice(blockEnd);
    count++;
  }
}

writeFileSync(CITIES_TS, updated);
console.log(`Updated ${count} city entries in cities.ts`);
