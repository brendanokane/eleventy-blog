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
	// Output: { content: transformed HTML, endnotes: [array of note content with back-references] }
	eleventyConfig.addFilter("emailifyMarginNotes", (html) => {
		if (!html || typeof html !== "string") {
			return { content: html || "", endnotes: [] };
		}

		let endnotes = [];
		let noteCounter = 0;
		let transformed = html;

		// Helper function to inject back-reference link into note content
		function addBackReference(noteContent, noteNum) {
			const backref = ` <a href="#fnref-${noteNum}" class="footnote-backref" aria-label="Back to content">↩</a>`;

			// If content ends with </p>, insert before closing tag
			if (noteContent.trim().endsWith("</p>")) {
				return noteContent.trim().replace(/<\/p>$/, `${backref}</p>`);
			}
			// Otherwise just append
			return noteContent.trim() + backref;
		}

		// This pattern now ONLY matches footnotes. Margin notes are left untouched.
		// 1. <sup class="fn-ref">...<span class="fn-content">content</span> (marker version)
		// 2. <span class="fn-ref">...<span class="fn-content">content</span> (anchor version)
		const footnotePattern =
			/(?:<sup class="fn-ref"[^>]*><a[^>]*class="fn-marker"[^>]*>[\s\S]*?<\/a><\/sup><span class="fn-content"[^>]*><span class="fn-number"[^>]*>[\s\S]*?<\/span>\s*([\s\S]*?)<\/span>)|(?:<span class="fn-ref"[^>]*><a[^>]+class="fn-anchor"[^>]*>([\s\S]*?)<\/a><sup[^>]*><a[^>]*>[\s\S]*?<\/a><\/sup><\/span><span class="fn-content"[^>]*><span class="fn-number"[^>]*>[\s\S]*?<\/span>\s*([\s\S]*?)<\/span>)/g;

		transformed = transformed.replace(
			footnotePattern,
			(match, fnMarkerContent, fnAnchor, fnAnchorContent) => {
				noteCounter++;

				let noteContent, anchorText;
				if (fnMarkerContent !== undefined) {
					// Footnote marker version matched
					noteContent = fnMarkerContent;
					anchorText = null;
				} else if (fnAnchorContent !== undefined) {
					// Footnote anchor version matched
					noteContent = fnAnchorContent;
					anchorText = fnAnchor;
				} else {
					// Should not happen
					return match;
				}

				endnotes.push(addBackReference(noteContent, noteCounter));

				if (anchorText) {
					// Anchor version: keep the anchor text, add footnote marker after
					return `${anchorText}<sup class="fn"><a href="#fn-${noteCounter}" id="fnref-${noteCounter}">${noteCounter}</a></sup>`;
				} else {
					// Marker version: just the footnote number
					return `<sup class="fn"><a href="#fn-${noteCounter}" id="fnref-${noteCounter}">${noteCounter}</a></sup>`;
				}
			},
		);

		// Legacy patterns for old imports (keep these for backwards compatibility)

		// Pattern: Legacy Substack import HTML with <aside> tags
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
			endnotes.push(addBackReference(noteContent, noteCounter));

			const markerPattern = new RegExp(
				`<sup class="mn-marker"[^>]*(?:data-mn-id="${noteId}"|aria-controls="${noteId}")[^>]*>.*?<\/sup>`,
				"g",
			);
			transformed = transformed.replace(
				markerPattern,
				`<sup class="fn"><a href="#fn-${noteCounter}" id="fnref-${noteCounter}">${noteCounter}</a></sup>`,
			);
		});

		// Pattern: Old shortcode output with <span class="mn-wrapper">
		const wrapperPattern =
			/<span class="mn-wrapper"><span class="mn-anchor">([^<]*)<\/span><span class="mn-content">([\s\S]*?)<\/span><\/span>/g;

		transformed = transformed.replace(
			wrapperPattern,
			(match, anchorText, noteContent) => {
				noteCounter++;
				endnotes.push(addBackReference(noteContent, noteCounter));
				return `${anchorText}<sup class="fn"><a href="#fn-${noteCounter}" id="fnref-${noteCounter}">${noteCounter}</a></sup>`;
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

	// Collect footnotes from {% fn %} shortcodes and render them at the end
	// Extracts hidden .fn-content elements and builds a proper footnotes section
	eleventyConfig.addFilter("collectFootnotes", (html) => {
		if (!html || typeof html !== "string") {
			return html || "";
		}

		const footnotes = [];

		// Extract all .fn-content spans (hidden footnote content)
		const fnContentPattern =
			/<span class="fn-content" id="(fn-\d+)" data-refid="(fnref-\d+)"[^>]*>([\s\S]*?)<\/span>/g;
		let match;

		while ((match = fnContentPattern.exec(html)) !== null) {
			const [fullMatch, noteId, refId, content] = match;
			footnotes.push({ noteId, refId, content: content.trim() });
		}

		// Remove the hidden footnote content from the main HTML
		let cleaned = html.replace(fnContentPattern, "");

		// If no footnotes found, return original HTML
		if (footnotes.length === 0) {
			return html;
		}

		// Build the footnotes section
		let footnotesHtml = '\n<hr class="footnotes-separator">\n';
		footnotesHtml += '<section class="footnotes">\n';
		footnotesHtml += '<h2 class="footnotes-title">Notes</h2>\n';
		footnotesHtml += '<ol class="footnotes-list">\n';

		footnotes.forEach((fn) => {
			// Extract just the number from fn-content (remove <span class="fn-number">N.</span>)
			let cleanContent = fn.content.replace(
				/<span class="fn-number"[^>]*>[\s\S]*?<\/span>\s*/,
				"",
			);

			footnotesHtml += `<li id="${fn.noteId}">\n`;
			footnotesHtml += `${cleanContent}\n`;
			footnotesHtml += `<a href="#${fn.refId}" class="footnote-backref" aria-label="Back to reference ${fn.noteId}">↩</a>\n`;
			footnotesHtml += `</li>\n`;
		});

		footnotesHtml += "</ol>\n";
		footnotesHtml += "</section>\n";

		return cleaned + footnotesHtml;
	});

	// Process footnotes for web output - handles multi-paragraph footnotes broken by markdown
	//
	// The {% fn %} shortcode outputs:
	//   <sup class="fn-ref" data-fn-id="fn-N">...</sup>
	//   <span class="fn-content" id="fn-N" ... style="display:none;">content</span>
	//
	// But when footnote content has blank lines, markdown breaks the span apart:
	//   <sup class="fn-ref" data-fn-id="fn-N">...</sup> </p><p>First paragraph...</p><p>Second...</p>
	//
	// This filter finds fn-ref markers, extracts their number, then captures all content
	// up to the next structural boundary ({% endfn %} marker or next major element).
	//
	// Output: { content: cleaned HTML, footnotes: [{ num, content }] }
	eleventyConfig.addFilter("processFootnotes", (html) => {
		if (!html || typeof html !== "string") {
			return { content: html || "", footnotes: [] };
		}

		const footnotes = [];
		let transformed = html;

		// Strategy: Look for the fn-ref marker pattern and extract the number.
		// The footnote content follows immediately after (broken out of the hidden span by markdown).
		// We need to find where each footnote's content ends - typically at {% endfn %} boundary
		// which leaves a telltale pattern in the HTML.

		// Pattern 1: Marker-only footnotes
		// <sup class="fn-ref" data-fn-id="fn-N"><a href="#fn-N" id="fnref-N" class="fn-marker">N</a></sup>
		// followed by content that was in the hidden span (now broken out)

		// First, let's find all fn-ref markers and their numbers
		const markerPattern =
			/<sup class="fn-ref" data-fn-id="fn-(\d+)"[^>]*>[\s\S]*?<\/sup>\s*<\/p>/g;

		// Find positions of all footnote markers
		const markers = [];
		let markerMatch;
		while ((markerMatch = markerPattern.exec(html)) !== null) {
			markers.push({
				num: markerMatch[1],
				fullMatch: markerMatch[0],
				index: markerMatch.index,
				endIndex: markerMatch.index + markerMatch[0].length,
			});
		}

		// For each marker, find the content that follows until {% endfn %} boundary
		// The endfn shortcode doesn't output anything, but markdown creates a paragraph break
		// We look for content between the marker's </p> and the resumption of the main text

		// Actually, let's try a different approach: find the broken span opening tag
		// <span class="fn-content" id="fn-N" ... style="display:none;">
		// Even if markdown breaks it, the opening tag should survive

		const fnContentOpenPattern =
			/<span class="fn-content" id="fn-(\d+)" data-refid="fnref-\d+"[^>]*style="display:none;"[^>]*>/g;

		let contentMatch;
		const fnContentStarts = [];
		while ((contentMatch = fnContentOpenPattern.exec(html)) !== null) {
			fnContentStarts.push({
				num: contentMatch[1],
				fullMatch: contentMatch[0],
				index: contentMatch.index,
				endIndex: contentMatch.index + contentMatch[0].length,
			});
		}

		// If we found fn-content opening tags, the content follows until we hit
		// something that clearly isn't footnote content
		if (fnContentStarts.length > 0) {
			// Process in reverse order to maintain string indices
			for (let i = fnContentStarts.length - 1; i >= 0; i--) {
				const start = fnContentStarts[i];
				const startPos = start.endIndex;

				// Find the end - look for closing </span> that might exist,
				// or the next major structural element, or end of string
				// Since markdown breaks the span, we look for where content ends

				// The {% endfn %} tag produces nothing, but the next text after it
				// is the continuation of the main document. We need a heuristic.

				// Look for either:
				// 1. A proper closing </span> (if markdown didn't break it)
				// 2. The next fn-ref marker
				// 3. A clear continuation pattern like resumption of blockquote structure

				let endPos = html.length;

				// Check for next fn-content start
				if (i < fnContentStarts.length - 1) {
					// Find the fn-ref marker that precedes the next fn-content
					const nextStart = fnContentStarts[i + 1];
					// The marker should be right before, search backwards
					const searchRegion = html.substring(start.endIndex, nextStart.index);
					const lastMarkerInRegion = searchRegion.lastIndexOf(
						'<sup class="fn-ref"',
					);
					if (lastMarkerInRegion !== -1) {
						endPos = start.endIndex + lastMarkerInRegion;
					} else {
						endPos = nextStart.index;
					}
				}

				// Extract content
				let content = html.substring(startPos, endPos);

				// Clean up: remove any stray </span> tags and leading/trailing whitespace
				content = content.replace(/<\/span>\s*$/, "").trim();

				// Remove the fn-number span if present
				content = content.replace(
					/<span class="fn-number"[^>]*>\d+\.<\/span>\s*/,
					"",
				);

				// Store footnote
				footnotes.unshift({ num: parseInt(start.num), content });

				// Remove this footnote content from the main HTML
				transformed =
					transformed.substring(0, start.index) + transformed.substring(endPos);
			}
		}

		// Sort footnotes by number
		footnotes.sort((a, b) => a.num - b.num);

		return {
			content: transformed,
			footnotes: footnotes,
		};
	});
}
