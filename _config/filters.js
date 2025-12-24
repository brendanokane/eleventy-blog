export default function (eleventyConfig) {
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		return dateObj.setZone(zone).toFormat(format);
	});

	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
		// ISO string without time, used for HTML validity.
		return dateObj.toISODate();
	});

	eleventyConfig.addFilter("dateToRfc3339", (dateObj) => {
		// Timestamp used in Atom feed.
		return dateObj.toFormat("yyyy-LL-dd'T'HH:mm:ss.SSS'Z'");
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
