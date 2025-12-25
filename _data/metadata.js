// Global site metadata used across layouts, feeds, and SEO/OG tags.
// Keep this file free of per-post data; use frontmatter for overrides.

export default {
	// Core identity
	title: "Burning House",
	shortTitle: "Burning House",
	tagline: "Essays, notes, and translations",
	language: "en",
	locale: "en_US",

	// Canonical site URL (no trailing slash). IMPORTANT: set this to your real domain.
	// Used for absolute URLs in feeds, canonical links, and OG tags.
	url: "https://burninghou.se",

	// Defaults used when a page/post does not provide overrides
	description:
		"Essays, notes, and translations—typography-forward writing with margin notes and woodblock-inspired design.",

	author: {
		name: "Bo Kane",
		email: "", // optional; leave blank if you don’t want it published
		url: "/about/",
	},

	// Social profiles/usernames (optional)
	social: {
		bluesky: "burninghou.se", // Bluesky handle
		mastodon: "", // e.g. "https://mastodon.social/@handle"
		twitter: "", // e.g. "@handle" (only if you still want Twitter cards)
		github: "", // e.g. "bokane"
	},

	// OpenGraph / Twitter defaults (can be overridden per-page via frontmatter)
	// These are defaults only; the layout should compute page-specific values.
	og: {
		siteName: "Burning House",
		type: "website",
		defaultImage: "/assets/og/default.jpg", // Tao Yuanming calligraphy image
		imageAlt: "Burning House",
	},

	twitter: {
		// Use "summary_large_image" when an image is available; fall back to "summary".
		card: "summary_large_image",
		site: "", // e.g. "@handle"
		creator: "", // e.g. "@handle"
	},

	// SEO defaults
	seo: {
		robots: "index,follow",
		// If you want email variants not indexed, the layout can override this per-template.
	},
};
