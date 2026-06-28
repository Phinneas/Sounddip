// Client-bundle-only stub for `payload/internal`.
//
// payload/internal is a single-file re-export barrel (getSafeFileName,
// parseRangeHeader, getEntityPermissions, sanitizePermissions). Importing
// even just one of those names still forces webpack to resolve the whole
// file, which transitively pulls in undici, file-type, telemetry, and
// Node-core-touching dependency-resolution helpers — none of which can
// bundle for a browser target, none of which are tree-shakeable away
// because they're plain re-exports rather than per-export submodules.
//
// All four of these are genuinely server-only (DB lookups, filesystem
// access, Node permission checks). The only client code that pulls this in
// is @payloadcms/storage-r2's R2ClientUploadHandler via resolveSignedURLKey,
// which only runs when clientUploads is enabled on the plugin config — it
// is explicitly disabled in payload.config.ts, so this import path is dead
// code at runtime. Real no-op implementations (not `false`) so any
// non-call usage, like a typeof check, still behaves like a function.
export async function getSafeFileName(args) {
  throw new Error('getSafeFileName is server-only and was stubbed out of the client bundle')
}

export function parseRangeHeader(..._args) {
  throw new Error('parseRangeHeader is server-only and was stubbed out of the client bundle')
}

export async function getEntityPermissions(_args) {
  throw new Error('getEntityPermissions is server-only and was stubbed out of the client bundle')
}

export function sanitizePermissions(..._args) {
  throw new Error('sanitizePermissions is server-only and was stubbed out of the client bundle')
}
