export default function (eleventyConfig) {
  // Existing filters (if any) live in this plugin file.

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
