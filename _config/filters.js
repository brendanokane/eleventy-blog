import { DateTime } from "luxon";

export default function (eleventyConfig) {
  eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
    return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(
      format || "dd LLLL yyyy"
    );
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // RFC 3339 timestamps for feeds (Atom/JSON)
  eleventyConfig.addFilter("dateToRfc3339", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toISO({
      suppressMilliseconds: true,
    });
  });

  // Newest date in a collection (used by Atom feed <updated>)
  eleventyConfig.addFilter("getNewestCollectionItemDate", (collection) => {
    if (!Array.isArray(collection) || collection.length === 0) {
      return new Date();
    }

    return collection
      .map((item) => item?.date)
      .filter(Boolean)
      .sort((a, b) => b.getTime() - a.getTime())[0];
  });

  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  eleventyConfig.addFilter("getKeys", (target) => {
    return Object.keys(target);
  });

  eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
    return (tags || []).filter((tag) => ["all", "posts"].indexOf(tag) === -1);
  });

  eleventyConfig.addFilter("sortAlphabetically", (strings) =>
    (strings || []).sort((b, a) => b.localeCompare(a))
  );

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
