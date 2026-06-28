// seed-remote.ts — Seeds cities and listings to the REMOTE D1 database
// using direct SQL inserts via wrangler d1 execute, bypassing the
// Payload SDK's pushDevSchema which conflicts with existing indexes.
//
// Run with: npx tsx src/scripts/seed-remote.ts
//
// This generates SQL INSERT statements and pipes them through wrangler.

import { execSync } from 'child_process'
import { cityData } from './cityData.js'
import { parseCsv } from './parseCsv.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const seedDir = path.resolve(dirname, '../../../')

// ── Step 1: Seed Cities ──
console.log('Seeding cities to remote D1...\n')

for (const city of cityData) {
  const id = city.slug // Use slug as a stable pseudo-ID
  const sql = `INSERT OR IGNORE INTO cities (id, slug, name, region, tier, _status, updated_at, created_at) VALUES ('${id}', '${city.slug}', '${city.name.replace(/'/g, "''")}', '${city.region.replace(/'/g, "''")}', '${city.tier}', 'draft', datetime('now'), datetime('now'));`
  
  try {
    execSync(`npx wrangler d1 execute sounddip --command "${sql.replace(/"/g, '\\"')}" --remote`, {
      cwd: path.resolve(dirname, '..'),
      stdio: 'pipe',
    })
    console.log(`  Created: ${city.name}`)
  } catch (err) {
    console.error(`  Failed: ${city.name}: ${err instanceof Error ? err.message : err}`)
  }
}

// ── Step 2: Seed Listings ──
console.log('\nSeeding listings to remote D1...\n')

const MODALITY_KEYWORDS: { tag: string; patterns: RegExp[] }[] = [
  { tag: 'gong', patterns: [/gong/i] },
  { tag: 'crystal', patterns: [/crystal/i, /singing bowl/i] },
  { tag: 'tibetan-bowls', patterns: [/tibetan/i, /himalayan/i] },
  { tag: 'voice', patterns: [/voice/i, /vocal/i, /chant/i, /overtone/i] },
  { tag: 'brass', patterns: [/brass/i, /bell/i] },
  { tag: 'reiki', patterns: [/reiki/i] },
  { tag: 'breathwork', patterns: [/breathwork/i, /breath work/i] },
]

function guessModalityTags(description: string): string {
  const tags = new Set<string>()
  for (const { tag, patterns } of MODALITY_KEYWORDS) {
    if (patterns.some((p) => p.test(description))) tags.add(tag)
  }
  if (tags.size === 0) return 'other'
  if (tags.size > 1) tags.add('mixed')
  return Array.from(tags).join(',')
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

function esc(val: string | undefined): string {
  if (!val) return ''
  return val.replace(/'/g, "''").replace(/"/g, '""')
}

let totalCreated = 0
let totalFailed = 0

for (const city of cityData) {
  const csvPath = path.join(seedDir, city.csvFile)
  if (!fs.existsSync(csvPath)) {
    console.error(`  CSV not found for ${city.slug}: ${csvPath}`)
    continue
  }

  const rows = parseCsv(fs.readFileSync(csvPath, 'utf-8'))
  const cityId = city.slug

  for (const row of rows) {
    const name = row['Name']?.trim()
    if (!name) continue

    const slug = `${slugify(name)}-${city.slug}`
    const modalityDescription = row['Modality']?.trim() ?? ''
    const modalityTags = guessModalityTags(modalityDescription)
    const subCity = row['City']?.trim()
    const neighborhood = [row['Neighborhood']?.trim(), subCity && subCity !== city.name ? subCity : null]
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .join(', ')

    const listingStatus = mapStatus(row['Status']?.trim() ?? '')
    const listingId = slug

    const sql = `INSERT OR IGNORE INTO listings (id, name, slug, city, neighborhood, modalityTags, modalityDescription, duration, price, bookingUrl, sourcingNotes, source, listingStatus, _status, updated_at, created_at) VALUES ('${esc(listingId)}', '${esc(name)}', '${esc(slug)}', '${esc(cityId)}', '${esc(neighborhood)}', '${esc(modalityTags)}', '${esc(modalityDescription)}', '${esc(row['Duration']?.trim())}', '${esc(row['Price']?.trim())}', '${esc(row['Booking URL']?.trim())}', '${esc(row['Notes']?.trim())}', '${esc(row['Source']?.trim())}', '${esc(listingStatus)}', 'draft', datetime('now'), datetime('now'));`

    try {
      execSync(`npx wrangler d1 execute sounddip --command "${sql.replace(/"/g, '\\"')}" --remote`, {
        cwd: path.resolve(dirname, '..'),
        stdio: 'pipe',
      })
      totalCreated++
    } catch (err) {
      totalFailed++
      console.error(`  Failed: "${name}": ${err instanceof Error ? err.message : String(err).substring(0, 100)}`)
    }
  }
  console.log(`  ${city.slug}: ${rows.length} processed`)
}

console.log(`\nDone: ${totalCreated} listings created, ${totalFailed} failed.`)
