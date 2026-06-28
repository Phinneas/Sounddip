import type { CollectionConfig } from 'payload'

export const Cities: CollectionConfig = {
  slug: 'cities',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'region', 'tier', '_status'],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug, e.g. "los-angeles" — must match the MVP-20 city list',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'region',
      type: 'text',
      required: true,
      admin: {
        description: 'State or region, e.g. "California"',
      },
    },
    {
      name: 'tier',
      type: 'select',
      required: true,
      defaultValue: '1',
      options: [
        { label: '1 — Launch priority', value: '1' },
        { label: '2 — Second wave', value: '2' },
        { label: '3 — Later', value: '3' },
      ],
    },
    {
      name: 'tagline',
      type: 'text',
      admin: {
        description: 'Short editorial hook shown on the city card',
      },
    },
    {
      name: 'sessionCount',
      type: 'number',
      admin: {
        description: 'Display count of sessions/listings for this city (can be derived from Listings later)',
      },
    },
    {
      name: 'priceRange',
      type: 'text',
      admin: {
        description: 'e.g. "$35–$75"',
      },
    },
    {
      name: 'formats',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Crystal bowls', value: 'crystal-bowls' },
        { label: 'Gong', value: 'gong' },
        { label: 'Tibetan bowls', value: 'tibetan-bowls' },
        { label: 'Voice + overtone', value: 'voice' },
        { label: 'Cacao ceremony', value: 'cacao' },
        { label: 'Outdoor / forest', value: 'outdoor' },
        { label: 'Private 1-on-1', value: 'private' },
        { label: 'Mobile / traveling', value: 'mobile' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'scene',
      type: 'textarea',
      admin: {
        description: 'Editorial narrative describing the local sound bath scene — long-form, matches the site\'s Fraunces-voice editorial tone',
      },
    },
    {
      name: 'venues',
      type: 'array',
      admin: {
        description: 'Featured venues/practitioners called out in the editorial copy (not the full listings directory — see the Listings collection for that)',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'note',
          type: 'text',
        },
      ],
    },
    {
      name: 'beginner',
      type: 'textarea',
      admin: {
        description: 'Guidance for a first-timer in this city',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Real photo only — no stock images of generic meditation scenes',
      },
    },
  ],
}
