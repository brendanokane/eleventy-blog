import { defineCollection, z } from "astro:content";

const blog = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		subtitle: z.string().optional(),
		date: z.date(),
		description: z.string().optional(),
		og_description: z.string().optional(),
		social_description: z.string().optional(),
		post_image: z.string().optional(),
		post_image_alt: z.string().optional(),
		og_image: z.string().optional(),
		og_image_alt: z.string().optional(),
		tags: z.array(z.string()).optional(),
		bluesky_thread: z.string().nullable().optional(),
		draft: z.boolean().nullable().optional(),
		publish: z.boolean().nullable().optional(),
		buttondown_sent: z.boolean().nullable().optional(),
	}),
});

const poems = defineCollection({
	type: "data",
	schema: z.object({
		id: z.string(),
		poet: z
			.object({
				en: z.string().optional(),
				zh: z.string().optional(),
				dates: z.string().optional(),
			})
			.optional(),
		title: z
			.object({
				en: z.string().optional(),
				zh: z.string().optional(),
			})
			.optional(),
		text: z
			.object({
				en: z.string().optional(),
				zh: z.string().optional(),
			})
			.optional(),
	}),
});

export const collections = { blog, poems };
