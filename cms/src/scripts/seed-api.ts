// seed-api.ts — Seeds cities and listings to the remote Payload CMS
// via the REST API, bypassing pushDevSchema conflicts.
//
// Run with: npx tsx src/scripts/seed-api.ts
//
// Requires: PAYLOAD_SECRET env var set (used to generate a local API key)

import { cityData } from './cityData.js'
import { parseCsv } from './parseCsv.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const API_BASE = process.env.PAYLOAD_API_URL || 'https://sounddip-cms.buzzuw2.workers.dev'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const seedDir = path.resolve(dirname, '../../../')

async function api(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, options)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text.substring(0, 200)}`)
  }
  return res.json()
}

// First, create a user so we can get an API token
// Payload allows first-user creation via the API on a fresh instance
let token: string | null = null

try {
  const userRes = await api('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@sounddip.com',
      password: 'sounddip2026admin!',
    }),
  })
  console.log('Created admin user:', userRes.user?.email || userRes.email || 'success')
  token = userRes.token
} catch (err) {
  // User might already exist — try logging in instead
  console.log('User creation failed (likely exists), trying login...')
  try {
    const loginRes = await api('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sounddip.com',
        password: 'sounddip2026admin!',
      }),
    })
    token = loginRes.token
    console.log('Logged in as admin')
  } catch (loginErr) {
    console.error('Login also failed:', loginErr instanceof Error ? loginErr.message : loginErr)
    console.error('Cannot proceed without API authentication.')
    process.exit(1)
  }
}

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `JWT ${token}` } : {}),
}

// ── Seed Cities ──
console.log('\nSeeding cities...')
let citiesCreated = 0
let citiesSkipped = 0

for (const city of cityData) {
  // Check if already exists
  const existing = await api(`/api/cities?where[slug][equals]=${city.slug}&limit=1`)
  if (existing.totalDocs > 0) {
    citiesSkipped++
    continue
  }

  await api('/api/cities', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      slug: city.slug,
      name: city.name,
      region: city.region,
      tier: city.tier,
      _status: 'draft',
    }),
  })
  citiesCreated++
  console.log(`  Created: ${city.name}`)
}
console.log(`Cities: ${citiesCreated} created, ${citiesSkipped} skipped.`)

// ── Seed Listings ──
console.log('\nSeeding listings...')

const MODALITY_KEYWORDS: { tag: string; patterns: RegExp[] }[] = [
  { tag: 'gong', patterns: [/gong/i] },
  { tag: 'crystal', patterns: [/crystal/i, /singing bowl/i] },
  { tag: 'tibetan-bowls', patterns: [/tibetan/i, /himalayan/i] },
  { tag: 'voice', patterns: [/voice/i, /vocal/i, /chant/i, /overtone/i] },
  { tag: 'brass', patterns: [/brass/i, /bell/i] },
  { tag: 'reiki', patterns: [/reiki/i] },
  { tag: 'breathwork', patterns: [/breathwork/i, /breath work/i] },
]

function guessModalityTags(description: string): string[] {
  const tags = new Set<string>()
  for (const { tag, patterns } of MODALITY_KEYWORDS) {
    if (patterns.some((p) => p.test(description))) tags.add(tag)
  }
  if (tags.size === 0) return ['other']
  if (tags.size > 1) tags.add('mixed')
  return Array.from(tags)
}

function mapStatus(raw: string): string {
  const s = raw.toLowerCase()
  if (s.includes('flagged') || s.includes('inactive')) return 'flagged-inactive'
  if (s.includes('organizer name')) return 'needs-organizer-name'
  if (s.includes('verif') || s.includes('thin data') || s.includes('stale')) return 'needs-verification'
  if (s.includes('secondary')) return 'active-secondary'
  return 'active'
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

let listingsCreated = 0
let listingsSkipped = 0
let listingsFailed = 0

// Build a city ID lookup
const cityLookup = new Map<string, string>()
const allCities = await api('/api/cities?limit=100')
for (const doc of allCities.docs) {
  cityLookup.set(doc.slug, doc.id)
}

for (const city of cityData) {
  const cityId = cityLookup.get(city.slug)
  if (!cityId) {
    console.error(`  City not found: ${city.slug}`)
    continue
  }

  const csvPath = path.join(seedDir, city.csvFile)
  if (!fs.existsSync(csvPath)) {
    console.error(`  CSV not found: ${csvPath}`)
    continue
  }

  const rows = parseCsv(fs.readFileSync(csvPath, 'utf-8'))

  for (const row of rows) {
    const name = row['Name']?.trim()
    if (!name) continue

    const slug = `${slugify(name)}-${city.slug}`

    // Check if already exists
    const existing = await api(`/api/listings?where[slug][equals]=${slug}&limit=1`)
    if (existing.totalDocs > 0) {
      listingsSkipped++
      continue
    }

    const subCity = row['City']?.trim()
    const neighborhoodParts = [row['Neighborhood']?.trim(), subCity && subCity !== city.name ? subCity : null]
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i)
    const neighborhood = neighborhoodParts.join(', ')

    const modalityDescription = row['Modality']?.trim() ?? ''

    try {
      await api('/api/listings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          slug,
          city: cityId,
          neighborhood: neighborhood || undefined,
          modalityTags: guessModalityTags(modalityDescription),
          modalityDescription: modalityDescription || undefined,
          duration: row['Duration']?.trim() || undefined,
          price: row['Price']?.trim() || undefined,
          bookingUrl: row['Booking URL']?.trim() || undefined,
          sourcingNotes: row['Notes']?.trim() || undefined,
          source: row['Source']?.trim() || undefined,
          listingStatus: mapStatus(row['Status']?.trim() ?? ''),
          _status: 'draft',
        }),
      })
      listingsCreated++
    } catch (err) {
      listingsFailed++
      console.error(`  Failed: "${name}": ${err instanceof Error ? err.message : String(err).substring(0, 100)}`)
    }
  }
  console.log(`  ${city.slug}: processed`)
}

console.log(`\nListings: ${listingsCreated} created, ${listingsSkipped} skipped, ${listingsFailed} failed.`)
