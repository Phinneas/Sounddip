#!/usr/bin/env node
/**
 * Purges Cloudflare's edge cache for the blog and sitemap after a deploy.
 *
 * Without this, a freshly deployed post can serve the previous build's HTML from
 * the edge for a while — the deploy looks like it soft-404'd when it is really a
 * stale cache copy. Purging by URL prefix clears the whole blog tree in one call.
 *
 * Requires a Cloudflare API token with Zone / Cache Purge : Edit for the
 * sounddip.com zone:
 *   CLOUDFLARE_API_TOKEN   — the API token (not the Wrangler OAuth token)
 *   CLOUDFLARE_ZONE_ID     — optional; looked up from the token if unset
 *
 * Usage: node scripts/purge-cache.mjs
 * Runs automatically as a `postdeploy` hook — see package.json.
 */

const PREFIXES = [
  'https://www.sounddip.com/blog/',
  'https://www.sounddip.com/sitemap.xml',
  'https://www.sounddip.com/robots.txt',
];

const API = 'https://api.cloudflare.com/client/v4';

function fail(message) {
  console.error(`\n✖ cache purge failed: ${message}\n`);
  process.exit(1);
}

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  fail(
    'CLOUDFLARE_API_TOKEN is not set.\n\n' +
      '  The Wrangler OAuth token cannot purge cache (no zone scope).\n' +
      '  Create an API token at dash.cloudflare.com/profile/api-tokens with:\n' +
      '    Permissions → Zone → Cache Purge → Edit\n' +
      '    Zone Resources → Include → sounddip.com\n' +
      '  Then put it in .env or your shell profile:\n' +
      '    CLOUDFLARE_API_TOKEN=<token>\n'
  );
}

const authHeaders = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, { ...options, headers: authHeaders });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const detail = (body.errors || []).map((e) => e.message).join('; ') || res.statusText;
    throw new Error(`${path} → ${res.status}: ${detail}`);
  }
  return body;
}

async function resolveZoneId() {
  if (process.env.CLOUDFLARE_ZONE_ID) return process.env.CLOUDFLARE_ZONE_ID;
  const body = await api('/zones?name=sounddip.com');
  const zone = body.result?.[0];
  if (!zone) {
    throw new Error(
      'could not resolve zone id for sounddip.com — set CLOUDFLARE_ZONE_ID, ' +
        'or give the token Zone:Read permission'
    );
  }
  return zone.id;
}

const zoneId = await resolveZoneId();

try {
  await api(`/zones/${zoneId}/purge_cache`, {
    method: 'POST',
    body: JSON.stringify({ prefixes: PREFIXES }),
  });
  console.log(`✓ purged ${PREFIXES.length} cache prefixes on sounddip.com`);
  for (const p of PREFIXES) console.log(`   ${p}`);
} catch (err) {
  fail(err.message);
}
