import {
  IdAttributePlugin,
  InputPathToUrlTransformPlugin,
  HtmlBasePlugin,
} from "@11ty/eleventy";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import MarkdownIt from "markdown-it";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

import pluginFilters from "./_config/filters.js";

const md = new MarkdownIt();

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
  // Drafts, see also _data/eleventyDataSchema.js
  eleventyConfig.addPreprocessor("drafts", "*", (data) => {
    if (data.draft) {
      data.title = `${data.title} (draft)`;
    }

    if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
      return false;
    }
  });

  eleventyConfig
    .addPassthroughCopy({
      "./public/": "/",
    })
    .addPassthroughCopy("./content/feed/pretty-atom-feed.xsl");

  eleventyConfig.addWatchTarget("css/**/*.css");
  eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");

  eleventyConfig.addBundle("css", {
    toFileDirectory: "dist",
    bundleHtmlContentFromSelector: "style",
  });

  eleventyConfig.addBundle("js", {
    toFileDirectory: "dist",
    bundleHtmlContentFromSelector: "script",
  });

  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    preAttributes: { tabindex: 0 },
  });
  eleventyConfig.addPlugin(pluginNavigation);

  // Re-enabled now that permalink:false docs are excluded from collections.
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

  // NOTE: feeds remain disabled until we generate email-variant pages.

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["avif", "webp", "auto"],
    failOnError: false,
    htmlOptions: {
      imgAttributes: {
        loading: "lazy",
        decoding: "async",
      },
    },
    sharpOptions: {
      animated: true,
    },
  });

  eleventyConfig.addPlugin(pluginFilters);

  eleventyConfig.addPlugin(IdAttributePlugin, {});

  // Keep existing shortcodes; they shouldn't block.
  eleventyConfig.addPairedShortcode("mn", function (content, anchor) {
    const renderedContent = md.render(content);

    let cleanedContent = renderedContent.trim();
    if (cleanedContent.startsWith("<p>")) {
      cleanedContent = cleanedContent
        .slice(3, cleanedContent.length - 5)
        .trim();
    }

    return `<span class="mn-wrapper"><span class="mn-anchor">${anchor}</span><span class="mn-content">${cleanedContent}</span></span>`;
  });

  eleventyConfig.addPairedShortcode("fn", function (content) {
    return `<sup class="fn-marker" title="${content}">[ref]</sup>`;
  });

  eleventyConfig.addShortcode("currentBuildDate", () => {
    return new Date().toISOString();
  });

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
