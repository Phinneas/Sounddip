# SoundDip — Handoff Summary

Written 2026-06-28 at the end of a long Claude Code session, for continuation by a different agent (droid). This doc is meant to be fully self-contained — don't assume access to Claude's memory system or this session's history.

## 1. Project Overview

SoundDip is a sound bath / sound healing practitioner directory site. Astro frontend, Payload CMS backend, deployed on Cloudflare. The project was split from an original "tri-directory" project (Asana project notes mention this — there may be sibling Site2/Site3 projects elsewhere; not investigated this session).

**Repo root:** `~/Desktop/sounddip/` (note: on disk this resolves case-insensitively; some configs reference `/Users/chesterbeard/Desktop/Sounddip` with a capital S — same directory on macOS's default case-insensitive filesystem, but be aware of it if anything ever runs on a case-sensitive filesystem).

## 2. Architecture — Final, Locked Decisions

Do not re-litigate these; they were each decided after real back-and-forth this session:

- **Frontend:** Astro, unchanged, at the repo root (`~/Desktop/sounddip/src/`, `astro.config.mjs`, etc.). This is what site visitors see. 100% Astro — no Next.js in the public-facing site.
- **CMS:** Payload 3.85, in `~/Desktop/sounddip/cms/` — a **separate Next.js 15 app**, admin-only backend, own URL, never seen by visitors. This is a two-app monorepo, not one merged app. Payload's admin panel architecturally requires Next.js (its admin UI and API routes are Next.js App Router routes) — there is no way around this if you want Payload's GUI; that's why the CMS lives in its own Next.js app rather than inside Astro.
- **Database:** Cloudflare **D1** via `@payloadcms/db-d1-sqlite`. MongoDB and SurrealDB were both explicitly considered and ruled out (D1 fits the flat/relational shape of the data and avoids a new vendor).
- **Storage:** Cloudflare **R2** via `@payloadcms/storage-r2`, with `clientUploads: false` explicitly set (see Blockers below for why this matters).
- **Deployment target:** `@opennextjs/cloudflare` (the current correct way to run Next.js on Cloudflare Workers — not the older `@cloudflare/next-on-pages`).
- **Cloudflare resource names:** D1 database = `sounddip`, R2 bucket = `sounddip`, worker name = `sounddip-cms` (kept distinct from the eventual Astro site's own worker name).
- **No Airtable, no Sanity.** Originally planned (Airtable staging → Sanity import); both dropped. Payload's native `versions.drafts` feature (per-collection draft/published `_status`, version history, admin-UI filtering) replaces what Airtable's manual staging would have done.
- **Tenancy:** SoundDip has its **own dedicated** Payload + D1 + R2 instance — explicitly NOT shared with any sibling project (e.g. `keystoneplants-payload`). The user has been burned before by trying to manage multiple tenants on one CMS instance (SonicJS, in a past project) — don't suggest consolidating instances.
- ⚠️ **`keystoneplants-payload` is not a usable reference.** It was cited early this session as a "proven precedent" for the Payload+D1+Cloudflare pattern, based on a CLAUDE.md project-table description. On inspection, `~/CascadeProjects/keystoneplants-payload/` contains *only* a `node_modules` folder (342 packages) — no `package.json`, no source, no config. It's an empty/abandoned shell. Don't cite it as precedent for anything; verify any claims about it directly if it comes up again.

## 3. Current State — What's Actually Built and Verified

Not just written — each of these was tested and confirmed working, not assumed:

- **`cms/` scaffolded** via the official `create-payload-app -t with-cloudflare-d1` template (Next.js 15.4.11 + Payload 3.85.1 + `@payloadcms/db-d1-sqlite` + `@opennextjs/cloudflare` + R2 storage plugin, all pre-wired).
- **Schema built:** `cms/src/collections/Cities.ts` and `cms/src/collections/Listings.ts`, both registered in `cms/src/payload.config.ts`, both with `versions: { drafts: true }`.
  - **Cities:** slug, name, region, tier (1/2/3 select), tagline, sessionCount, priceRange, formats (multi-select), scene (textarea, editorial narrative), venues (array of {name, note}), beginner (textarea), image (upload → Media).
  - **Listings:** name, slug, city (relationship → Cities), neighborhood, modalityTags (multi-select: gong/crystal/voice/brass/tibetan-bowls/reiki/breathwork/mixed/other), modalityDescription (free text), duration, price, bookingUrl, practitionerBio (textarea), sessionDescription (textarea), photo (upload → Media), sourcingNotes (textarea, internal), source, listingStatus (select: active/active-secondary/needs-verification/needs-organizer-name/flagged-inactive — this is the *research-confidence* tag, separate from Payload's own draft/published `_status`).
  - Verified by actually creating a test user in the local admin panel and opening both collections' create forms — every field rendered correctly, including the City relationship picker.
- **Data imported:** all 20 MVP cities seeded into the Cities collection; **193 listings** imported into the Listings collection as DRAFT documents, via two idempotent scripts run with `payload run`:
  - `cms/src/scripts/cityData.ts` — the 20-city slug/name/region/tier table, single source of truth, also maps each city to its CSV filename.
  - `cms/src/scripts/parseCsv.ts` — small RFC4180-style CSV parser (no external dependency).
  - `cms/src/scripts/seedCities.ts` — creates the 20 City docs (idempotent, skips existing slugs).
  - `cms/src/scripts/importListings.ts` — reads all 20 `seed-listings-*.csv` files from the repo root, maps fields, resolves the city relationship, auto-tags modality by keyword heuristic, maps the CSV's free-text Status column to the `listingStatus` enum, creates each row as a draft Listing (idempotent on slug).
  - Result: 193 created, 0 failed, exact match to the total CSV row count across all 20 cities.
  - Spot-checked directly against the database afterward: city relationships resolve correctly, sub-city text (e.g. "Tarzana", "Landers") correctly became `neighborhood` rather than duplicating the city name, and all 4 listings flagged inactive during sourcing mapped correctly to `flagged-inactive`.
- **Known gap in the import:** the modality auto-tagging (keyword match on the CSV's free-text Modality column) only confidently tagged 66 of 193 listings (gong/crystal/reiki/voice/tibetan-bowls/breathwork) — the other 127 landed in the `other` tag because most source listings just say generic "sound bath" or "sound healing" without a more specific term. This is a real limitation of the keyword heuristic, not a bug. Needs a manual tagging pass eventually.
- **Local dev only.** Everything above runs against Miniflare's local D1/R2 simulation via Wrangler. `cms/wrangler.jsonc` still has the placeholder `"database_id": "DATABASE_ID"` — no real Cloudflare D1 database has been created yet, nothing has been deployed.

## 4. Asana Project Reference

Project: **"SoundDip — Sound Bath Directory"**, gid `1215349078398365`, workspace gid `1157716357545915`. Permalink: https://app.asana.com/1/1157716357545915/project/1215349078398365

Six phases: Research (P1) → Brand (P2) → Build (P3) → Data (P4) → Content/SEO (P5) → Growth (P6). P1/P2 complete. P5 mostly complete (2 open tasks: on-page SEO audit, submit sitemap). P6 fully open (newsletter, outbound venue claims, KPI dashboard, backlink/PR plan, monetization — none started).

**⚠️ Important lesson from this session: do not trust Asana's "completed" checkbox without verifying against the actual codebase.** Multiple tasks were found marked complete that didn't match reality:
- "P1 · MVP city list" was complete but listed a stale 10-city set including London, after the actual decision had moved to 15 then 20 US-only cities. Fixed.
- "P3 · CMS schema + admin workflow" was marked complete with *zero* CMS actually installed. Reopened, then genuinely completed this session (see Section 3).

Current P3/P4 status (as of this session's end):
- **P3 · CMS schema + admin workflow** — ✅ complete (genuinely, this time — see Section 3).
- **P4 · Decide data sourcing approach** — ✅ complete. The decision (hybrid manual research + Eventbrite; Payload's native drafts instead of Airtable; Yelp Fusion API / Mindbody / Insight Timer were in the original plan but turned out unnecessary since Google Maps + Eventbrite alone proved sufficient) is made and is what's being executed against.
- **P4 · Source 300-450 seed listings** — ❌ open. 193 of 300-450 target. See Section 5 for why several cities are intentionally thin.
- **P4 · QA pass on first city (LA)** — ❌ open, blocked. Drafts exist in a local dev DB; nothing is live on an actual deployed site yet.
- **P4 · Listing photo + description workflow** — ❌ open. 10 of 193 listings have descriptions drafted (LA only, see Section 8). 0 photos.
- **P4 · Build owner submission form** — ❌ open, deliberately deferred by the user. Don't start this without being asked.
- **P4 · Reconcile cities.ts with MVP-20 city list** — ❌ open, untouched. See Section 8.
- **P4 · Schema.org markup** — ❌ open, not started at all.

Key task gids if you need to comment/update directly: Source listings `1215349269742206`, QA pass LA `1215349073559207`, photo/description workflow `1215349078415706`, owner submission form `1216058877230493`, cities.ts reconciliation `1216059199959007`, Schema.org markup `1215349073602734`.

## 5. Data Sourcing Methodology & Considerations

**Pipeline used:** Google Maps business listings (via a DataForSEO-backed MCP tool, `business_data_business_listings_search` — title search + location_coordinate radius) as the primary source, supplemented by Eventbrite (via Tavily search/extract) for independent practitioners without a Google Maps presence.

**What worked:**
- Maps title search on `"sound bath"` and `"sound healing"` was productive in dense markets (NYC, LA, Chicago especially).
- Maps' `people_also_search` field on any hit was consistently a goldmine — it surfaced high-review-count businesses that didn't literally have "sound bath" in their name and would have been missed by title search alone. Always follow up on those, especially ones with unusually high review counts.
- Eventbrite carried entire cities where Maps came back empty (San Francisco, Denver, Boston, Washington DC, New Orleans all had zero or near-zero direct Maps hits — their sound bath scenes are venue/event-driven, not dedicated-business-driven). This is a real market-structure difference, not a sourcing failure — don't keep digging trying to force volume out of these cities.

**What didn't work / don't bother repeating:**
- Maps title search on `"gong bath"`, `"singing bowl"`, `"crystal bowl"` was unproductive (0 results) in literally every city tested. Stick to `"sound bath"` and `"sound healing"` as the two core terms.

**Standing rules established this session (the user confirmed these explicitly, apply them without re-asking):**
- **Quality over volume.** Don't pad thin cities with weak/unverified listings just to hit the 20-30/city target. The "Build owner submission form" task (deferred but tracked) is the intended long-term mechanism for filling gaps — not exhaustive AI re-sourcing.
- **Chase fixable gaps, skip genuine dead ends.** If a listing is missing one findable detail (organizer name, a price that's on a page you haven't checked yet), do one more targeted search. If it's a true dead end (Instagram/Facebook-only presence with a login wall, a 404, no address found after a real attempt), flag it `needs-verification` and move on — don't keep chasing.
- **Geographic discipline.** Several near-radius hits were excluded for being in the wrong state/city entirely (NJ businesses surfacing in NYC searches, "The Awakened Soul" turning out to be in Costa Mesa CA — not LA — etc.). Always verify the region/state actually matches the target city before including a result.
- **Cross-city operator awareness.** WakeUpDreamer and The Soundbath Center/"The Gong Room" (Jamie Bechtold's `sound-bath.com` brand) both independently surfaced in *two* different MVP cities (LA + Joshua Tree for both). These are the same operators with multiple listings, not coincidences — worth deduping at some point, not urgent.

**MVP-20 city list** (also in `cms/src/scripts/cityData.ts`, which is the authoritative machine-readable copy):

| Slug | Name | Region | Seed CSV |
|---|---|---|---|
| new-york | New York City | New York | seed-listings-nyc-pilot.csv |
| los-angeles | Los Angeles | California | seed-listings-la-pilot.csv |
| san-francisco | San Francisco | California | seed-listings-sf-pilot.csv |
| chicago | Chicago | Illinois | seed-listings-chicago-pilot.csv |
| austin | Austin | Texas | seed-listings-austin-pilot.csv |
| denver | Denver | Colorado | seed-listings-denver-pilot.csv |
| portland | Portland | Oregon | seed-listings-portland-pilot.csv |
| seattle | Seattle | Washington | seed-listings-seattle-pilot.csv |
| joshua-tree | Joshua Tree | California | seed-listings-joshuatree-pilot.csv |
| boulder | Boulder | Colorado | seed-listings-boulder-pilot.csv |
| sedona | Sedona | Arizona | seed-listings-sedona-pilot.csv |
| asheville | Asheville | North Carolina | seed-listings-asheville-pilot.csv |
| miami | Miami | Florida | seed-listings-miami-pilot.csv |
| san-diego | San Diego | California | seed-listings-sandiego-pilot.csv |
| boston | Boston | Massachusetts | seed-listings-boston-pilot.csv |
| santa-fe | Santa Fe | New Mexico | seed-listings-santafe-pilot.csv |
| minneapolis | Minneapolis | Minnesota | seed-listings-minneapolis-pilot.csv |
| washington-dc | Washington | District of Columbia | seed-listings-washingtondc-pilot.csv |
| new-orleans | New Orleans | Louisiana | seed-listings-neworleans-pilot.csv |
| burlington | Burlington | Vermont | seed-listings-burlington-pilot.csv |

US-only scope. London was in the original 10-city list and was explicitly dropped. Canada was floated as a possible future expansion but never decided — don't add it without being asked. Europe is explicitly out.

Each `seed-listings-*.csv` has columns: Name, City, Neighborhood, Modality, Duration, Price, Booking URL, Notes, Source, Status. The "City" column sometimes holds a sub-city (e.g. "Tarzana" for an LA-area listing) rather than the MVP city name — the import script handles this by always relating to the MVP city the *file* belongs to, and folding any differing sub-city text into `neighborhood`.

## 6. Blockers Encountered & Resolutions (read this before debugging the same things again)

1. **Payload's admin panel requires Next.js — no way around it for a real GUI.** Confirmed directly from Payload's own docs. This is why `cms/` is a separate Next.js app rather than something merged into Astro.

2. **R2 storage plugin pulled Payload's entire server-only internals into the browser bundle.** `@payloadcms/storage-r2`'s `R2ClientUploadHandler.js` imports `getSafeFileName` from `payload/internal`. That's a single-file re-export barrel (4 exports: `getSafeFileName`, `parseRangeHeader`, `getEntityPermissions`, `sanitizePermissions`) — naming just one export still forces webpack to resolve the *whole file*, which transitively pulls in `undici`, `file-type`, Payload's telemetry module, and Node dependency-resolution helpers. None of that can bundle for a browser target (cascading errors: `worker_threads`, `node:assert`, `node:async_hooks`, `node:sqlite`, a `file-type` export-shape mismatch, `node:module` — each fix revealed the next, all from the same root file).
   - **Root cause:** all 4 exports in `payload/internal` are genuinely server-only (DB lookups, filesystem access, Node permission checks). The only client-side caller is the upload handler above, and only when `clientUploads` is enabled on the storage plugin — which is explicitly set to `false` in `payload.config.ts`. So this entire import path is dead code in the browser regardless.
   - **Fix:** `cms/next.config.ts`'s `webpack()` function aliases `payload/internal` to `cms/src/stubs/payload-internal-client-stub.js` (a tiny local stub with real no-op function exports — not `false`, so any non-call usage like a `typeof` check still sees real functions) **for client builds only** (`!isServer`). The server bundle still gets the real `payload/internal`.
   - If you see *any* new "Module not found" error inside an import trace that bottoms out at `R2ClientUploadHandler.js` → `payload/internal`, the fix is the same: it's not a new bug, it's the same root cause finding a slightly different leaf.

3. **`payload run <script>` silently does nothing with static top-level imports.** Scripts using `import config from '../payload.config.js'` at the top of the file ran with exit code 0 and produced *zero* output and *zero* database writes — no error, nothing. Switching to dynamic imports (`const { default: config } = await import('../payload.config.js')`, same for `payload`, and any other local module) fixed it completely and is now the confirmed-working pattern. **Use dynamic imports in any new Payload CLI script in this project.** (Root cause not fully isolated — payload.config.ts has a top-level `await` of its own for the Cloudflare/Wrangler platform proxy; something about how `payload run`'s loader handles statically-imported modules with their own top-level await appears to differ from dynamically-imported ones. Didn't dig further once the working pattern was confirmed — not worth the time at this stage.)

4. **The actual `launch.json` used by preview tooling is global, not project-local.** It's at `~/.claude/launch.json`, not `~/Desktop/sounddip/.claude/launch.json` (a similarly-named file exists there too but is NOT what gets read — don't edit it, it's effectively dead). The global file already has entries for several sibling projects (`keystoneplants`, `ssc`, `thejuiceindex`, `sounddip` — note the Astro site's existing entry uses port 4322, not Astro's default 4321) plus the new `sounddip-cms` entry added this session (port 3010, `cwd` pointing at `cms/`).

5. **Multiple lockfiles warning**, not yet resolved: Next.js logs "Found multiple lockfiles. Selecting `/Users/chesterbeard/Desktop/Sounddip/package-lock.json`" on every `cms/` dev server start, because both the repo root and `cms/` have their own `package-lock.json`. Hasn't caused a concrete problem yet, but could cause subtle dependency-resolution drift between the two. Worth fixing (likely: add `outputFileTracingRoot` to `next.config.ts`, or just accept the two-lockfile reality of a non-workspace monorepo) but didn't block anything this session.

## 7. File Inventory

Everything created or modified this session, repo-root-relative unless noted:

- `seed-listings-{nyc,la,sf,chicago,austin,denver,portland,seattle,joshuatree,boulder,sedona,asheville,miami,sandiego,boston,santafe,minneapolis,washingtondc,neworleans,burlington}-pilot.csv` — 20 files, raw sourced data, one per MVP city.
- `descriptions-la-pilot.md` — drafted practitioner bios + session descriptions for 10 of LA's listings. **Not yet merged into Payload** — these need to be matched to their already-imported Listing records (by name/slug) and written into the `practitionerBio`/`sessionDescription` fields.
- `cms/` — the whole Payload+Next.js app (new this session). Notable files: `src/payload.config.ts`, `src/collections/Cities.ts`, `src/collections/Listings.ts`, `src/collections/Media.ts` (template default), `src/collections/Users.ts` (template default), `src/stubs/payload-internal-client-stub.js`, `src/scripts/{cityData,parseCsv,seedCities,importListings}.ts`, `next.config.ts`, `wrangler.jsonc`.
- `src/data/cities.ts` — pre-existing Astro data file, **not yet reconciled** with the MVP-20 list (see Section 8). Don't confuse this with the new Payload Cities *collection* — they're separate things with overlapping purposes.
- `~/.claude/launch.json` — global preview-server config, added the `sounddip-cms` entry.

## 8. What's NOT Done — Punch List

Roughly in the order it probably makes sense to tackle them, but use judgment:

1. **Merge LA's 10 drafted descriptions into Payload.** They exist as prose in `descriptions-la-pilot.md` but were written before the import script existed — they're not yet in any Listing record's `practitionerBio`/`sessionDescription` fields. Match by name, write a small script (same dynamic-import pattern as the existing scripts) to patch them in.
2. **Write the remaining 183 listings' descriptions.** Same format: 100-150 word practitioner bio, 60-100 word session description, editorial tone (see the existing Astro component `src/components/FirstDip.astro` for the site's actual voice — short declarative sentences, concrete and sensory, not generic wellness-marketing language).
3. **Source photos.** Two paths exist, neither started: (a) practitioner outreach email (a draft script is in the Asana "Listing photo + description workflow" task notes), and (b) Google Maps' own photos — the DataForSEO business listing API responses captured a `main_image` URL for most direct Maps hits during sourcing, but those URLs were never extracted into the CSVs. If you re-run similar Maps queries, grab `main_image` this time.
4. **Reconcile `src/data/cities.ts` with the MVP-20 list.** The file currently has rich editorial content for 10 cities — Austin, Chicago, NYC, Atlanta, LA, Seattle, Portland, Denver, Nashville, Philadelphia — that don't match MVP-20 at all (Atlanta/Nashville/Philadelphia aren't in scope; 12 MVP cities have zero entry here). This is a content-writing task (new narrative per missing city, matching the existing voice/structure), not a data migration — the Payload Cities collection and this file serve different purposes (Payload = structured backend data; this file = the actual editorial copy currently rendering on the live Astro site's city pages) and aren't meant to be merged into one.
5. **Human review + selectively publish** some of the 193 draft Listings (none are published yet — that's intentional, not an oversight).
6. **Real Cloudflare deployment.** Create the actual D1 database (`wrangler d1 create sounddip`), patch the real `database_id` into `wrangler.jsonc`, create the R2 bucket, then `npm run deploy` from `cms/`. Currently everything is local-dev-only against Miniflare's simulation.
7. **Schema.org/JSON-LD markup** on the Astro site's pages (Event schema for sessions, Person for practitioners, BreadcrumbList+ItemList for city pages) — not started, fully separate from everything above.
8. **Owner submission form** — deliberately deferred, don't start without being asked.

Good luck — this is a real, working pipeline at this point, not a prototype. The hard infrastructure problems are solved; what's left is mostly content volume and deployment mechanics.
