import { DateTime } from "luxon";

export default function (eleventyConfig) {
  eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
    // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(
      format || "dd LLLL yyyy"
    );
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  // Return the keys used in an object
  eleventyConfig.addFilter("getKeys", (target) => {
    return Object.keys(target);
  });

  eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
    return (tags || []).filter((tag) => ["all", "posts"].indexOf(tag) === -1);
  });

  eleventyConfig.addFilter("sortAlphabetically", (strings) =>
    (strings || []).sort((b, a) => b.localeCompare(a))
  );

  // Returns a list of unique tags used across a collection.
  // Usage: collections.all | getAllTags | filterTagList
  eleventyConfig.addFilter("getAllTags", (collection) => {
    if (!Array.isArray(collection)) return [];

    const tagSet = new Set();

    for (const item of collection) {
      const tags = item?.data?.tags;
      if (!tags) continue;

      if (Array.isArray(tags)) {
        for (const t of tags) {
          if (typeof t === "string") tagSet.add(t);
        }
      } else if (typeof tags === "string") {
        tagSet.add(tags);
      }
    }

    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  });
}
