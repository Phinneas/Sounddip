import type { CollectionConfig } from 'payload'

export const Listings: CollectionConfig = {
  slug: 'listings',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'modality', 'listingStatus', '_status'],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
    create: () => true, // Allow self-submission from /submit form (creates as draft + needs-verification)
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Practitioner name and/or studio/venue name',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'city',
      type: 'relationship',
      relationTo: 'cities',
      required: true,
    },
    {
      name: 'neighborhood',
      type: 'text',
    },
    {
      name: 'address',
      type: 'text',
      admin: {
        description: 'Street address (machine-sourced from scraping). Optional — many listings only have a neighborhood.',
      },
    },
    {
      name: 'state',
      type: 'text',
      admin: {
        description: 'US state abbreviation or full name, e.g. "NY" or "New York".',
      },
    },
    {
      name: 'zip',
      type: 'text',
      admin: {
        description: 'US ZIP code (machine-sourced). Enables future proximity/zip search.',
      },
    },
    {
      name: 'lat',
      type: 'number',
      admin: {
        description: 'Latitude (decimal degrees). Machine-sourced; used for future proximity features.',
      },
    },
    {
      name: 'lng',
      type: 'number',
      admin: {
        description: 'Longitude (decimal degrees). Machine-sourced; used for future proximity features.',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Public contact phone number, if available.',
      },
    },
    {
      name: 'modalityTags',
      type: 'select',
      hasMany: true,
      admin: {
        description: 'Structured tags used for the site\'s modality filter',
      },
      options: [
        { label: 'Gong', value: 'gong' },
        { label: 'Crystal', value: 'crystal' },
        { label: 'Voice', value: 'voice' },
        { label: 'Brass', value: 'brass' },
        { label: 'Tibetan/Himalayan bowls', value: 'tibetan-bowls' },
        { label: 'Reiki', value: 'reiki' },
        { label: 'Breathwork', value: 'breathwork' },
        { label: 'Mixed', value: 'mixed' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'modalityDescription',
      type: 'text',
      admin: {
        description: 'Free-text modality detail as originally sourced, e.g. "Crystal bowls, gong, group/private/corporate sound bath"',
      },
    },
    {
      name: 'duration',
      type: 'text',
      admin: {
        description: 'e.g. "60 min", "60-90 min", or "Not published"',
      },
    },
    {
      name: 'price',
      type: 'text',
      admin: {
        description: 'e.g. "$35-75", "Starting at $300", or "Not published"',
      },
    },
    {
      name: 'bookingUrl',
      type: 'text',
    },
    {
      name: 'practitionerBio',
      type: 'textarea',
      admin: {
        description: '100-150 words, original (not copied from their site), editorial tone matching the site voice',
      },
    },
    {
      name: 'sessionDescription',
      type: 'textarea',
      admin: {
        description: '60-100 words, format: [Modality] · [Duration] · [Venue], [City]. [What makes it distinctive.] [Price.]',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Real photo only — practitioner-provided or Google Maps sourced (labeled), no stock images',
      },
    },
    {
      name: 'sourcingNotes',
      type: 'textarea',
      admin: {
        description: 'Internal research notes (outdoor/indoor, group/private, recurring/one-off, etc.) — not shown publicly',
      },
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        description: 'Where this listing was found, e.g. "Google Maps + website", "Eventbrite search"',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      admin: {
        description: 'Editor-curated featured pick. When true, this listing is eligible for the homepage "Now bathing" section. This is a deliberate editorial action, not inferred from any other field.',
      },
    },
    {
      name: 'listingStatus',
      type: 'select',
      required: true,
      defaultValue: 'needs-verification',
      admin: {
        description: 'Research-confidence assessment — separate from the Draft/Published state above, which controls site visibility',
      },
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Active - secondary fit', value: 'active-secondary' },
        { label: 'Auto-verified (machine-sourced)', value: 'auto-verified' },
        { label: 'Needs verification', value: 'needs-verification' },
        { label: 'Needs organizer name', value: 'needs-organizer-name' },
        { label: 'Flagged inactive', value: 'flagged-inactive' },
      ],
    },
  ],
}
