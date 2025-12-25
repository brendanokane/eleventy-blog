import {
	IdAttributePlugin,
	InputPathToUrlTransformPlugin,
	HtmlBasePlugin,
} from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import MarkdownIt from "markdown-it";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

import pluginFilters from "./_config/filters.js";
import blueskyComments from "./_config/bluesky-comments.js";

const md = new MarkdownIt();

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	// Drafts, see also _data/eleventyDataSchema.js
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if (data.draft) {
			data.title = `${data.title} (draft)`;
		}

		if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
			return false;
		}
	});

	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig
		.addPassthroughCopy({
			"./public/": "/",
		})
		// Note: Post assets are copied via eleventy.after event below to achieve blog-less URLs
		.addPassthroughCopy("./content/feed/pretty-atom-feed.xsl");

	// Copy post assets directly to _site/<slug>/assets/ (blog-less URLs)
	// This avoids cluttering content/ with mirrored directories
	eleventyConfig.on(
		"eleventy.after",
		async ({ dir, results, runMode, outputMode }) => {
			const fs = await import("node:fs/promises");
			const path = await import("node:path");

			const contentDir = path.join(dir.input, "blog");

			try {
				const posts = await fs.readdir(contentDir, { withFileTypes: true });

				for (const post of posts) {
					if (!post.isDirectory()) continue;

					const slug = post.name;
					const sourceAssets = path.join(contentDir, slug, "assets");
					const destAssets = path.join(dir.output, slug, "assets");

					// Check if source assets directory exists
					try {
						await fs.access(sourceAssets);
					} catch {
						continue; // No assets for this post
					}

					// Copy assets recursively
					await fs.cp(sourceAssets, destAssets, { recursive: true });
				}
			} catch (err) {
				console.warn("Warning: Could not copy post assets:", err.message);
			}
		},
	);

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch CSS files
	eleventyConfig.addWatchTarget("css/**/*.css");
	// Watch images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");

	// Per-page bundles, see https://github.com/11ty/eleventy-plugin-bundle
	// Bundle <style> content and adds a {% css %} paired shortcode
	eleventyConfig.addBundle("css", {
		toFileDirectory: "dist",
		// Add all <style> content to `css` bundle (use <style eleventy:ignore> to opt-out)
		// Supported selectors: https://www.npmjs.com/package/posthtml-match-helper
		bundleHtmlContentFromSelector: "style",
	});

	// Bundle <script> content and adds a {% js %} paired shortcode
	eleventyConfig.addBundle("js", {
		toFileDirectory: "dist",
		// Add all <script> content to the `js` bundle (use <script eleventy:ignore> to opt-out)
		// Supported selectors: https://www.npmjs.com/package/posthtml-match-helper
		bundleHtmlContentFromSelector: "script",
	});

	// Official plugins
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 },
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/feed/plugin.xml",
		stylesheet: "pretty-atom-feed.xsl",
		templateData: {
			eleventyNavigation: {
				key: "Feed",
				order: 4,
			},
		},
		collection: {
			name: "posts",
			limit: 10,
		},
		metadata: {
			language: "en",
			title: "Burning House",
			subtitle:
				"Essays, notes, and translations—typography-forward writing with margin notes and woodblock-inspired design.",
			base: "https://burninghou.se/",
			author: {
				name: "Bo Kane",
			},
		},
	});

	// Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// Output formats for each image.
		formats: ["avif", "webp", "auto"],

		// widths: ["auto"],

		failOnError: false,
		htmlOptions: {
			imgAttributes: {
				// e.g. <img loading decoding> assigned on the HTML tag will override these values.
				loading: "lazy",
				decoding: "async",
			},
		},

		sharpOptions: {
			animated: true,
		},
	});

	// Filters
	eleventyConfig.addPlugin(pluginFilters);

	// Bluesky comments integration (async filter)
	eleventyConfig.addAsyncFilter(
		"getBlueskyComments",
		blueskyComments.getBlueskyComments,
	);
	eleventyConfig.addAsyncFilter(
		"getCommentCount",
		blueskyComments.getCommentCount,
	);

	eleventyConfig.addPlugin(IdAttributePlugin, {
		// by default we use Eleventy’s built-in `slugify` filter:
		// slugify: eleventyConfig.getFilter("slugify"),
		// selector: "h1,h2,h3,h4,h5,h6", // default
	});

	// ... (Your existing code up to the custom shortcode block)

	// Create a new instance of the Markdown parser outside the config function
	const md = new MarkdownIt();

	// ----------------------------------------------------------------------
	// --- START CUSTOM SHORTCODES (Final, Synchronous External Solution) ---
	// ----------------------------------------------------------------------

	// Margin Note: {% mn "Anchor Text" %} Note Content {% endmn %}
	// NOTE: This function is SYNCHRONOUS, as we use an external parser.
	eleventyConfig.addPairedShortcode("mn", function (content, anchor) {
		// 1. Render the content (which is Markdown) to HTML synchronously
		const renderedContent = md.render(content);

		// 2. STRIP THE OUTER <p> TAGS: Markdown-it adds these, which break the inline flow.
		let cleanedContent = renderedContent.trim();
		if (cleanedContent.startsWith("<p>")) {
			// Remove leading <p> and trailing </p>\n
			cleanedContent = cleanedContent
				.slice(3, cleanedContent.length - 5)
				.trim();
		}

		// 3. Return the HTML on one line for perfect flow
		return `<span class="mn-wrapper"><span class="mn-anchor">${anchor}</span><span class="mn-content">${cleanedContent}</span></span>`;
	});

	// Simple Footnote: {% fn %} Note Content {% endfn %}
	eleventyConfig.addPairedShortcode("fn", function (content) {
		return `<sup class="fn-marker" title="${content}">[ref]</sup>`;
	});

	// ----------------------------------------------------------------------
	// --- END CUSTOM SHORTCODES ---
	// ----------------------------------------------------------------------

	// ... (Rest of your existing code)

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return new Date().toISOString();
	});

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

	// Ensure the async function returns the config object
	return {};
}

export const config = {
	// Control which files Eleventy will process
	// e.g.: *.md, *.njk, *.html, *.liquid
	templateFormats: ["md", "njk", "html", "liquid", "11ty.js"],

	// Pre-process *.md files with: (default: `liquid`)
	markdownTemplateEngine: "njk",

	// Pre-process *.html files with: (default: `liquid`)
	htmlTemplateEngine: "njk",

	// These are all optional:
	dir: {
		input: "content", // default: "."
		includes: "../_includes", // default: "_includes" (`input` relative)
		data: "../_data", // default: "_data" (`input` relative)
		output: "_site",
	},

	// -----------------------------------------------------------------
	// Optional items:
	// -----------------------------------------------------------------

	// If your site deploys to a subdirectory, change `pathPrefix`.
	// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

	// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
	// it will transform any absolute URLs in your HTML to include this
	// folder name and does **not** affect where things go in the output folder.

	// pathPrefix: "/",
};
