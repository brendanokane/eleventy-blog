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
    .addPassthroughCopy("./content/feed/pretty-atom-feed.xsl");

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
    outputPath: "/feed/feed.xml",
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
      title: "Blog Title",
      subtitle: "This is a longer description about your blog.",
      base: "https://example.com/",
      author: {
        name: "Your Name",
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

  // Slugify helper for import pipeline
  eleventyConfig.addFilter("slugify", (str) => {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  });

  eleventyConfig.addPlugin(IdAttributePlugin, {
    // by default we use Eleventy’s built-in `slugify` filter:
    // slugify: eleventyConfig.getFilter("slugify"),
    // selector: "h1,h2,h3,h4,h5,h6", // default
  });

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

  eleventyConfig.addShortcode("currentBuildDate", () => {
    return new Date().toISOString();
  });

  // Ensure the async function returns the config object
  return {};
}

export const config = {
  templateFormats: ["md", "njk", "html", "liquid", "11ty.js"],
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
  dir: {
    input: "content",
    includes: "../_includes",
    data: "../_data",
    output: "_site",
  },
};
