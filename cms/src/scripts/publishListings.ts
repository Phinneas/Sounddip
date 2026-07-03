// Run with: cd cms && REMOTE=true payload run src/scripts/publishListings.ts
// Dry run:  cd cms && REMOTE=true payload run src/scripts/publishListings.ts -- --dry-run
//
// Batch-publishes all draft listings that have complete data:
//   - listingStatus is "active" or "active-secondary"
//   - practitionerBio is not null
//   - sessionDescription is not null
//
// Use --dry-run to preview what would be published without making changes.
// Idempotent: skips listings that are already published.
//
// Dynamic imports deliberately — see importListings.ts for why.

const { default: config } = await import('../payload.config.js')
const { getPayload } = await import('payload')

const payload = await getPayload({ config })

const isDryRun = process.argv.includes('--dry-run')

// ── Main ──

console.log(`Fetching all draft listings...${isDryRun ? ' (DRY RUN)' : ''}`)

const allListings: any[] = []
let page = 1
let hasMore = true
while (hasMore) {
  const result = await payload.find({
    collection: 'listings',
    limit: 100,
    page,
    depth: 1,
    draft: true,
  })
  allListings.push(...result.docs)
  hasMore = result.hasNextPage
  page++
}

console.log(`Total listings found: ${allListings.length}`)

// Build city ID → name map for logging
const cityMap = new Map<number, string>()
const cities = await payload.find({ collection: 'cities', limit: 100, depth: 0 })
for (const city of cities.docs) {
  cityMap.set(city.id, city.name)
}

// Filter to publishable listings
const publishable = allListings.filter(
  (l) =>
    ['active', 'active-secondary'].includes(l.listingStatus) &&
    l.practitionerBio &&
    l.sessionDescription &&
    l._status !== 'published'
)

// Group by city for summary
const byCity = new Map<string, number>()
for (const l of publishable) {
  const cityName = cityMap.get(typeof l.city === 'object' ? l.city?.id : l.city) || 'Unknown'
  byCity.set(cityName, (byCity.get(cityName) || 0) + 1)
}

console.log(`\nPublishable listings: ${publishable.length}`)
console.log(`Already published: ${allListings.filter((l) => l._status === 'published').length}`)
console.log(`Not ready (missing bio/desc or inactive): ${allListings.length - publishable.length - allListings.filter((l) => l._status === 'published').length}`)
console.log(`\nBy city:`)
for (const [city, count] of [...byCity.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${city}: ${count}`)
}

if (publishable.length === 0) {
  console.log('\nNothing to publish. Run generateDescriptions.ts first.')
  process.exit(0)
}

if (isDryRun) {
  console.log(`\n[DRY RUN] Would publish ${publishable.length} listings. Run without --dry-run to publish.`)
  console.log('\nSample listings that would be published:')
  for (const l of publishable.slice(0, 5)) {
    const cityName = cityMap.get(typeof l.city === 'object' ? l.city?.id : l.city) || 'Unknown'
    console.log(`  • ${l.name} — ${cityName} — ${l.listingStatus}`)
  }
  process.exit(0)
}

console.log(`\nPublishing ${publishable.length} listings...`)

let published = 0
let failed = 0

for (let i = 0; i < publishable.length; i++) {
  const listing = publishable[i]
  try {
    await payload.update({
      collection: 'listings',
      id: listing.id,
      data: { _status: 'published' },
      draft: false,
    })
    published++
    if (published % 10 === 0 || i === publishable.length - 1) {
      console.log(`  Progress: ${published}/${publishable.length}`)
    }
  } catch (err) {
    failed++
    console.error(`  Failed to publish ${listing.name}:`, err instanceof Error ? err.message : err)
  }
}

console.log(`\nPublish complete:`)
console.log(`  Published: ${published}`)
console.log(`  Failed: ${failed}`)

// Verify
const verifyResult = await payload.find({
  collection: 'listings',
  where: { _status: { equals: 'published' } },
  limit: 1,
})
console.log(`\nVerification: ${verifyResult.totalDocs} published listings in CMS.`)

process.exit(0)
