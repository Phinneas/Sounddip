// Single source of truth for the modality taxonomy, shared by the CMS schema
// (cms/src/collections/Listings.ts), the city-page filter, the homepage DipBar,
// the submit form, and the ListingCard label rendering.

export interface Modality {
  value: string;
  label: string;
  // Filterable modalities appear in the city-page filter pills and the DipBar
  // dropdown. `other` is a catch-all and `brass` is kept out of the primary
  // filter (it overlaps Tibetan/Himalayan bowls) but remains a valid tag.
  filterable: boolean;
}

export const modalities: Modality[] = [
  { value: 'gong',          label: 'Gong',                 filterable: true },
  { value: 'crystal',       label: 'Crystal bowls',        filterable: true },
  { value: 'voice',         label: 'Voice',                filterable: true },
  { value: 'tibetan-bowls', label: 'Tibetan bowls',        filterable: true },
  { value: 'reiki',         label: 'Reiki',                filterable: true },
  { value: 'breathwork',    label: 'Breathwork',           filterable: true },
  { value: 'mixed',         label: 'Mixed',                filterable: true },
  { value: 'brass',         label: 'Brass / bronze bowls', filterable: false },
  { value: 'didgeridoo',    label: 'Didgeridoo',           filterable: true },
  { value: 'drums',         label: 'Drums',                filterable: true },
  { value: 'chimes',        label: 'Chimes',               filterable: true },
  { value: 'nature',        label: 'Nature sound',         filterable: true },
  { value: 'jazz',          label: 'Jazz + sound',         filterable: true },
  { value: 'hip-hop',       label: 'Hip-hop + sound',      filterable: true },
  { value: 'floating',      label: 'Floating sound bath',  filterable: true },
  { value: 'cacao',         label: 'Cacao ceremony',       filterable: true },
  { value: 'outdoor',       label: 'Outdoor',              filterable: true },
  { value: 'other',         label: 'Other',                filterable: false },
];

export const filterableModalities = modalities.filter((m) => m.filterable);

export function modalityLabel(value: string): string {
  const found = modalities.find((m) => m.value === value);
  return found ? found.label : value.replace(/-/g, ' ');
}
