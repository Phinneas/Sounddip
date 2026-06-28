// Run with: payload run src/scripts/importListings.ts
//
// Reads every seed-listings-*.csv from ~/Desktop/sounddip/, maps each row
// onto the Listings schema, and creates it as a DRAFT document (never
// published — that's a deliberate human-review gate, not an oversight).
// Idempotent on slug: re-running skips rows that already exist, so this is
// safe to run again after fixing a mapping bug.
//
// Dynamic imports deliberately — see seedCities.ts for why.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { default: config } = await import('../payload.config.js')
const { getPayload } = await import('payload')
const { cityData } = await import('./cityData.js')
const { parseCsv } = await import('./parseCsv.js')

const dirname = path.dirname(fileURLToPath(import.meta.url))
const seedDir = path.resolve(dirname, '../../../') // cms/src/scripts -> sounddip/

const MODALITY_KEYWORDS: { tag: string; patterns: RegExp[] }[] = [
  { tag: 'gong', patterns: [/gong/i] },
  { tag: 'crystal', patterns: [/crystal/i] },
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

const payload = await getPayload({ config })

const cityDocsBySlug = new Map<string, string | number>()
for (const city of cityData) {
  const found = await payload.find({
    collection: 'cities',
    where: { slug: { equals: city.slug } },
    limit: 1,
  })
  if (found.totalDocs === 0) {
    console.error(`City "${city.slug}" not found — run seedCities.ts first. Skipping its listings.`)
    continue
  }
  cityDocsBySlug.set(city.slug, found.docs[0].id)
}

let created = 0
let skipped = 0
let failed = 0

for (const city of cityData) {
  const cityId = cityDocsBySlug.get(city.slug)
  if (!cityId) continue

  const csvPath = path.join(seedDir, city.csvFile)
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found for ${city.slug}: ${csvPath}`)
    continue
  }

  const rows = parseCsv(fs.readFileSync(csvPath, 'utf-8'))

  for (const row of rows) {
    const name = row['Name']?.trim()
    if (!name) continue

    const slug = `${slugify(name)}-${city.slug}`

    const existing = await payload.find({
      collection: 'listings',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      skipped++
      continue
    }

    const subCity = row['City']?.trim()
    const neighborhoodParts = [row['Neighborhood']?.trim(), subCity && subCity !== city.name ? subCity : null]
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i)
    const neighborhood = neighborhoodParts.join(', ')

    const modalityDescription = row['Modality']?.trim() ?? ''

    try {
      await payload.create({
        collection: 'listings',
        data: {
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
        },
        draft: true,
      })
      created++
    } catch (err) {
      failed++
      console.error(`Failed to import "${name}" (${city.slug}):`, err instanceof Error ? err.message : err)
    }
  }
}

console.log(`Listings import done: ${created} created, ${skipped} already existed, ${failed} failed.`)
process.exit(0)
