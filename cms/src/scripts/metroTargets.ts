// Top-50 US metro targets for the nationwide Nimble scrape. The data lives in
// metroTargets.json (consumed by the scraper); this file re-exports it with a
// typed interface for any TS consumer. See metroTargets.json for the full list
// and the rationale (which slugs reuse existing CMS cities vs. create new ones).
import data from './metroTargets.json';

export interface MetroTarget {
  slug: string;
  name: string; // principal city, used in the query: "sound bath in {name}, {state}"
  state: string; // US state abbreviation
  region: string; // full state/region name, used when creating a CMS city doc
}

export const metroTargets: MetroTarget[] = data as MetroTarget[];
