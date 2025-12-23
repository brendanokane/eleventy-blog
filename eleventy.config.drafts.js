/**
 * Publishing gate:
 * - `draft: true` behaves like Eleventy base-blog (excluded on `build`).
 * - `publish: true` is the positive signal that a post is ready.
 * - We warn (but do not block) if `publish: true` and `bluesky_thread` is missing.
 */

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function (eleventyConfig) {
  eleventyConfig.addPreprocessor("drafts", "*", (data) => {
    if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
      return false;
    }

    // If explicitly publishable is not set, treat as not publishable in production builds.
    if (process.env.ELEVENTY_RUN_MODE === "build") {
      const isPublishable = data.publish === true;
      if (!isPublishable) {
        return false;
      }

      if (!data.bluesky_thread) {
        // Warning only
        // eslint-disable-next-line no-console
        console.warn(
          `[WARN] publish:true but bluesky_thread is missing for: ${data.page?.inputPath ?? data.title ?? "(unknown)"}`
        );
      }
    }
  });
}
