import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  // Packages with Cloudflare Workers (workerd) specific code
  // Read more: https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: ['jose', 'pg-cloudflare', 'pino', 'pino-pretty', 'pino-abstract-transport'],

  // Your Next.js config here
  webpack: (webpackConfig: any, { isServer }: any) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // The R2 storage plugin's client upload handler (R2ClientUploadHandler)
    // imports `getSafeFileName` from `payload/internal` via
    // @payloadcms/plugin-cloud-storage's resolveSignedURLKey utility.
    // `payload/internal` is a single-file barrel (getSafeFileName,
    // parseRangeHeader, getEntityPermissions, sanitizePermissions) — naming
    // just one export still forces webpack to resolve the whole file, which
    // transitively pulls in undici, file-type, telemetry, and Node-core
    // dependency-resolution helpers, none of which can bundle for a browser
    // target and none of which are tree-shakeable away since they're plain
    // re-exports rather than per-export submodules.
    //
    // All four exports are genuinely server-only (DB lookups, filesystem
    // access, Node permission checks) — getSafeFileName specifically needs a
    // PayloadRequest to check for filename conflicts. The only caller of any
    // of this client-side is the upload handler above, and only when
    // clientUploads is enabled on the storage plugin; it's explicitly set to
    // false in payload.config.ts, so this whole import path is dead code at
    // runtime in the browser. Alias it to a small local stub (not `false`,
    // so any non-call usage like a typeof check still sees real functions)
    // rather than chase each transitive Node-builtin/package mismatch as it
    // surfaces — every one of them traced back to this same barrel.
    if (!isServer) {
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'payload/internal': path.resolve(dirname, 'src/stubs/payload-internal-client-stub.js'),
      }
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
