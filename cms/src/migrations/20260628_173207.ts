import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`cities_formats\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`cities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`cities_formats_order_idx\` ON \`cities_formats\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`cities_formats_parent_idx\` ON \`cities_formats\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`cities_venues\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`note\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`cities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`cities_venues_order_idx\` ON \`cities_venues\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`cities_venues_parent_id_idx\` ON \`cities_venues\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`cities\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`name\` text,
  	\`region\` text,
  	\`tier\` text DEFAULT '1',
  	\`tagline\` text,
  	\`session_count\` numeric,
  	\`price_range\` text,
  	\`scene\` text,
  	\`beginner\` text,
  	\`image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`cities_slug_idx\` ON \`cities\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`cities_image_idx\` ON \`cities\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`cities_updated_at_idx\` ON \`cities\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`cities_created_at_idx\` ON \`cities\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`cities__status_idx\` ON \`cities\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_cities_v_version_formats\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_cities_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_cities_v_version_formats_order_idx\` ON \`_cities_v_version_formats\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_cities_v_version_formats_parent_idx\` ON \`_cities_v_version_formats\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_cities_v_version_venues\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`note\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_cities_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_cities_v_version_venues_order_idx\` ON \`_cities_v_version_venues\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_cities_v_version_venues_parent_id_idx\` ON \`_cities_v_version_venues\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_cities_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_slug\` text,
  	\`version_name\` text,
  	\`version_region\` text,
  	\`version_tier\` text DEFAULT '1',
  	\`version_tagline\` text,
  	\`version_session_count\` numeric,
  	\`version_price_range\` text,
  	\`version_scene\` text,
  	\`version_beginner\` text,
  	\`version_image_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`cities\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_cities_v_parent_idx\` ON \`_cities_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_cities_v_version_version_slug_idx\` ON \`_cities_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_cities_v_version_version_image_idx\` ON \`_cities_v\` (\`version_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_cities_v_version_version_updated_at_idx\` ON \`_cities_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_cities_v_version_version_created_at_idx\` ON \`_cities_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_cities_v_version_version__status_idx\` ON \`_cities_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_cities_v_created_at_idx\` ON \`_cities_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_cities_v_updated_at_idx\` ON \`_cities_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_cities_v_latest_idx\` ON \`_cities_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`listings_modality_tags\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`listings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`listings_modality_tags_order_idx\` ON \`listings_modality_tags\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`listings_modality_tags_parent_idx\` ON \`listings_modality_tags\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`listings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`slug\` text,
  	\`city_id\` integer,
  	\`neighborhood\` text,
  	\`modality_description\` text,
  	\`duration\` text,
  	\`price\` text,
  	\`booking_url\` text,
  	\`practitioner_bio\` text,
  	\`session_description\` text,
  	\`photo_id\` integer,
  	\`sourcing_notes\` text,
  	\`source\` text,
  	\`listing_status\` text DEFAULT 'needs-verification',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`city_id\`) REFERENCES \`cities\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`listings_slug_idx\` ON \`listings\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`listings_city_idx\` ON \`listings\` (\`city_id\`);`)
  await db.run(sql`CREATE INDEX \`listings_photo_idx\` ON \`listings\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX \`listings_updated_at_idx\` ON \`listings\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`listings_created_at_idx\` ON \`listings\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`listings__status_idx\` ON \`listings\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_listings_v_version_modality_tags\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_listings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_listings_v_version_modality_tags_order_idx\` ON \`_listings_v_version_modality_tags\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_listings_v_version_modality_tags_parent_idx\` ON \`_listings_v_version_modality_tags\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_listings_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_name\` text,
  	\`version_slug\` text,
  	\`version_city_id\` integer,
  	\`version_neighborhood\` text,
  	\`version_modality_description\` text,
  	\`version_duration\` text,
  	\`version_price\` text,
  	\`version_booking_url\` text,
  	\`version_practitioner_bio\` text,
  	\`version_session_description\` text,
  	\`version_photo_id\` integer,
  	\`version_sourcing_notes\` text,
  	\`version_source\` text,
  	\`version_listing_status\` text DEFAULT 'needs-verification',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`listings\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_city_id\`) REFERENCES \`cities\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_listings_v_parent_idx\` ON \`_listings_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_listings_v_version_version_slug_idx\` ON \`_listings_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_listings_v_version_version_city_idx\` ON \`_listings_v\` (\`version_city_id\`);`)
  await db.run(sql`CREATE INDEX \`_listings_v_version_version_photo_idx\` ON \`_listings_v\` (\`version_photo_id\`);`)
  await db.run(sql`CREATE INDEX \`_listings_v_version_version_updated_at_idx\` ON \`_listings_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_listings_v_version_version_created_at_idx\` ON \`_listings_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_listings_v_version_version__status_idx\` ON \`_listings_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_listings_v_created_at_idx\` ON \`_listings_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_listings_v_updated_at_idx\` ON \`_listings_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_listings_v_latest_idx\` ON \`_listings_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`cities_id\` integer REFERENCES cities(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`listings_id\` integer REFERENCES listings(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_cities_id_idx\` ON \`payload_locked_documents_rels\` (\`cities_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_listings_id_idx\` ON \`payload_locked_documents_rels\` (\`listings_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`cities_formats\`;`)
  await db.run(sql`DROP TABLE \`cities_venues\`;`)
  await db.run(sql`DROP TABLE \`cities\`;`)
  await db.run(sql`DROP TABLE \`_cities_v_version_formats\`;`)
  await db.run(sql`DROP TABLE \`_cities_v_version_venues\`;`)
  await db.run(sql`DROP TABLE \`_cities_v\`;`)
  await db.run(sql`DROP TABLE \`listings_modality_tags\`;`)
  await db.run(sql`DROP TABLE \`listings\`;`)
  await db.run(sql`DROP TABLE \`_listings_v_version_modality_tags\`;`)
  await db.run(sql`DROP TABLE \`_listings_v\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
}
