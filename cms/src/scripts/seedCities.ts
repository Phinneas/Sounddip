// Run with: payload run src/scripts/seedCities.ts
//
// Creates one minimal City document per MVP-20 city (slug, name, region,
// tier) so the Listings import script has something to relate to. Rich
// editorial content (tagline, scene narrative, venues, beginner guide,
// image) is intentionally left blank here — that's the separate
// "Reconcile cities.ts with MVP-20 city list" content task, not a data
// migration. Idempotent: skips any city whose slug already exists.
//
// Uses dynamic imports deliberately — static top-level imports of
// payload.config.js (which itself has a top-level await) silently produced
// zero output and zero writes under `payload run`; dynamic imports here are
// the confirmed-working pattern.
const { default: config } = await import('../payload.config.js')
const { getPayload } = await import('payload')
const { cityData } = await import('./cityData.js')

const payload = await getPayload({ config })

let created = 0
let skipped = 0

for (const city of cityData) {
  const existing = await payload.find({
    collection: 'cities',
    where: { slug: { equals: city.slug } },
    limit: 1,
  })

  if (existing.totalDocs > 0) {
    skipped++
    continue
  }

  await payload.create({
    collection: 'cities',
    data: {
      slug: city.slug,
      name: city.name,
      region: city.region,
      tier: city.tier,
    },
    draft: true,
  })
  created++
}

console.log(`Cities seeded: ${created} created, ${skipped} already existed.`)
process.exit(0)
