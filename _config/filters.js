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
		if (dateObj && typeof dateObj.setZone === "function" && typeof dateObj.toFormat === "function") {
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

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter((tag) => ["all", "nav", "post"].indexOf(tag) === -1);
	});

	eleventyConfig.addFilter("sortAlphabetically", (strings) =>
		(strings || []).sort((a, b) => a.localeCompare(b))
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
	// For now this is a no-op to keep the email templates rendering even if
	// margin-note HTML varies across layouts.
	//
	// Later: convert margin notes to endnotes/footnotes for email/RSS output.
	eleventyConfig.addFilter("emailifyMarginNotes", (html) => {
		return html;
	});
}
