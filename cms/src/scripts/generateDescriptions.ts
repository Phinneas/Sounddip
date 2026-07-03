// Run with: cd cms && REMOTE=true DEEPSEEK_API_KEY=sk-... payload run src/scripts/generateDescriptions.ts
//
// Generates practitionerBio + sessionDescription for listings missing them,
// using Claude API (Sonnet). Calibrated to the site's editorial voice.
// Idempotent: skips listings that already have both fields.
//
// Dynamic imports deliberately — see importListings.ts for why.

const { default: config } = await import('../payload.config.js')
const { getPayload } = await import('payload')

const payload = await getPayload({ config })

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
if (!DEEPSEEK_API_KEY) {
  console.error('DEEPSEEK_API_KEY environment variable is required.')
  process.exit(1)
}

// ── System prompt calibrated against descriptions-la-pilot.md + FirstDip.astro ──

const SYSTEM_PROMPT = `You are the editorial voice of Sound Dip, a sound bath directory.
Your style: short declarative sentences, concrete and sensory, not generic
wellness marketing. Match this tone:
"A sound bath isn't a workout, a class, or a performance. You lie down.
You close your eyes. Vibrations from bowls, gongs, and voice wash over you
for an hour. Most people fall asleep at least a little — that's the point."

Generate two fields for this listing:

1. practitionerBio (100-150 words): About the practitioner — their background,
   training, style, what makes them distinctive. Original prose, NOT copied
   from their website. Third person, no marketing claims, no "experience the
   healing power of" language. State facts. Use specifics when available.

2. sessionDescription (60-100 words): The session format.
   Pattern: [Modality] · [Duration] · [Venue], [City]. [What makes it
   distinctive.] [Price if known.]
   Keep it factual and concrete. One sentence per idea.

Return JSON: { "practitionerBio": "...", "sessionDescription": "..." }
No markdown. No headers. Just the JSON object.`

// ── DeepSeek API call (OpenAI-compatible) ──

async function generateDescription(listing: any, cityName: string): Promise<{ practitionerBio: string; sessionDescription: string } | null> {
  const userPrompt = `Listing: ${listing.name}
City: ${cityName}
Neighborhood: ${listing.neighborhood || 'Not specified'}
Modality: ${listing.modalityDescription || 'Not specified'}
Tags: ${(listing.modalityTags || []).join(', ') || 'None'}
Duration: ${listing.duration || 'Not published'}
Price: ${listing.price || 'Not published'}
Booking URL: ${listing.bookingUrl || 'None'}
Research notes: ${listing.sourcingNotes || 'None'}
Source: ${listing.source || 'Unknown'}

Generate the two fields.`

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 600,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(`  API error (${res.status}): ${errText.substring(0, 200)}`)
      return null
    }

    const data = await res.json()
    const responseText = data?.choices?.[0]?.message?.content || ''

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('  No JSON in response')
      return null
    }

    const parsed = JSON.parse(jsonMatch[0])
    if (!parsed.practitionerBio || !parsed.sessionDescription) {
      console.error('  Missing fields in JSON response')
      return null
    }

    return {
      practitionerBio: parsed.practitionerBio.trim(),
      sessionDescription: parsed.sessionDescription.trim(),
    }
  } catch (err) {
    console.error('  Error:', err instanceof Error ? err.message : err)
    return null
  }
}

// ── Process with concurrency ──

async function processBatch(listings: any[], cityMap: Map<number, string>, concurrency: number) {
  const results: { id: any; bio: string; desc: string; name: string }[] = []
  const errors: string[] = []

  for (let i = 0; i < listings.length; i += concurrency) {
    const batch = listings.slice(i, i + concurrency)
    const batchNum = Math.floor(i / concurrency) + 1
    const totalBatches = Math.ceil(listings.length / concurrency)
    console.log(`\nBatch ${batchNum}/${totalBatches} (${batch.length} listings)...`)

    const batchResults = await Promise.all(
      batch.map(async (listing) => {
        const cityName = cityMap.get(typeof listing.city === 'object' ? listing.city?.id : listing.city) || 'Unknown'
        const result = await generateDescription(listing, cityName)
        if (result) {
          console.log(`  ✓ ${listing.name}`)
          return { id: listing.id, bio: result.practitionerBio, desc: result.sessionDescription, name: listing.name }
        }
        console.error(`  ✗ ${listing.name}`)
        return null
      })
    )

    for (const r of batchResults) {
      if (r) results.push(r)
      else errors.push('')
    }

    // Small delay between batches for rate limiting
    if (i + concurrency < listings.length) {
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  return { results, errors }
}

// ── Main ──

console.log('Fetching all listings...')

const allListings: any[] = []
let page = 1
let hasMore = true
while (hasMore) {
  const result = await payload.find({
    collection: 'listings',
    limit: 100,
    page,
    depth: 1,
  })
  allListings.push(...result.docs)
  hasMore = result.hasNextPage
  page++
}

console.log(`Total listings: ${allListings.length}`)

// Build city ID → name map
const cityMap = new Map<number, string>()
const cities = await payload.find({ collection: 'cities', limit: 100, depth: 0 })
for (const city of cities.docs) {
  cityMap.set(city.id, city.name)
}

// Filter to listings missing descriptions
const needingDescriptions = allListings.filter(
  (l) => !l.practitionerBio || !l.sessionDescription
)

console.log(`Listings needing descriptions: ${needingDescriptions.length}`)
console.log(`Already have descriptions: ${allListings.length - needingDescriptions.length}`)

if (needingDescriptions.length === 0) {
  console.log('Nothing to do — all listings have descriptions.')
  process.exit(0)
}

// Process in batches of 3 (concurrency)
const CONCURRENCY = 3
const { results, errors } = await processBatch(needingDescriptions, cityMap, CONCURRENCY)

console.log(`\nGenerated ${results.length} descriptions, ${errors.length} failures.`)
console.log('Writing to Payload...')

let updated = 0
let failed = 0

for (const r of results) {
  try {
    await payload.update({
      collection: 'listings',
      id: r.id,
      data: {
        practitionerBio: r.bio,
        sessionDescription: r.desc,
      },
    })
    updated++
  } catch (err) {
    failed++
    console.error(`  Failed to update ${r.name}:`, err instanceof Error ? err.message : err)
  }
}

console.log(`\nDescription generation done:`)
console.log(`  Generated: ${results.length}`)
console.log(`  Updated in DB: ${updated}`)
console.log(`  Failed to update: ${failed}`)
console.log(`  Skipped (API failures): ${errors.length}`)

process.exit(0)
