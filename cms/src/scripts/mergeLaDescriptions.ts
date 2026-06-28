// Run with: payload run src/scripts/mergeLaDescriptions.ts
//
// Reads the 10 drafted LA descriptions from descriptions-la-pilot.md,
// matches each to an existing Listing record by name, and patches the
// practitionerBio + sessionDescription fields.
//
// Uses dynamic imports — see seedCities.ts for why.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { default: config } = await import('../payload.config.js')
const { getPayload } = await import('payload')

const dirname = path.dirname(fileURLToPath(import.meta.url))
const mdPath = path.resolve(dirname, '../../../descriptions-la-pilot.md')

if (!fs.existsSync(mdPath)) {
  console.error(`File not found: ${mdPath}`)
  process.exit(1)
}

const md = fs.readFileSync(mdPath, 'utf-8')

interface ListingDraft {
  name: string
  practitionerBio: string
  sessionDescription: string
}

// Parse the markdown file into structured entries.
// Format per entry:
//   ## N. Listing Name (maybe with parenthetical)
//   **Bio (practitioner page):**
//   <bio text>
//   **Session description:**
//   <session text>
//   ---
const entries: ListingDraft[] = []

// Split on the ## N. pattern (entry headings)
const entryBlocks = md.split(/^## \d+\.\s+/m).slice(1)

for (const block of entryBlocks) {
  // Extract the name — everything up to the first newline, strip trailing parens content
  const firstLine = block.split('\n')[0].trim()
  const name = firstLine.replace(/\s*\(.*?\)\s*$/, '').trim()

  // Extract bio — text between "**Bio (practitioner page):**" and "**Session description:**"
  const bioMatch = block.match(/\*\*Bio \(practitioner page\):\*\*\s*([\s\S]*?)\s*\*\*Session description:\*\*/)
  const bio = bioMatch ? bioMatch[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : ''

  // Extract session description — text between "**Session description:**" and the next separator
  const sessionMatch = block.match(/\*\*Session description:\*\*\s*([\s\S]*?)(?:\n---|\n## \d|$)/)
  const session = sessionMatch ? sessionMatch[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : ''

  if (name && bio && session) {
    entries.push({ name, practitionerBio: bio, sessionDescription: session })
  } else {
    console.warn(`Skipping incomplete entry for: ${name || '(unknown)'}`)
  }
}

console.log(`Parsed ${entries.length} description entries from markdown.\n`)

// Name-to-slug mapping that matches the importListings.ts slugify logic
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const payload = await getPayload({ config })

let patched = 0
let notFound = 0

for (const entry of entries) {
  // Try matching by name first (exact), then fall back to partial
  let found = await payload.find({
    collection: 'listings',
    where: {
      name: { equals: entry.name },
    },
    limit: 5,
  })

  // If exact match fails, try a contains match and pick the LA one
  if (found.totalDocs === 0) {
    // Some names in the markdown differ slightly from the CSV
    // e.g. "Sound Bath Los Angeles / One Conduit" vs just "One Conduit"
    // Try matching on the slug pattern: slugify(name)-los-angeles
    const slugGuess = `${slugify(entry.name)}-los-angeles`
    found = await payload.find({
      collection: 'listings',
      where: {
        slug: { equals: slugGuess },
      },
      limit: 1,
    })
  }

  if (found.totalDocs === 0) {
    // Broader fallback: search by name containing key words
    const nameParts = entry.name.split(/[\s\/]+/).filter(p => p.length > 3)
    for (const part of nameParts) {
      if (found.totalDocs > 0) break
      found = await payload.find({
        collection: 'listings',
        where: {
          name: { contains: part },
          'city.slug': { equals: 'los-angeles' },
        },
        limit: 5,
      })
    }
  }

  if (found.totalDocs === 0) {
    console.warn(`NOT FOUND: "${entry.name}"`)
    notFound++
    continue
  }

  if (found.totalDocs > 1) {
    // Pick the one in LA
    const laListing = found.docs.find(d => {
      const city = d.city as any
      return city?.slug === 'los-angeles' || city?.name === 'Los Angeles'
    })
    if (!laListing) {
      console.warn(`AMBIGUOUS: "${entry.name}" matched ${found.totalDocs} listings, none in LA`)
      notFound++
      continue
    }
    await payload.update({
      collection: 'listings',
      id: laListing.id,
      data: {
        practitionerBio: entry.practitionerBio,
        sessionDescription: entry.sessionDescription,
      },
    })
    patched++
    console.log(`Patched (multi-match): "${laListing.name}"`)
    continue
  }

  const doc = found.docs[0]

  // Check if already has content
  if (doc.practitionerBio || doc.sessionDescription) {
    console.log(`SKIP (already has content): "${doc.name}"`)
    continue
  }

  await payload.update({
    collection: 'listings',
    id: doc.id,
    data: {
      practitionerBio: entry.practitionerBio,
      sessionDescription: entry.sessionDescription,
    },
  })
  patched++
  console.log(`Patched: "${doc.name}"`)
}

console.log(`\nDone: ${patched} patched, ${notFound} not found.`)
process.exit(0)
