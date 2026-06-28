# Graph Report - /Users/chesterbeard/Desktop/Sounddip  (2026-06-16)

## Corpus Check
- Corpus is ~8,773 words - fits in a single context window. You may not need a graph.

## Summary
- 65 nodes · 82 edges · 12 communities detected
- Extraction: 74% EXTRACTED · 26% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Content Gaps & Product Features|Content Gaps & Product Features]]
- [[_COMMUNITY_East Coast City Targets|East Coast City Targets]]
- [[_COMMUNITY_Competitor & Link Strategy|Competitor & Link Strategy]]
- [[_COMMUNITY_LA & Keyword Research|LA & Keyword Research]]
- [[_COMMUNITY_SERP Opportunity Thesis|SERP Opportunity Thesis]]
- [[_COMMUNITY_Priority Scoring Model|Priority Scoring Model]]
- [[_COMMUNITY_City Data Export|City Data Export]]
- [[_COMMUNITY_Austin First-Mover|Austin First-Mover]]
- [[_COMMUNITY_Astro Site Config|Astro Site Config]]
- [[_COMMUNITY_Denver Market|Denver Market]]
- [[_COMMUNITY_Seattle Market|Seattle Market]]
- [[_COMMUNITY_Nashville Market|Nashville Market]]

## God Nodes (most connected - your core abstractions)
1. `cities[] Export Array` - 12 edges
2. `City Priority Matrix (May 2026, 10-city ranked list)` - 12 edges
3. `SERP Content Gap Analysis Overview (May 2026)` - 8 edges
4. `Sounddip Competitive Research Overview (May 2026)` - 7 edges
5. `City Interface (TypeScript)` - 5 edges
6. `SERP Audit: What This Means for Sounddip (Priority Markets)` - 5 edges
7. `Sound Bath Keyword Universe` - 4 edges
8. `SERP Audit: Zero Directories on Page 1 (5 cities)` - 4 edges
9. `Concept: Structured Practitioner Profile Page` - 4 edges
10. `SERP Audit: Los Angeles Page-1 Analysis` - 3 edges

## Surprising Connections (you probably didn't know these)
- `City: New York City` --semantically_similar_to--> `Matrix: NYC Rank #3 — Aggregate Play (No directory)`  [INFERRED] [semantically similar]
  src/data/cities.ts → city-priority-matrix-2026-05.html
- `City: Austin` --semantically_similar_to--> `Matrix: Austin Rank #1 — First Mover (No listicle, null KD)`  [INFERRED] [semantically similar]
  src/data/cities.ts → city-priority-matrix-2026-05.html
- `City: Chicago` --semantically_similar_to--> `Matrix: Chicago Rank #2 — No Listicle`  [INFERRED] [semantically similar]
  src/data/cities.ts → city-priority-matrix-2026-05.html
- `City: Atlanta` --semantically_similar_to--> `Matrix: Atlanta Rank #4 — Static Article, No Booking`  [INFERRED] [semantically similar]
  src/data/cities.ts → city-priority-matrix-2026-05.html
- `City: Los Angeles` --semantically_similar_to--> `Matrix: LA Rank #5 — Most Competitive, Highest Volume`  [INFERRED] [semantically similar]
  src/data/cities.ts → city-priority-matrix-2026-05.html

## Hyperedges (group relationships)
- **City Entities Span Code, SERP Audit, and Priority Matrix** — cities_cities_array, serpaudit_sounddip_opportunity, matrix_city_priority [INFERRED 0.88]
- **Core Thesis: No Directory Exists — Sounddip Fills It** — competitive_rationale_directory_gap, serpaudit_headline, gapanalysis_overview [EXTRACTED 0.95]
- **Content Gaps Drive Product Feature Decisions (price, format, profiles)** — gapanalysis_gap_practitioner_pages, gapanalysis_gap_price_data, cities_city_interface [INFERRED 0.82]

## Communities

### Community 0 - "Content Gaps & Product Features"
Cohesion: 0.21
Nodes (12): City Interface (TypeScript), Concept: Structured Practitioner Profile Page, Concept: Price Range as Required Listing Field, Content Gap: Audio Samples — MISSING, Content Gap: First-Timer Guide — PARTIALLY COVERED, Gaps Remain, Content Gap: Format Filtering — MISSING, Content Gap: Practitioner-Level Pages — MISSING, Content Gap: Price-by-City Data — MISSING as live queryable data (+4 more)

### Community 1 - "East Coast City Targets"
Cohesion: 0.22
Nodes (9): City: Atlanta, City: Chicago, Matrix: Atlanta Rank #4 — Static Article, No Booking, Matrix: Chicago Rank #2 — No Listicle, Matrix: NYC Rank #3 — Aggregate Play (No directory), SERP Audit: Atlanta Page-1 Analysis, SERP Audit: Chicago Page-1 Analysis, SERP Audit: New York City Page-1 Analysis (+1 more)

### Community 2 - "Competitor & Link Strategy"
Cohesion: 0.29
Nodes (8): mindbodyonline.com Backlink Profile (1,031 referring domains), retreat.guru Backlink Profile (319 referring domains), Link Strategy: Practitioner Badge Program, Competitor: bookretreats.com, High-Authority Wellness Link Targets (Esalen, Spirit Rock, Art of Living, Hollyhock), Competitor: mindbodyonline.com, Competitor: retreat.guru, Sounddip Competitive Research Overview (May 2026)

### Community 3 - "LA & Keyword Research"
Cohesion: 0.29
Nodes (7): City: Los Angeles, Sound Bath Keyword Universe, Keyword: floating sound bath (1,900/mo), Keyword: sound bath los angeles (880/mo), Keyword: sound bath studio near me (880/mo), Matrix: LA Rank #5 — Most Competitive, Highest Volume, SERP Audit: Los Angeles Page-1 Analysis

### Community 4 - "SERP Opportunity Thesis"
Cohesion: 0.33
Nodes (6): Nuisance Competitor: Eventbrite, Rationale: No Pure Directory in Any City SERP, Concept: City Directory Page (best sound baths in [city]), Sounddip: Sound Bath Practitioner Directory (core product concept), SERP Audit: Cross-City Summary, SERP Audit: Zero Directories on Page 1 (5 cities)

### Community 5 - "Priority Scoring Model"
Cohesion: 0.5
Nodes (4): City: Philadelphia, City Priority Matrix (May 2026, 10-city ranked list), Matrix: Philadelphia Rank #10 — KD 5, Underrated, Rationale: KD Score + Editorial Gap = Opportunity Score

### Community 6 - "City Data Export"
Cohesion: 0.5
Nodes (4): cities[] Export Array, City: New York City, City: Portland, Matrix: Portland Rank #7 — KD 21, PNW Cluster

### Community 7 - "Austin First-Mover"
Cohesion: 0.67
Nodes (3): City: Austin, Matrix: Austin Rank #1 — First Mover (No listicle, null KD), SERP Audit: Austin Page-1 Analysis

### Community 9 - "Astro Site Config"
Cohesion: 1.0
Nodes (2): Sounddip Astro Site Config (sounddip.com), Astro Environment Types Reference

### Community 10 - "Denver Market"
Cohesion: 1.0
Nodes (2): City: Denver, Matrix: Denver Rank #8 — Null KD, Boulder Halo

### Community 11 - "Seattle Market"
Cohesion: 1.0
Nodes (2): City: Seattle, Matrix: Seattle Rank #6 — KD 3, Write Now

### Community 12 - "Nashville Market"
Cohesion: 1.0
Nodes (2): City: Nashville, Matrix: Nashville Rank #9 — Music City Editorial Hook

## Knowledge Gaps
- **12 isolated node(s):** `Sounddip Astro Site Config (sounddip.com)`, `Astro Environment Types Reference`, `Competitor: mindbodyonline.com`, `Keyword: floating sound bath (1,900/mo)`, `Keyword: sound bath studio near me (880/mo)` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Astro Site Config`** (2 nodes): `Sounddip Astro Site Config (sounddip.com)`, `Astro Environment Types Reference`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Denver Market`** (2 nodes): `City: Denver`, `Matrix: Denver Rank #8 — Null KD, Boulder Halo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Seattle Market`** (2 nodes): `City: Seattle`, `Matrix: Seattle Rank #6 — KD 3, Write Now`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Nashville Market`** (2 nodes): `City: Nashville`, `Matrix: Nashville Rank #9 — Music City Editorial Hook`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cities[] Export Array` connect `City Data Export` to `Content Gaps & Product Features`, `East Coast City Targets`, `LA & Keyword Research`, `SERP Opportunity Thesis`, `Priority Scoring Model`, `Austin First-Mover`, `Denver Market`, `Seattle Market`, `Nashville Market`?**
  _High betweenness centrality (0.293) - this node is a cross-community bridge._
- **Why does `City Priority Matrix (May 2026, 10-city ranked list)` connect `Priority Scoring Model` to `East Coast City Targets`, `LA & Keyword Research`, `SERP Opportunity Thesis`, `City Data Export`, `Austin First-Mover`, `Denver Market`, `Seattle Market`, `Nashville Market`?**
  _High betweenness centrality (0.240) - this node is a cross-community bridge._
- **Why does `City Interface (TypeScript)` connect `Content Gaps & Product Features` to `City Data Export`?**
  _High betweenness centrality (0.217) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `City Interface (TypeScript)` (e.g. with `Concept: Structured Practitioner Profile Page` and `Content Gap: Price-by-City Data — MISSING as live queryable data`) actually correct?**
  _`City Interface (TypeScript)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Sounddip Astro Site Config (sounddip.com)`, `Astro Environment Types Reference`, `Competitor: mindbodyonline.com` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._