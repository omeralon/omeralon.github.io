import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			summary: z.string().optional(),
			role: z.string().optional(),
			tools: z.array(z.string()).default([]),
			tags: z.array(z.string()).default([]),
			year: z.number().optional(),
			cover: image().optional(),
			// 'media': photo/screenshot, shown as a full-width hero row on the
			// homepage. 'logomark': logo on its own background card, shown in a
			// compact multi-up row grouped with adjacent logomark projects.
			cardType: z.enum(['media', 'logomark']).default('media'),
			// Background color behind a logomark card — its own layer from the
			// logo image, so the two can animate independently on hover.
			bg: z.string().optional(),
			// If set, the card's background transitions to this color on hover
			// instead of the default darken-via-filter.
			bg2: z.string().optional(),
			// Explicit display order on the homepage grid; lower shows first.
			order: z.number().default(100),
			draft: z.boolean().default(false),
			// Excluded from the homepage listing, but the page itself still
			// builds and is reachable directly — content stays intact.
			hidden: z.boolean().default(false),
			// Shown as a credits line in the page footer. The rest of the project
			// page is the file's own body content (.md or .mdx) — free-form per
			// project, using the shared components in src/components/media/.
			credits: z.array(z.string()).default([]),
		}),
});

export const collections = { work };
