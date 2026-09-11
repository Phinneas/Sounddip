import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260628_173207 from './20260628_173207';
import * as migration_20260824_210051_add_geo_fields from './20260824_210051_add_geo_fields';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260628_173207.up,
    down: migration_20260628_173207.down,
    name: '20260628_173207',
  },
  {
    up: migration_20260824_210051_add_geo_fields.up,
    down: migration_20260824_210051_add_geo_fields.down,
    name: '20260824_210051_add_geo_fields'
  },
];
