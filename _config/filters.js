// Centralized Nunjucks/Eleventy filters.
//
// Note on date handling:
// Eleventy often provides plain JS `Date` instances (e.g. `page.date`, collection item dates).
// Some starter templates assume Luxon `DateTime` (with `.toFormat()` / `.setZone()`), which
// causes runtime errors when a plain `Date` is passed.
//
// These helpers make filters tolerant: accept either Luxon DateTime or JS Date (or a parseable
// string/number) without crashing.

function toJsDate(value) {
	if (!value) return null;
	if (value instanceof Date) return value;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d;
}

export default function (eleventyConfig) {
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Prefer Luxon DateTime if provided.
		if (
			dateObj &&
			typeof dateObj.setZone === "function" &&
			typeof dateObj.toFormat === "function"
		) {
			return dateObj.setZone(zone).toFormat(format);
		}

		// Fall back to JS Date formatting.
		const d = toJsDate(dateObj);
		if (!d) return "";

		// Use Intl.DateTimeFormat for a reasonable default when Luxon isn't available.
		// This won't match Luxon's tokens exactly; it's intended as a safe fallback.
		try {
			return new Intl.DateTimeFormat(undefined, {
				year: "numeric",
				month: "long",
				day: "numeric",
				timeZone: zone || "UTC",
			}).format(d);
		} catch {
			return d.toISOString().slice(0, 10);
		}
	});

	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
		// ISO string without time, used for HTML validity.
		if (dateObj && typeof dateObj.toISODate === "function") {
			return dateObj.toISODate();
		}
		const d = toJsDate(dateObj);
		return d ? d.toISOString().slice(0, 10) : "";
	});

	eleventyConfig.addFilter("dateToRfc3339", (dateObj) => {
		// Timestamp used in Atom feed.
		if (dateObj && typeof dateObj.toFormat === "function") {
			return dateObj.toFormat("yyyy-LL-dd'T'HH:mm:ss.SSS'Z'");
		}
		const d = toJsDate(dateObj);
		return d ? d.toISOString() : "";
	});

	eleventyConfig.addFilter("getNewestCollectionItemDate", (collection) => {
		if (!collection || !collection.length) {
			return new Date();
		}

		return collection
			.map((item) => item.date)
			.reduce((a, b) => (a > b ? a : b));
	});

	eleventyConfig.addFilter("head", (array, n) => {
		return array.slice(0, n);
	});

	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	eleventyConfig.addFilter("getKeys", (target) => {
		return Object.keys(target);
	});

	eleventyConfig.addFilter("safeJson", (value) => {
		const json = JSON.stringify(value === undefined ? null : value);
		return json.replace(/</g, "\\u003c");
	});

	eleventyConfig.addFilter("stripLeadingH1", (html) => {
		if (!html || typeof html !== "string") return html;
		const trimmed = html.trimStart();
		if (!trimmed.startsWith("<h1")) return html;
		return trimmed.replace(/^<h1[^>]*>[\s\S]*?<\/h1>\s*/i, "");
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(
			(tag) => ["all", "nav", "post", "posts"].indexOf(tag) === -1,
		);
	});

	eleventyConfig.addFilter("sortAlphabetically", (strings) =>
		(strings || []).sort((a, b) => a.localeCompare(b)),
	);

	eleventyConfig.addFilter("getAllTags", (collection) => {
		let tagSet = new Set();
		for (let item of collection) {
			(item.data.tags || []).forEach((tag) => tagSet.add(tag));
		}
		return Array.from(tagSet);
	});

	// Email-friendly transform for margin notes.
	//
	// Converts margin note HTML into numbered endnotes suitable for email and RSS feed output.
	// Handles multiple patterns:
	// 1. New shortcode: <span class="mn-ref">...<span class="mn-note">...</span></span>
	// 2. Legacy Substack: <sup class="mn-marker" data-mn-id="mn-X"> + <aside class="mn-note" id="mn-X">
	// 3. Old shortcode: <span class="mn-wrapper">...</span>
	//
	// Output: { content: transformed HTML, endnotes: [array of note content] }
	eleventyConfig.addFilter("emailifyMarginNotes", (html) => {
		if (!html || typeof html !== "string") {
			return { content: html || "", endnotes: [] };
		}

		let endnotes = [];
		let noteCounter = 0;
		let transformed = html;

		// Pattern 1: New shortcode format with <span class="mn-ref">
		// Two variants: with marker (※) or with anchor text
		const mnRefPattern =
			/<span class="mn-ref"[^>]*>(?:<sup class="mn-marker"[^>]*>※<\/sup>|<span class="mn-anchor"[^>]*>([^<]*)<\/span>)<span class="mn-note"[^>]*>([\s\S]*?)<\/span><\/span>/g;

		transformed = transformed.replace(
			mnRefPattern,
			(match, anchorText, noteContent) => {
				noteCounter++;
				endnotes.push(noteContent.trim());

				if (anchorText) {
					// Anchor version: keep the anchor text, add footnote marker after
					return `${anchorText}<sup class="fn"><a href="#fn-${noteCounter}" id="fnref-${noteCounter}">[${noteCounter}]</a></sup>`;
				} else {
					// Marker version: just the footnote number
					return `<sup class="fn"><a href="#fn-${noteCounter}" id="fnref-${noteCounter}">[${noteCounter}]</a></sup>`;
				}
			},
		);

		// Pattern 2: Legacy Substack import HTML with <aside> tags
		const asideNotes = new Map();
		const asidePattern =
			/<aside class="mn-note" id="([^"]+)"[^>]*>([\s\S]*?)<\/aside>/g;
		let asideMatch;

		while ((asideMatch = asidePattern.exec(html)) !== null) {
			const [fullMatch, noteId, noteContent] = asideMatch;
			asideNotes.set(noteId, noteContent.trim());
		}

		// Remove aside tags from content
		transformed = transformed.replace(asidePattern, "");

		// Replace markers with numbered references
		asideNotes.forEach((noteContent, noteId) => {
			noteCounter++;
			endnotes.push(noteContent);

			const markerPattern = new RegExp(
				`<sup class="mn-marker"[^>]*(?:data-mn-id="${noteId}"|aria-controls="${noteId}")[^>]*>.*?<\/sup>`,
				"g",
			);
			transformed = transformed.replace(
				markerPattern,
				`<sup class="fn"><a href="#fn-${noteCounter}" id="fnref-${noteCounter}">[${noteCounter}]</a></sup>`,
			);
		});

		// Pattern 3: Old shortcode output with <span class="mn-wrapper">
		const wrapperPattern =
			/<span class="mn-wrapper"><span class="mn-anchor">([^<]*)<\/span><span class="mn-content">([\s\S]*?)<\/span><\/span>/g;

		transformed = transformed.replace(
			wrapperPattern,
			(match, anchorText, noteContent) => {
				noteCounter++;
				endnotes.push(noteContent.trim());
				return `${anchorText}<sup class="fn"><a href="#fn-${noteCounter}" id="fnref-${noteCounter}">[${noteCounter}]</a></sup>`;
			},
		);

		return {
			content: transformed,
			endnotes: endnotes,
		};
	});

	// Find post by slug (for related posts)
	eleventyConfig.addFilter("findBySlug", (collection, slug) => {
		if (!collection || !slug) return null;
		return collection.find((item) => {
			const itemSlug = item.fileSlug || item.data.page?.fileSlug;
			return itemSlug === slug;
		});
	});
}
