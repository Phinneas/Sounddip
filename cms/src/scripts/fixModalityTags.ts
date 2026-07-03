// Run with: cd cms && REMOTE=true DEEPSEEK_API_KEY=sk-... payload run src/scripts/fixModalityTags.ts
//
// Reclassifies listings tagged "other" in modalityTags using enhanced keyword
// matching against modalityDescription + name + sourcingNotes + sessionDescription.
// Falls back to Claude API for ambiguous cases where no keywords match.
// Idempotent: skips listings that already have proper tags (no "other").
//
// Dynamic imports deliberately — see importListings.ts for why.

const { default: config } = await import('../payload.config.js')
const { getPayload } = await import('payload')

const payload = await getPayload({ config })

// ── Enhanced keyword matching (expanded from importListings.ts) ──

const MODALITY_KEYWORDS: { tag: string; patterns: RegExp[] }[] = [
  { tag: 'gong', patterns: [/gong/i, /gong bath/i, /gong room/i] },
  { tag: 'crystal', patterns: [/crystal/i, /alchemy/i, /crystal bowl/i, /crystal singing/i] },
  { tag: 'tibetan-bowls', patterns: [/tibetan/i, /himalayan/i, /singing bowl/i, /singing bowls/i, /himalayan bowl/i] },
  { tag: 'voice', patterns: [/voice/i, /vocal/i, /chant/i, /chanting/i, /toning/i, /overtone/i, /kirtan/i] },
  { tag: 'brass', patterns: [/brass/i, /bell/i, /bells/i, /chime/i, /chimes/i, /wind chime/i] },
  { tag: 'reiki', patterns: [/reiki/i] },
  { tag: 'breathwork', patterns: [/breath/i, /breathwork/i, /breath work/i, /pranayama/i, /breathing/i] },
]

function guessModalityTags(text: string): string[] {
  const tags = new Set<string>()
  for (const { tag, patterns } of MODALITY_KEYWORDS) {
    if (patterns.some((p) => p.test(text))) tags.add(tag)
  }
  if (tags.size === 0) return ['other']
  if (tags.size > 1) tags.add('mixed')
  return Array.from(tags)
}

// ── DeepSeek API fallback for ambiguous cases ──

async function classifyWithLLM(name: string, text: string): Promise<string[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    console.warn('  No DEEPSEEK_API_KEY — leaving as "other"')
    return ['other']
  }

  const prompt = `Given this sound bath listing, classify the modality tags.
Available tags: gong, crystal, voice, brass, tibetan-bowls, reiki, breathwork, mixed
Pick 1-3 tags. Use "mixed" only if multiple distinct modalities are present and none dominates.
If you truly cannot determine the modality, return ["other"].

Listing name: ${name}
Description: ${text}

Return only JSON: { "modalityTags": ["tag1"] }`

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    })
    const data = await res.json()
    const responseText = data?.choices?.[0]?.message?.content || ''
    const match = responseText.match(/\{[^}]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      const tags = parsed.modalityTags
      if (Array.isArray(tags) && tags.length > 0) {
        return tags.filter((t: string) =>
          ['gong', 'crystal', 'voice', 'brass', 'tibetan-bowls', 'reiki', 'breathwork', 'mixed', 'other'].includes(t)
        )
      }
    }
  } catch (err) {
    console.error('  DeepSeek API error:', err instanceof Error ? err.message : err)
  }
  return ['other']
}

// ── Main ──

console.log('Fetching listings with "other" modality tag...')

const allListings: any[] = []
let page = 1
let hasMore = true
while (hasMore) {
  const result = await payload.find({
    collection: 'listings',
    where: { modalityTags: { contains: 'other' } },
    limit: 100,
    page,
    depth: 1,
  })
  allListings.push(...result.docs)
  hasMore = result.hasNextPage
  page++
}

console.log(`Found ${allListings.length} listings with "other" tag.`)

let fixedByKeyword = 0
let fixedByClaude = 0
let stillOther = 0
let skipped = 0

for (const listing of allListings) {
  // Build combined text from all available fields
  const combinedText = [
    listing.modalityDescription,
    listing.name,
    listing.sourcingNotes,
    listing.sessionDescription,
    listing.practitionerBio,
  ].filter(Boolean).join(' ')

  // Try enhanced keyword matching first
  let newTags = guessModalityTags(combinedText)

  if (newTags.includes('other') && !newTags.includes('mixed')) {
    // No keywords matched — try DeepSeek API
    newTags = await classifyWithLLM(listing.name, combinedText)
  }

  if (newTags.includes('other') && newTags.length === 1) {
    // Still "other" after both attempts — skip
    stillOther++
    continue
  }

  // Remove "other" if we have better tags
  const finalTags = newTags.filter((t: string) => t !== 'other')
  if (finalTags.length === 0) {
    stillOther++
    continue
  }

  try {
    await payload.update({
      collection: 'listings',
      id: listing.id,
      data: { modalityTags: finalTags },
    })

    if (guessModalityTags(combinedText).some((t) => t !== 'other')) {
      fixedByKeyword++
    } else {
      fixedByClaude++
    }

    console.log(`  ✓ ${listing.name} → ${finalTags.join(', ')}`)
  } catch (err) {
    console.error(`  ✗ Failed to update ${listing.name}:`, err instanceof Error ? err.message : err)
    skipped++
  }

  // Small delay to avoid overwhelming the API
  if (fixedByClaude > 0 && fixedByClaude % 5 === 0) {
    await new Promise((r) => setTimeout(r, 500))
  }
}

console.log(`\nModality tag cleanup done:`)
console.log(`  Fixed by keyword matching: ${fixedByKeyword}`)
console.log(`  Fixed by Claude API: ${fixedByClaude}`)
console.log(`  Still "other" (unclassifiable): ${stillOther}`)
console.log(`  Skipped (errors): ${skipped}`)

process.exit(0)
