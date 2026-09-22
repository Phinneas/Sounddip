import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { remarkNapkin } from './src/plugins/remark-napkin.mjs';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://sounddip.com',
  server: { port: 4322 },
  trailingSlash: 'always',
  integrations: [mdx()],

  markdown: {
    remarkPlugins: [remarkNapkin],
  },

  output: "hybrid",
  adapter: cloudflare()
});