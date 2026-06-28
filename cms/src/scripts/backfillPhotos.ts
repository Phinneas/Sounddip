// Run with: payload run src/scripts/backfillPhotos.ts
//
// Given a JSON mapping file of { listingSlug: imageUrl }, downloads each
// image, uploads it to Payload's Media collection, and links it to the
// Listing's `photo` field. Idempotent: skips listings that already have a
// photo.
//
// The mapping file should be placed at cms/src/scripts/photo-map.json
// and should look like:
// {
//   "sound-bath-los-angeles-los-angeles": "https://lh3.googleusercontent.com/...",
//   "wakeupdreamer-los-angeles": "https://example.com/photo.jpg",
//   ...
// }
//
// Uses dynamic imports — see seedCities.ts for why.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { default: config } = await import('../payload.config.js')
const { getPayload } = await import('payload')

const dirname = path.dirname(fileURLToPath(import.meta.url))
const mapPath = path.resolve(dirname, 'photo-map.json')

if (!fs.existsSync(mapPath)) {
  console.error(`Photo map not found: ${mapPath}`)
  console.error('Create a photo-map.json file with { listingSlug: imageUrl } entries and re-run.')
  process.exit(1)
}

const photoMap: Record<string, string> = JSON.parse(fs.readFileSync(mapPath, 'utf-8'))
console.log(`Loaded ${Object.keys(photoMap).length} entries from photo map.\n`)

const payload = await getPayload({ config })

let linked = 0
let downloaded = 0
let skipped = 0
let failed = 0

for (const [slug, imageUrl] of Object.entries(photoMap)) {
  // Find the listing by slug
  const found = await payload.find({
    collection: 'listings',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  if (found.totalDocs === 0) {
    console.warn(`NOT FOUND: "${slug}"`)
    failed++
    continue
  }

  const doc = found.docs[0]

  // Skip if already has a photo
  if (doc.photo) {
    console.log(`SKIP (has photo): "${doc.name}"`)
    skipped++
    continue
  }

  try {
    // Download the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error(`FETCH FAILED (${response.status}): "${slug}" from ${imageUrl}`)
      failed++
      continue
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = Buffer.from(await response.arrayBuffer())

    // Determine file extension from content type
    const ext = contentType.includes('png') ? '.png'
      : contentType.includes('webp') ? '.webp'
      : '.jpg'

    const filename = `${slug}${ext}`

    // Upload to Payload's Media collection
    const mediaDoc = await payload.create({
      collection: 'media',
      data: {},
      draft: true,
      file: {
        data: buffer,
        mimetype: contentType,
        name: filename,
        size: buffer.length,
      },
    })

    // Link the media to the listing's photo field
    await payload.update({
      collection: 'listings',
      id: doc.id,
      data: {
        photo: mediaDoc.id,
      },
    })

    downloaded++
    linked++
    console.log(`LINKED: "${doc.name}" → ${filename}`)
  } catch (err) {
    failed++
    console.error(`FAILED: "${slug}":`, err instanceof Error ? err.message : err)
  }
}

console.log(`\nDone: ${linked} photos linked, ${downloaded} downloaded, ${skipped} already had photos, ${failed} failed.`)
process.exit(0)
