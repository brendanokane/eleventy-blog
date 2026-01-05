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
import * as fs from "node:fs";
import * as path from "node:path";
import yaml from "js-yaml";

import pluginFilters from "./_config/filters.js";
import blueskyComments from "./_config/bluesky-comments.js";

const md = new MarkdownIt({
	html: true, // Enable HTML tags in source
	breaks: true, // Convert \n in paragraphs into <br> for poetry
});

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	// Drafts, see also _data/eleventyDataSchema.js
	// TEMPORARILY COMMENTED OUT FOR TESTING - SHOW ALL POSTS
	// eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
	// 	if (data.draft) {
	// 		data.title = `${data.title} (draft)`;
	// 	}

	// 	if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
	// 		return false;
	// 	}
	// });

	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig
		.addPassthroughCopy({
			"./public/": "/",
		})
		// Serve the real production CSS for the design playground
		// (The default /css/index.css is a different file from the old Eleventy starter)
		.addPassthroughCopy({
			"./css/index.css": "/css/production.css",
		})
		// Decap CMS config (must be copied as-is, not processed)
		.addPassthroughCopy("./content/admin/config.yml")
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
	// Disabled - HtmlBasePlugin prepends 'content/' to absolute URLs like /mid-autumn.../assets/...
	// This breaks our blog-less asset URLs which need to be at the root
	// eleventyConfig.addPlugin(HtmlBasePlugin);
	// Disabled - interfering with post_image paths
	// eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

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
	// Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
	// NOTE: This plugin was interfering with blog-less asset URLs (prepending 'content/')
	// We exclude homepage hero images using extensions to avoid path transformation issues
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// Output formats for each image.
		formats: ["avif", "webp", "auto"],

		// widths: ["auto"],

		failOnError: false,

		// Exclude images with these extensions/patterns to avoid path issues
		extensions: "jpg,jpeg,png,gif,webp,avif",

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

		// Custom URL path function to preserve blog-less URLs
		urlPath: "/img/",
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

	// ----------------------------------------------------------------------
	// --- MARGIN NOTE SHORTCODE ---
	// ----------------------------------------------------------------------
	//
	// Usage:
	//   {% mn %}Note content here.{% endmn %}
	//   {% mn "anchor text" %}Note about that phrase.{% endmn %}
	//
	// Output (no anchor):
	//   <span class="mn-ref">
	//     <sup class="mn-marker">※</sup>
	//     <span class="mn-note">Note content</span>
	//   </span>
	//
	// Output (with anchor):
	//   <span class="mn-ref">
	//     <span class="mn-anchor">anchor text</span>
	//     <span class="mn-note">Note about that phrase.</span>
	//   </span>
	//
	// The note is a sibling inside a wrapper so CSS can position it.
	// Mobile: note is hidden, toggles on click
	// Desktop: note appears in margin column, aligned via JS

	// Use a Map to track counters per page during build
	// This ensures each page gets its own counter starting at 0
	const pageCounters = new Map();

	function getPageCounter(page) {
		const key = page?.inputPath || "unknown";
		if (!pageCounters.has(key)) {
			pageCounters.set(key, { mn: 0, fig: 0 });
		}
		return pageCounters.get(key);
	}

	eleventyConfig.on("eleventy.before", () => {
		pageCounters.clear();
	});

	// Figure shortcode with Tufte-style margin captions
	// Usage:
	//   {% figure "image.jpg", "alt text" %}Caption with *markdown*{% endfigure %}
	//   {% figure "image.jpg", "alt text", "center" %}Centered caption{% endfigure %}
	eleventyConfig.addPairedShortcode(
		"figure",
		function (caption, src, alt, style) {
			const counters = getPageCounter(this.page);
			counters.fig++;
			const figId = `fig-${counters.fig}`;
			const isCentered = style === "center";

			// Render caption markdown to HTML
			const renderedCaption = md.render(caption.trim());

			// Strip wrapping <p> tags for single-paragraph captions
			let captionHtml = renderedCaption.trim();
			const singleParagraphMatch = captionHtml.match(/^<p>([\s\S]*)<\/p>$/);
			if (singleParagraphMatch && !singleParagraphMatch[1].includes("<p>")) {
				captionHtml = singleParagraphMatch[1];
			}

			if (isCentered) {
				// Centered caption below image
				return `<figure class="fig-centered" id="${figId}">
<img src="${src}" alt="${alt || ""}">
<figcaption>${captionHtml}</figcaption>
</figure>`;
			} else {
				// Margin caption (Tufte-style) - caption in right margin
				return `<figure class="fig-margin" id="${figId}">
<img src="${src}" alt="${alt || ""}">
<figcaption class="fig-caption-margin">${captionHtml}</figcaption>
</figure>`;
			}
		},
	);

	eleventyConfig.addPairedShortcode("mn", function (content, anchor) {
		const counters = getPageCounter(this.page);
		counters.mn++;
		const noteId = `mn-${counters.mn}`;

		// Render markdown content to HTML
		const renderedContent = md.render(content.trim());

		// Strip wrapping <p> tags for single-paragraph notes since we're inside an inline <span>
		// Block elements inside inline elements is invalid HTML and breaks layout
		let noteHtml = renderedContent.trim();
		// Check if it's a single paragraph (starts with <p> and ends with </p> with no other <p> tags)
		const singleParagraphMatch = noteHtml.match(/^<p>([\s\S]*)<\/p>$/);
		if (singleParagraphMatch && !singleParagraphMatch[1].includes("<p>")) {
			noteHtml = singleParagraphMatch[1];
		}

		if (anchor) {
			// Anchor version: dotted underline on anchor text + superscripted numeral after
			return `<span class="mn-ref" data-mn-id="${noteId}"><span class="mn-anchor" role="button" tabindex="0" aria-expanded="false" aria-controls="${noteId}">${anchor}</span><sup class="mn-anchor-num">${counters.mn}</sup><span class="mn-note" id="${noteId}" role="note"><span class="mn-note-number" aria-hidden="true">${counters.mn}.</span> ${noteHtml}</span></span>`;
		} else {
			// Marker version: numbered superscript marker only
			return `<span class="mn-ref" data-mn-id="${noteId}"><sup class="mn-marker" role="button" tabindex="0" aria-expanded="false" aria-controls="${noteId}">${counters.mn}</sup><span class="mn-note" id="${noteId}" role="note"><span class="mn-note-number" aria-hidden="true">${counters.mn}.</span> ${noteHtml}</span></span>`;
		}
	});

	// Footnote shortcode - shares counter with margin notes for consistent numbering
	// Usage:
	//   {% fn %}Long note content that's too large for margin{% endfn %}
	//   {% fn "anchor text" %}Long note content{% endfn %}
	// Output: Creates a superscript reference in text, note stored in page data for template to render
	eleventyConfig.addPairedShortcode("fn", function (content, anchor) {
		const counters = getPageCounter(this.page);
		counters.mn++; // Share counter with margin notes
		const noteNum = counters.mn;
		const noteId = `fn-${noteNum}`;
		const refId = `fnref-${noteNum}`;

		// Render markdown content to HTML
		const renderedContent = md.render(content.trim());
		const noteHtml = renderedContent.trim();

		// Store footnote in page data for the template to collect
		// This avoids the problem of markdown breaking embedded HTML
		if (!this.page._footnotes) {
			this.page._footnotes = [];
		}
		this.page._footnotes.push({
			num: noteNum,
			id: noteId,
			refId: refId,
			content: noteHtml,
		});

		if (anchor) {
			// Anchor version: dotted underline on anchor text + superscripted numeral after
			return `<span class="fn-ref" data-fn-id="${noteId}"><a href="#${noteId}" id="${refId}" class="fn-anchor">${anchor}</a><sup class="fn-anchor-num"><a href="#${noteId}">${noteNum}</a></sup></span>`;
		} else {
			// Marker version: numbered superscript marker only
			return `<sup class="fn-ref" data-fn-id="${noteId}"><a href="#${noteId}" id="${refId}" class="fn-marker">${noteNum}</a></sup>`;
		}
	});

	// ----------------------------------------------------------------------
	// --- POEM SHORTCODE ---
	// ----------------------------------------------------------------------
	//
	// Usage:
	//   {% poem "drinking_alone" %}
	//
	// Looks for poem data in two places (in order):
	//   1. Post frontmatter: poems array with matching id
	//   2. External file: content/poems/{id}.yaml or content/poems/{id}.md
	//
	// Data structure (frontmatter or YAML file):
	//   poems:
	//     - id: drinking_alone
	//       poet:
	//         en: "Li Bai"
	//         zh: "李白"
	//       title:
	//         en: "Drinking Alone by Moonlight"
	//         zh: "月下獨酌"
	//       text:
	//         en: |
	//           From a pot of wine among the flowers
	//           I drink alone...
	//         zh: |
	//           花間一壺酒，
	//           獨酌無相親...
	//
	// Output: Structured HTML with poem-container, poem-header, poem-body

	eleventyConfig.addShortcode("poem", function (poemId) {
		let poemData = null;

		// 1. Look in frontmatter first
		if (this.ctx && this.ctx.poems && Array.isArray(this.ctx.poems)) {
			poemData = this.ctx.poems.find((p) => p.id === poemId);
		}

		// 2. Fallback to external file
		if (!poemData) {
			const poemsDir = path.join(process.cwd(), "content", "poems");

			// Try YAML first
			const yamlPath = path.join(poemsDir, `${poemId}.yaml`);
			const ymlPath = path.join(poemsDir, `${poemId}.yml`);
			const mdPath = path.join(poemsDir, `${poemId}.md`);

			try {
				if (fs.existsSync(yamlPath)) {
					const content = fs.readFileSync(yamlPath, "utf-8");
					poemData = yaml.load(content);
				} else if (fs.existsSync(ymlPath)) {
					const content = fs.readFileSync(ymlPath, "utf-8");
					poemData = yaml.load(content);
				} else if (fs.existsSync(mdPath)) {
					// For .md files, parse YAML frontmatter
					const content = fs.readFileSync(mdPath, "utf-8");
					const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
					if (fmMatch) {
						poemData = yaml.load(fmMatch[1]);
					}
				}
			} catch (err) {
				console.warn(`Warning: Error loading poem "${poemId}":`, err.message);
			}
		}

		// 3. If not found, return error message
		if (!poemData) {
			return `<div class="poem-error" style="color: var(--vermillion); padding: 1em; border: 2px dashed var(--vermillion); margin: 1em 0;">
				<strong>⚠️ Poem not found:</strong> <code>${poemId}</code>
				<br><small>Check frontmatter or content/poems/${poemId}.yaml</small>
			</div>`;
		}

		// 4. Render the poem
		const titleEn = poemData.title?.en || "";
		const titleZh = poemData.title?.zh || "";
		const poetEn = poemData.poet?.en || "";
		const poetZh = poemData.poet?.zh || "";
		const textEn = poemData.text?.en || "";
		const textZh = poemData.text?.zh || "";

		// Process text: convert line breaks to <br> for display
		const formatPoemText = (text) => {
			if (!text) return "";
			return text
				.trim()
				.split("\n")
				.map((line) => line.trim())
				.join("<br>\n");
		};

		const textEnHtml = formatPoemText(textEn);
		const textZhHtml = formatPoemText(textZh);

		// Build header - only include elements that exist
		let headerHtml = '<div class="poem-header">';
		if (titleZh)
			headerHtml += `<h3 class="poem-title-zh" lang="zh">${titleZh}</h3>`;
		if (poetZh) headerHtml += `<p class="poem-poet-zh" lang="zh">${poetZh}</p>`;
		if (titleEn) headerHtml += `<h4 class="poem-title-en">${titleEn}</h4>`;
		if (poetEn) headerHtml += `<p class="poem-poet-en">${poetEn}</p>`;
		headerHtml += "</div>";

		// Build body
		let bodyHtml = '<div class="poem-body">';
		if (textZhHtml)
			bodyHtml += `<div class="poem-text-zh" lang="zh">${textZhHtml}</div>`;
		if (textEnHtml) bodyHtml += `<div class="poem-text-en">${textEnHtml}</div>`;
		bodyHtml += "</div>";

		return `<div class="poem-container" data-poem-id="${poemId}">
${headerHtml}
${bodyHtml}
</div>`;
	});

	// ----------------------------------------------------------------------
	// --- END SHORTCODES ---
	// ----------------------------------------------------------------------

	// ... (Rest of your existing code)

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return new Date().toISOString();
	});

	// Set the markdown library to use our configured instance with breaks enabled
	eleventyConfig.setLibrary("md", md);

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
