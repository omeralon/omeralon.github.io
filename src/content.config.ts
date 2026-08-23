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
			// 'media': photo/screenshot fills a rounded card. 'logomark': the logo sits
			// directly on the page background with no card container (branding projects).
			cardType: z.enum(['media', 'logomark']).default('media'),
			// Explicit display order on the homepage grid; lower shows first.
			order: z.number().default(100),
			draft: z.boolean().default(false),
			// Shown as a credits line in the page footer. The rest of the project
			// page is the file's own body content (.md or .mdx) — free-form per
			// project, using the shared components in src/components/media/.
			credits: z.array(z.string()).default([]),
		}),
});

export const collections = { work };
