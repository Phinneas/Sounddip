// MVP-20 city list — single source of truth for the seeding/import scripts.
// csvFile is the seed-listings-*.csv filename (without the directory prefix)
// in ~/Desktop/sounddip/ — listings always relate to the city this maps to,
// regardless of what a row's own "City" column literally says (sub-cities
// like Tarzana or Pasadena are folded into neighborhood instead).
export type CityEntry = {
  slug: string
  name: string
  region: string
  tier: '1' | '2' | '3'
  csvFile: string
}

export const cityData: CityEntry[] = [
  { slug: 'new-york', name: 'New York City', region: 'New York', tier: '1', csvFile: 'seed-listings-nyc-pilot.csv' },
  { slug: 'los-angeles', name: 'Los Angeles', region: 'California', tier: '1', csvFile: 'seed-listings-la-pilot.csv' },
  { slug: 'san-francisco', name: 'San Francisco', region: 'California', tier: '2', csvFile: 'seed-listings-sf-pilot.csv' },
  { slug: 'chicago', name: 'Chicago', region: 'Illinois', tier: '2', csvFile: 'seed-listings-chicago-pilot.csv' },
  { slug: 'austin', name: 'Austin', region: 'Texas', tier: '2', csvFile: 'seed-listings-austin-pilot.csv' },
  { slug: 'denver', name: 'Denver', region: 'Colorado', tier: '2', csvFile: 'seed-listings-denver-pilot.csv' },
  { slug: 'portland', name: 'Portland', region: 'Oregon', tier: '2', csvFile: 'seed-listings-portland-pilot.csv' },
  { slug: 'seattle', name: 'Seattle', region: 'Washington', tier: '2', csvFile: 'seed-listings-seattle-pilot.csv' },
  { slug: 'joshua-tree', name: 'Joshua Tree', region: 'California', tier: '2', csvFile: 'seed-listings-joshuatree-pilot.csv' },
  { slug: 'boulder', name: 'Boulder', region: 'Colorado', tier: '3', csvFile: 'seed-listings-boulder-pilot.csv' },
  { slug: 'sedona', name: 'Sedona', region: 'Arizona', tier: '3', csvFile: 'seed-listings-sedona-pilot.csv' },
  { slug: 'asheville', name: 'Asheville', region: 'North Carolina', tier: '3', csvFile: 'seed-listings-asheville-pilot.csv' },
  { slug: 'miami', name: 'Miami', region: 'Florida', tier: '3', csvFile: 'seed-listings-miami-pilot.csv' },
  { slug: 'san-diego', name: 'San Diego', region: 'California', tier: '3', csvFile: 'seed-listings-sandiego-pilot.csv' },
  { slug: 'boston', name: 'Boston', region: 'Massachusetts', tier: '3', csvFile: 'seed-listings-boston-pilot.csv' },
  { slug: 'santa-fe', name: 'Santa Fe', region: 'New Mexico', tier: '3', csvFile: 'seed-listings-santafe-pilot.csv' },
  { slug: 'minneapolis', name: 'Minneapolis', region: 'Minnesota', tier: '3', csvFile: 'seed-listings-minneapolis-pilot.csv' },
  { slug: 'washington-dc', name: 'Washington', region: 'District of Columbia', tier: '3', csvFile: 'seed-listings-washingtondc-pilot.csv' },
  { slug: 'new-orleans', name: 'New Orleans', region: 'Louisiana', tier: '3', csvFile: 'seed-listings-neworleans-pilot.csv' },
  { slug: 'burlington', name: 'Burlington', region: 'Vermont', tier: '3', csvFile: 'seed-listings-burlington-pilot.csv' },
]
