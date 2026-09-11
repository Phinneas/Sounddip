import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Columns may already exist (added manually via wrangler d1 execute).
  // Wrap each in try/catch so the migration succeeds and registers the schema.
  const statements = [
    sql`ALTER TABLE \`listings\` ADD \`address\` text;`,
    sql`ALTER TABLE \`listings\` ADD \`state\` text;`,
    sql`ALTER TABLE \`listings\` ADD \`zip\` text;`,
    sql`ALTER TABLE \`listings\` ADD \`lat\` numeric;`,
    sql`ALTER TABLE \`listings\` ADD \`lng\` numeric;`,
    sql`ALTER TABLE \`listings\` ADD \`phone\` text;`,
    sql`ALTER TABLE \`listings\` ADD \`featured\` integer;`,
    sql`ALTER TABLE \`_listings_v\` ADD \`version_address\` text;`,
    sql`ALTER TABLE \`_listings_v\` ADD \`version_state\` text;`,
    sql`ALTER TABLE \`_listings_v\` ADD \`version_zip\` text;`,
    sql`ALTER TABLE \`_listings_v\` ADD \`version_lat\` numeric;`,
    sql`ALTER TABLE \`_listings_v\` ADD \`version_lng\` numeric;`,
    sql`ALTER TABLE \`_listings_v\` ADD \`version_phone\` text;`,
    sql`ALTER TABLE \`_listings_v\` ADD \`version_featured\` integer;`,
  ]
  for (const stmt of statements) {
    try { await db.run(stmt) } catch (e) { /* column may already exist */ }
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`listings\` DROP COLUMN \`address\`;`)
  await db.run(sql`ALTER TABLE \`listings\` DROP COLUMN \`state\`;`)
  await db.run(sql`ALTER TABLE \`listings\` DROP COLUMN \`zip\`;`)
  await db.run(sql`ALTER TABLE \`listings\` DROP COLUMN \`lat\`;`)
  await db.run(sql`ALTER TABLE \`listings\` DROP COLUMN \`lng\`;`)
  await db.run(sql`ALTER TABLE \`listings\` DROP COLUMN \`phone\`;`)
  await db.run(sql`ALTER TABLE \`listings\` DROP COLUMN \`featured\`;`)
  await db.run(sql`ALTER TABLE \`_listings_v\` DROP COLUMN \`version_address\`;`)
  await db.run(sql`ALTER TABLE \`_listings_v\` DROP COLUMN \`version_state\`;`)
  await db.run(sql`ALTER TABLE \`_listings_v\` DROP COLUMN \`version_zip\`;`)
  await db.run(sql`ALTER TABLE \`_listings_v\` DROP COLUMN \`version_lat\`;`)
  await db.run(sql`ALTER TABLE \`_listings_v\` DROP COLUMN \`version_lng\`;`)
  await db.run(sql`ALTER TABLE \`_listings_v\` DROP COLUMN \`version_phone\`;`)
  await db.run(sql`ALTER TABLE \`_listings_v\` DROP COLUMN \`version_featured\`;`)
}
