// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

// User/organization GitHub Pages site (omeralon.github.io) — served from the repo root,
// so no `base` path. trailingSlash keeps generated URLs matching the legacy
// `/Portfolio/queen-of-bathtub/`-style paths we must preserve.
// https://astro.build/config
export default defineConfig({
  site: 'https://omeralon.github.io',
  trailingSlash: 'always',
  integrations: [mdx()],
});