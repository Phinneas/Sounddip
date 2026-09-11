// Run with: REMOTE=true pnpm payload run src/scripts/createMissingCities.ts
//
// Creates city documents for any metro in metroTargets.json that doesn't
// already exist in the CMS. Uses the local Payload API (not REST) so it
// bypasses collection access control. Idempotent: skips existing slugs.
//
// Must run with REMOTE=true to target the production D1 database.
const { default: config } = await import('../payload.config.js')
const { getPayload } = await import('payload')
const metroTargets = await import('./metroTargets.js')

const payload = await getPayload({ config })

const existing = await payload.find({ collection: 'cities', limit: 100 })
const existingSlugs = new Set(existing.docs.map((c) => c.slug))

const targets = metroTargets.metroTargets
let created = 0
let skipped = 0

for (const metro of targets) {
  if (existingSlugs.has(metro.slug)) {
    skipped++
    continue
  }
  await payload.create({
    collection: 'cities',
    data: {
      slug: metro.slug,
      name: metro.name,
      region: metro.region,
      tier: '3',
    },
    draft: true,
  })
  console.log(`  created: ${metro.slug} (${metro.name}, ${metro.region})`)
  created++
}

console.log(`Cities: ${created} created, ${skipped} already existed.`)
process.exit(0)
