# Venting Log

## 2025-12-25: The Mystery of the Vanishing Leading Slash - SOLVED

**Problem:** Frontmatter had `post_image: "/mid-autumn..."` but HTML showed `src="content/mid-autumn..."`

**Root Cause:** The `eleventyImageTransformPlugin` was transforming the image paths!

**What I tried (that didn't work):**
1. ✗ Disabled InputPathToUrlTransformPlugin
2. ✗ Disabled HtmlBasePlugin  
3. ✗ Tried | url filter
4. ✗ Tried | htmlBaseUrl filter

**The actual culprit:** `eleventyImageTransformPlugin` 

When I disabled it, paths were correct: `src="/mid-autumn..."`
When enabled, it was prepending "content/" somehow.

**Solution:** Re-enabled the plugin with proper configuration. The plugin is actually useful for optimization, just needed to not mess with our blog-less URLs.

**Lesson learned:** When debugging path issues in Eleventy, check ALL the transform plugins, not just the obvious URL ones!

## 2025-12-27: Broadsheet CSS Wrangling

Ok, yes, the CSS is a little feral right now. Deep breaths.

## 2025-12-28: Playground Controls

So many sliders; still standing.
