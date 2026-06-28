// Run with: payload run src/scripts/generateDescriptions.ts
//
// Generates draft practitionerBio + sessionDescription for every Listing
// that lacks them, using existing listing fields as source material.
// Also improves modalityTags where the source data makes a better tag obvious.
//
// This is a CONTENT DRAFTING tool, not a publisher. Everything it writes
// is a draft that should be reviewed before setting _status to published.
//
// Uses dynamic imports — see seedCities.ts for why.

import { fileURLToPath } from 'url'
import path from 'path' // eslint-disable-line @typescript-eslint/no-unused-vars

const { default: config } = await import('../payload.config.js')
const { getPayload } = await import('payload')

const payload = await getPayload({ config })

// Fetch all listings that lack practitionerBio
const allListings = await payload.find({
  collection: 'listings',
  limit: 300,
  // No draft filter — we want all of them
})

const needingDescriptions = allListings.docs.filter(
  (doc: any) => !doc.practitionerBio || doc.practitionerBio.trim() === ''
)

console.log(`Total listings: ${allListings.totalDocs}`)
console.log(`Listings needing descriptions: ${needingDescriptions.length}`)

// Modality tag improvement map — keywords that signal specific modalities
const MODALITY_IMPROVEMENTS: { tag: string; patterns: RegExp[] }[] = [
  { tag: 'gong', patterns: [/gong/i] },
  { tag: 'crystal', patterns: [/crystal/i, /singing bowl/i] },
  { tag: 'tibetan-bowls', patterns: [/tibetan/i, /himalayan/i] },
  { tag: 'voice', patterns: [/voice/i, /vocal/i, /chant/i, /overtone/i, /singing/i] },
  { tag: 'brass', patterns: [/brass/i, /bell/i] },
  { tag: 'reiki', patterns: [/reiki/i] },
  { tag: 'breathwork', patterns: [/breathwork/i, /breath work/i] },
]

function improveModalityTags(
  currentTags: string[],
  modalityDesc: string,
  sourcingNotes: string,
  name: string
): string[] | null {
  const combined = `${modalityDesc} ${sourcingNotes} ${name}`
  const improved = new Set<string>()

  for (const { tag, patterns } of MODALITY_IMPROVEMENTS) {
    if (patterns.some((p) => p.test(combined))) {
      improved.add(tag)
    }
  }

  if (improved.size === 0) return null // Can't improve

  // Check if current tags are just ['other'] or ['mixed']
  const currentSet = new Set(currentTags)
  const isGeneric = currentTags.length === 1 && (currentTags[0] === 'other' || currentTags[0] === 'mixed')

  if (!isGeneric) {
    // Already has specific tags — only improve if we'd add new ones
    let added = false
    for (const tag of improved) {
      if (!currentSet.has(tag)) added = true
    }
    if (!added) return null
  }

  // Merge existing specific tags with improved ones
  for (const tag of currentTags) {
    if (tag !== 'other') improved.add(tag)
  }

  if (improved.size > 1) improved.add('mixed')
  if (improved.size === 0) return null

  const result = Array.from(improved)
  // Sort for consistency
  return result.sort()
}

// Generate a practitioner bio from listing data
function generateBio(doc: any): string {
  const name = doc.name || 'This practitioner'
  const modality = doc.modalityDescription || ''
  const neighborhood = doc.neighborhood || ''
  const notes = doc.sourcingNotes || ''
  const price = doc.price || ''
  const duration = doc.duration || ''
  const source = doc.source || ''

  // Build bio from available data
  const parts: string[] = []

  // Opening — who and where
  if (neighborhood) {
    parts.push(`${cleanName(name)} operates out of ${neighborhood}`)
  } else {
    parts.push(`${cleanName(name)} offers sound healing sessions`)
  }

  // Modality detail
  if (modality) {
    parts.push(`with a focus on ${modality.toLowerCase()}`)
  }

  // Sourcing notes often contain rich context
  if (notes) {
    const noteInsights = extractInsights(notes)
    if (noteInsights) parts.push(noteInsights)
  }

  // Price transparency callout
  if (price && price !== 'Not published') {
    parts.push(`Sessions are priced at ${price}`)
  }

  // Duration if available
  if (duration && duration !== 'Not published') {
    parts.push(`running ${duration}`)
  }

  // Source-based credibility
  if (source && source.includes('website')) {
    parts.push('with an active web presence')
  }

  // Closing
  parts.push('-- a listing worth verifying for current availability before booking.')

  return joinBio(parts)
}

function cleanName(name: string): string {
  // Remove parenthetical content for cleaner prose
  return name.replace(/\s*\(.*?\)\s*$/, '').trim()
}

function extractInsights(notes: string): string {
  // Pull out useful factual content from sourcing notes
  const insights: string[] = []

  // Rating/review mentions
  const ratingMatch = notes.match(/(\d+\.?\d*)\s*(?:rating|stars?)\s*\((\d+)\s*reviews?\)/i)
  if (ratingMatch) {
    insights.push(`rated ${ratingMatch[1]} across ${ratingMatch[2]} reviews`)
  }

  // Longevity mentions
  const yearsMatch = notes.match(/(\d+)\+?\s*years?/i)
  if (yearsMatch) {
    insights.push(`with over ${yearsMatch[1]} years of practice`)
  }

  // Corporate clients
  if (notes.match(/corporate/i)) {
    insights.push('serving both individual and corporate clients')
  }

  // Training/certification
  if (notes.match(/certif|trained|E-RYT|YTT/i)) {
    insights.push('with formal training credentials')
  }

  // Recurring schedule
  if (notes.match(/recurring|weekly|monthly|every/i)) {
    insights.push('running on a recurring schedule')
  }

  if (insights.length === 0) return ''
  return insights.slice(0, 2).join(', ')
}

function joinBio(parts: string[]): string {
  // Join into coherent prose — this is a draft, not final copy
  let bio = parts[0]
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i]
    if (part.startsWith('--') || part.startsWith(',') || part.startsWith('with')) {
      bio += ' ' + part
    } else if (part.startsWith('running') || part.startsWith('rated') || part.startsWith('serving')) {
      bio += ', ' + part
    } else {
      bio += '. ' + part.charAt(0).toUpperCase() + part.slice(1)
    }
  }
  if (!bio.endsWith('.')) bio += '.'
  return bio
}

// Generate a session description from listing data
function generateSessionDescription(doc: any): string {
  const modality = doc.modalityDescription || 'Sound bath'
  const duration = doc.duration && doc.duration !== 'Not published' ? doc.duration : 'Duration varies'
  const neighborhood = doc.neighborhood || 'Location confirmed at booking'
  const price = doc.price && doc.price !== 'Not published' ? doc.price : 'Contact for pricing'
  const bookingUrl = doc.bookingUrl

  const parts: string[] = []

  // Format line
  parts.push(`${modality} · ${duration} · ${neighborhood}.`)

  // What makes it distinctive — from notes
  const notes = doc.sourcingNotes || ''
  if (notes.includes('recurring') || notes.includes('weekly') || notes.includes('monthly')) {
    parts.push('Recurring series.')
  } else if (notes.includes('private')) {
    parts.push('Private sessions by appointment.')
  }

  // Price
  if (price !== 'Contact for pricing') {
    parts.push(price + '.')
  } else {
    parts.push('Contact for pricing.')
  }

  // Booking
  if (bookingUrl) {
    parts.push('Book online.')
  }

  return parts.join(' ')
}

let patched = 0
let tagsImproved = 0
const skipped = 0

for (const doc of needingDescriptions) {
  const bio = generateBio(doc)
  const sessionDesc = generateSessionDescription(doc)

  const updateData: any = {
    practitionerBio: bio,
    sessionDescription: sessionDesc,
  }

  // Also improve modality tags if possible
  const improvedTags = improveModalityTags(
    doc.modalityTags || [],
    doc.modalityDescription || '',
    doc.sourcingNotes || '',
    doc.name || ''
  )
  if (improvedTags) {
    updateData.modalityTags = improvedTags
    tagsImproved++
  }

  try {
    await payload.update({
      collection: 'listings',
      id: doc.id,
      data: updateData,
    })
    patched++
    if (patched % 20 === 0) {
      console.log(`Progress: ${patched}/${needingDescriptions.length}`)
    }
  } catch (err) {
    console.error(`Failed to patch "${doc.name}":`, err instanceof Error ? err.message : err)
  }
}

console.log(`\nDone: ${patched} listings patched with draft descriptions.`)
console.log(`Tags improved on ${tagsImproved} listings.`)
console.log(`Skipped: ${skipped}.`)
console.log(`\nNOTE: These are draft descriptions. Review before publishing.`)
process.exit(0)
