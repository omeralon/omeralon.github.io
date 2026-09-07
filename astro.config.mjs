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
  // Preserving the two legacy links called out as critical in the redesign
  // plan (linked externally — LinkedIn, CV, etc). Astro emits these as
  // static meta-refresh + canonical-link pages, which works on GitHub Pages
  // without any server-side redirect support.
  redirects: {
    '/Portfolio': '/',
    '/Portfolio/queen-of-bathtub': '/work/queen-of-bathtub/',
  },
});