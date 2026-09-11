// Shared CMS client for the Astro site.
// All build-time fetches of the Payload CMS go through here so the city pages
// and the homepage use identical fetch + visibility-filter logic.

const CMS_API = 'https://sounddip-cms.buzzuw2.workers.dev';

// Only these statuses are shown publicly on the site. `active` and
// `active-secondary` are the hand-reviewed listings — each carries an original
// practitioner bio and session description. `auto-verified` machine-sourced
// listings (Nimble/Google Maps scrapes) are intentionally excluded: they have
// no original description and read as thin padding to a human reviewer, so the
// public site shows only the listings with real editorial content.
const VISIBLE_STATUSES = ['active', 'active-secondary'];

export interface CmsCity {
  id: number;
  name: string;
  slug: string;
  region: string;
}

export interface CmsListing {
  id: number;
  name: string;
  slug: string;
  // With depth=0 this is the city id (number); with depth=1 it's the populated city.
  city: number | CmsCity | null;
  neighborhood?: string | null;
  modalityTags?: string[] | null;
  modalityDescription?: string | null;
  duration?: string | null;
  price?: string | null;
  bookingUrl?: string | null;
  practitionerBio?: string | null;
  sessionDescription?: string | null;
  photo?: any;
  featured?: boolean | null;
  listingStatus: string;
  createdAt?: string;
  updatedAt?: string;
  _status?: string;
}

// Fetch JSON from the CMS with a timeout. Never throws to the build: returns
// null on any failure so callers can fall back to an empty list.
async function fetchJson(url: string, timeoutMs = 15000): Promise<any | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function isVisible(l: CmsListing): boolean {
  return VISIBLE_STATUSES.includes(l.listingStatus);
}

// Resolve the populated city object (depth=1) or null. Used by homepage cards to
// show the city name alongside the neighborhood.
export function listingCityName(l: CmsListing): string | null {
  if (l.city && typeof l.city === 'object') return (l.city as CmsCity).name;
  return null;
}

// Listings for a single city, by city slug. Replaces the inline try/fetch in
// [city].astro. depth=1 so the `photo` upload (and city) are populated, enabling
// ListingCard to render a real photo when one exists. Visibility filtering is
// applied here so callers always get only publicly-showable listings.
export async function getListingsForCity(slug: string): Promise<CmsListing[]> {
  const cityData = await fetchJson(
    `${CMS_API}/api/cities?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
    10000,
  );
  const cityId = cityData?.docs?.[0]?.id;
  if (!cityId) return [];
  const data = await fetchJson(
    `${CMS_API}/api/listings?where[city][equals]=${cityId}&limit=100&depth=1`,
    15000,
  );
  return (data?.docs || []).filter(isVisible);
}

// A single city record by slug (for real createdAt/updatedAt timestamps used
// in Article schema). Returns null if the CMS is unreachable or the city is
// missing — callers must omit date fields rather than fabricate them.
export interface CmsCityRecord {
  id: number;
  slug: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  _status?: string;
}
export async function getCityRecord(slug: string): Promise<CmsCityRecord | null> {
  const data = await fetchJson(
    `${CMS_API}/api/cities?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
    10000,
  );
  return data?.docs?.[0] ?? null;
}

// Resolve a listing's photo to an absolute URL (or null). Payload returns the
// populated Media document at depth=1 (with `url`, `alt`, etc.) or a bare id /
// null at lower depth. Relative media URLs are rooted at the CMS origin.
export function resolvePhotoUrl(photo: any): string | null {
  if (!photo || typeof photo !== 'object') return null;
  const url = photo.url || photo.thumbnailURL;
  if (!url) return null;
  return String(url).startsWith('http') ? String(url) : `${CMS_API}${url}`;
}

export function resolvePhotoAlt(photo: any, fallback: string): string {
  if (photo && typeof photo === 'object' && photo.alt) return photo.alt;
  return fallback;
}

// All visible listings across every city, with the city relationship populated
// (depth=1) so homepage cards can show the city name. Used by the homepage to
// split into featured + recently-added.
export async function getAllVisibleListings(): Promise<CmsListing[]> {
  const all: CmsListing[] = [];
  let page = 1;
  let hasNext = true;
  // The CMS returns ~1083 listings across three 500-item pages. Its default
  // (newest-first) sort puts the auto-verified scrapes on page 1 and the
  // hand-reviewed active listings on later pages, so a single page would miss
  // the real content. Walk every page, then apply the visibility filter.
  while (hasNext && page <= 20) {
    const data = await fetchJson(
      `${CMS_API}/api/listings?limit=500&page=${page}&depth=1`,
      20000,
    );
    const docs = data?.docs || [];
    if (docs.length === 0) break;
    all.push(...docs);
    hasNext = !!data?.hasNextPage;
    page++;
  }
  return all.filter(isVisible);
}
