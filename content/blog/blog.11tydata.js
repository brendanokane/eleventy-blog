// Computed data for all blog posts
// These values are computed at build time and can be overridden by frontmatter

import path from "node:path";
import { fileURLToPath } from "node:url";
import Image from "@11ty/eleventy-img";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const THUMB_WIDTH = 160;
const THUMB_OUTPUT_DIR = path.join(PROJECT_ROOT, "_site", "img", "thumbs");
const THUMB_URL_PATH = "/img/thumbs/";

function isFullUrl(value) {
	try {
		new URL(value);
		return true;
	} catch {
		return false;
	}
}

function resolveLocalPostImage(src) {
	const cleaned = src.split("?")[0].replace(/^\/+/, "");
	const parts = cleaned.split("/assets/");
	if (parts.length < 2) {
		return path.join(PROJECT_ROOT, "content", cleaned);
	}
	const slug = parts.shift();
	const assetPath = parts.join("/assets/");
	return path.join(PROJECT_ROOT, "content", "blog", slug, "assets", assetPath);
}

async function buildThumb(src) {
	if (!src || typeof src !== "string") return "";
	if (isFullUrl(src)) return src;

	const inputPath = resolveLocalPostImage(src);

	try {
		const metadata = await Image(inputPath, {
			widths: [THUMB_WIDTH],
			formats: ["jpeg"],
			outputDir: THUMB_OUTPUT_DIR,
			urlPath: THUMB_URL_PATH,
		});

		return metadata.jpeg?.[0]?.url || src;
	} catch (error) {
		console.warn(`Warning: thumbnail build failed for ${src}:`, error.message);
		return src;
	}
}

export default {
	tags: ["posts"],
	layout: "layouts/post-woodblock.njk",
	permalink: "/{{ page.fileSlug }}/",
	eleventyComputed: {
		// Compute summary from subtitle or content if not provided
		// Used for SEO meta description, social cards, and search results
		summary: (data) => {
			if (data.summary) return data.summary;
			if (data.og_description) return data.og_description;
			if (data.subtitle) return data.subtitle;
			if (data.description) return data.description;
			return data.title || "";
		},

		// Compute excerpt for archive listings and internal search
		// Longer than summary (200-400 chars)
		excerpt: (data) => {
			if (data.excerpt) return data.excerpt;
			if (data.summary) return data.summary;

			const content = data.page?.rawInput || data.content || "";
			const text = content
				.replace(/<[^>]*>/g, "")
				.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
				.replace(/[#*_`]/g, "")
				.trim()
				.substring(0, 300);

			return text ? text + "..." : "";
		},

		// Compute OpenGraph image path
		// Priority: og_image > post_image > first image in content > site default
		ogImage: (data) => {
			// Explicit override
			if (data.og_image) return data.og_image;

			// Post featured image
			if (data.post_image) return data.post_image;

			// Try to extract first image from content
			// Look for both markdown and HTML images
			const content = data.page?.rawInput || data.content || "";
			const mdImageMatch = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
			if (mdImageMatch) return mdImageMatch[1];

			const htmlImageMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
			if (htmlImageMatch) return htmlImageMatch[1];

			// Fall back to site default
			return data.metadata?.og?.defaultImage || "/assets/og/default.jpg";
		},

		// Compute OpenGraph description
		ogDescription: (data) => {
			if (data.og_description) return data.og_description;
			return data.summary || data.title;
		},

		// Compute OpenGraph title (defaults to post title)
		ogTitle: (data) => {
			if (data.og_title) return data.og_title;
			// Truncate if too long for social cards (>60 chars)
			const title = data.title || "";
			return title.length > 60 ? title.substring(0, 57) + "..." : title;
		},

		// Compute full canonical URL
		canonicalUrl: (data) => {
			const baseUrl = data.metadata?.url || "https://burninghou.se";
			const pageUrl = data.page?.url || "/";
			return baseUrl + pageUrl;
		},

		// Compute web version URL (for email variants)
		webUrl: (data) => {
			if (data.webUrl) return data.webUrl;
			const pageUrl = data.page?.url || "/";
			// If this is an email variant (/emails/slug/), compute web URL
			if (pageUrl.startsWith("/emails/")) {
				return pageUrl.replace("/emails/", "/");
			}
			return pageUrl;
		},

		// Content type defaults to 'post'
		contentType: (data) => data.content_type || "post",

		// OpenGraph type defaults to 'article' for posts
		ogType: (data) => {
			if (data.og_type) return data.og_type;
			if (data.content_type === "translation") return "article";
			if (data.content_type === "page") return "website";
			return "article";
		},

		// Compute alt text for post image if not provided
		postImageAlt: (data) => {
			if (data.post_image_alt) return data.post_image_alt;
			if (data.post_image) {
				// Default to title if image is set but no alt text
				console.warn(
					`Warning: post_image set but no post_image_alt for "${data.title}"`,
				);
				return data.title;
			}
			return "";
		},

		// Compute a small thumbnail for header search suggestions
		post_image_thumb: async (data) => {
			if (data.post_image_thumb) return data.post_image_thumb;
			if (!data.post_image) return "";
			return buildThumb(data.post_image);
		},

		// Compute Bluesky handle (defaults to site default)
		blueskyHandle: (data) => {
			if (data.bluesky_handle) return data.bluesky_handle;
			return data.metadata?.social?.bluesky || "burninghou.se";
		},
	},
};
