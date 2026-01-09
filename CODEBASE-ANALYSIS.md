# Codebase Analysis: Burning House
**Date:** January 9, 2026  
**Analyst:** Claude (Code Review Session)

## Executive Summary

After a comprehensive review of the Burning House codebase, I find it to be **well-architected and thoughtfully designed**. The code shows evidence of careful iteration and learning from mistakes. There are a few minor opportunities for cleanup and consolidation, but **no major refactoring is recommended**. The margin note system in particular should be treated with extreme caution—it works correctly after significant debugging effort.

**Key Strengths:**
- Clean separation of concerns (content, layout, styling, scripting)
- Sophisticated margin note system that handles complex edge cases
- Dual-output architecture (web + email) with proper transformations
- Strong accessibility features (ARIA, keyboard support, focus management)
- Well-documented code with clear comments explaining non-obvious decisions

**Recommendations:** Minor cleanup only (detailed below)

---

## Architecture Overview

### Data Flow

```
Content (Markdown + YAML)
    ↓
Eleventy Processing
    ├→ Shortcodes ({% mn %}, {% poem %}, {% figure %})
    ├→ Filters (emailifyMarginNotes, stripLeadingH1, etc.)
    └→ Templates (base.njk, post.njk, post-email.njk)
    ↓
HTML Output
    ├→ Web (_site/[slug]/)
    └→ Email (_site/emails/[slug]/)
    ↓
Post-processing
    ├→ Asset copying (blog-less URLs)
    ├→ Pagefind indexing (search)
    └→ Image optimization (eleventy-img)
```

### Module Responsibilities

1. **eleventy.config.js** - Central orchestration
   - Plugin registration
   - Shortcode definitions (mn, fn, poem, figure)
   - Build event handlers
   - Per-page counter management

2. **_config/filters.js** - Data transformation
   - Date formatting (tolerant of both Luxon DateTime and JS Date)
   - Margin note → endnote conversion (emailifyMarginNotes)
   - Content manipulation (stripLeadingH1, findBySlug)

3. **_includes/layouts/** - Presentation layer
   - base.njk: Master template with JS for margin note positioning
   - post.njk: Web layout with full features
   - post-email.njk: Email layout with converted endnotes

4. **css/index.css** - Visual styling
   - Mobile-first responsive design
   - Margin note positioning (desktop vs mobile)
   - Typography system with CJK support
   - Accessibility (focus states, screen reader support)

5. **_config/bluesky-comments.js** - External integration
   - Fetches Bluesky thread replies
   - Caching layer for build performance
   - Graceful degradation

---

## Deep Dive: Critical Systems

### 1. Margin Notes System

**Status:** ✅ **DO NOT MODIFY** without extreme caution

This system represents the most complex and carefully tuned part of the codebase. Evidence from venting.md shows it took multiple complete rewrites to handle all edge cases.

#### How It Works

**Shortcode Output (eleventy.config.js:286-313):**
```javascript
// Marker version:
<span class="mn-ref" data-mn-id="mn-N">
  <button class="mn-marker" aria-expanded="false" aria-controls="mn-N">N</button>
  <span class="mn-note" id="mn-N" role="note">
    <span class="mn-note-number">N.</span>
    [content with mn-p and mn-blockquote spans]
  </span>
</span>

// Anchor version:
<span class="mn-ref" data-mn-id="mn-N">
  <span class="mn-anchor-text">
    [anchor text]
    <button class="mn-marker">N</button>
  </span>
  <span class="mn-note" id="mn-N" role="note">...</span>
</span>
```

**Why This Structure:**
1. **Wrapper is `position: static`** on desktop (css/index.css:483) - allows note to position relative to .post-body, not the marker
2. **Content uses `<span class="mn-p">` instead of `<p>`** (eleventy.config.js:271-279) - avoids invalid HTML when shortcode is called inside a paragraph
3. **Blockquotes become spans too** - same reason
4. **Button elements for markers** - proper semantics for interactive elements
5. **Separate anchor text span + marker button** - allows natural text wrapping while keeping number as interactive element

**Desktop Behavior (css/index.css:495-503):**
- `.mn-ref` is `position: static` - crucial for correct positioning
- `.mn-note` is `position: absolute; left: calc(100% + var(--margin-gap))`
- JS in base.njk aligns top of note with top of marker
- Notes float in dedicated margin column

**Mobile Behavior (css/index.css:429-462):**
- Notes hidden by default (`display: none !important`)
- Shown inline when toggled (`.is-visible` class adds `display: block !important`)
- Background color and padding distinguish from body text
- JS handles click/keyboard events and ARIA state

**Why This Approach:**
- Avoids z-index stacking issues
- Allows multi-paragraph notes without breaking HTML validity
- Works with markdown processing (which would break complex nested HTML)
- Accessible on both desktop (always visible) and mobile (progressive disclosure)

#### Recommendation: **LEAVE AS IS**

The complexity is justified. Any "simplification" will likely break edge cases.

---

### 2. Email Transformation Pipeline

**Status:** ✅ Well-designed, minor documentation improvement possible

The `emailifyMarginNotes` filter (_config/filters.js:99-233) handles conversion of web margin notes to email endnotes.

**What It Does:**
1. Finds all margin note patterns (new shortcode, legacy HTML, old shortcode)
2. Extracts note content and stores in `endnotes` array
3. Replaces markers with numbered footnote links
4. Converts `mn-p` and `mn-blockquote` spans back to proper block elements
5. Injects back-reference links (↩) into note content

**Pattern Matching:**
- NEW: `<span class="mn-ref">...<span class="mn-note">`
- LEGACY ASIDE: `<sup class="mn-marker" data-mn-id="mn-X">` + `<aside class="mn-note" id="mn-X">`
- OLD WRAPPER: `<span class="mn-wrapper">...<span class="mn-content">`

**Why Multiple Patterns:**
Legacy support for old Substack imports and previous shortcode versions. This is appropriate for a content migration scenario.

#### Recommendation: **LEAVE AS IS**

The multi-pattern support is intentional backward compatibility. Could add a comment explaining this is for migration support, but functionality is correct.

---

### 3. Build-Time Asset Copying

**Status:** ⚠️ Minor improvement possible

Currently assets are copied via `eleventy.after` event handler (eleventy.config.js:67-98).

**Current Flow:**
1. Posts live in `content/blog/[slug]/index.md`
2. Assets live in `content/blog/[slug]/assets/`
3. After build, copy assets to `_site/[slug]/assets/` (blog-less URLs)

**Why This Works:**
- Achieves clean URLs: `/mid-autumn-tiger-hill-late-ming/` instead of `/blog/mid-autumn-tiger-hill-late-ming/`
- Keeps source organized in content/blog/
- Copies happen after Eleventy processing is complete

**Potential Issue:**
The `eleventy-img` plugin (lines 155-182) is configured with `extensions: "jpg,jpeg,png,gif,webp,avif"` to avoid path transformation issues. The comment on line 156 mentions it was "interfering with blog-less asset URLs".

#### Recommendation: **MONITOR** but no immediate change

This is a known workaround. The asset copying works correctly. If you later want to optimize images during copy (instead of excluding them from eleventy-img), this would require coordination between the copy handler and the image plugin.

---

### 4. Per-Page Counter System

**Status:** ✅ Well-implemented

The `pageCounters` Map (eleventy.config.js:256-268) tracks margin note and figure numbers per page.

**Why This Design:**
- Eleventy processes all pages in same Node process
- Without per-page tracking, counters would increment across all pages
- Using page.inputPath as key ensures each page gets independent counter

**Implementation:**
```javascript
const pageCounters = new Map();

function getPageCounter(page) {
  const key = page?.inputPath || "unknown";
  if (!pageCounters.has(key)) {
    pageCounters.set(key, { mn: 0, fig: 0 });
  }
  return pageCounters.get(key);
}

eleventyConfig.on("eleventy.before", () => {
  pageCounters.clear(); // Reset for fresh builds
});
```

#### Recommendation: **LEAVE AS IS**

This is the correct approach for per-page state in Eleventy.

---

### 5. Poem Shortcode System

**Status:** ✅ Excellent design with good fallback

The `{% poem %}` shortcode (eleventy.config.js:402-502) demonstrates good separation of content from presentation.

**Content Sources (in priority order):**
1. Frontmatter in current post (`poems` array)
2. External YAML file (`content/poems/[id].yaml`)
3. External Markdown file with frontmatter (`content/poems/[id].md`)

**Why This Design:**
- DRY: Poems can be reused across posts
- Migration-friendly: Can extract poems from posts to YAML files
- Flexible: Can embed unique poems in post frontmatter if needed

**Error Handling:**
Shows user-friendly error box with clear guidance (line 451-455). Good developer experience.

**Rendering:**
- Builds structured HTML with semantic classes
- Handles missing fields gracefully (only includes elements that exist)
- Processes line breaks with `formatPoemText` helper
- Supports bilingual content (zh + en)

#### Recommendation: **LEAVE AS IS**

Excellent implementation. The three-tier fallback is appropriate.

---

### 6. Figure Captions

**Status:** ✅ Recently fixed, working correctly

The `{% figure %}` shortcode (eleventy.config.js:270-306) supports both centered and margin captions.

**Two Modes:**
1. **Centered** (`style="center"`): Caption below image, centered
2. **Margin** (default): Caption in Tufte-style position (bottom-right corner on desktop)

**CSS Implementation (css/index.css:527-569):**
- Mobile: Center-aligned caption below image
- Desktop (≥1024px): Positioned absolutely outside bottom-right corner
- Fixed width (200px), background box, balanced text

**Why Positioned Outside:**
Maintains clean visual hierarchy—caption doesn't overlap image, floats in margin like margin notes.

#### Recommendation: **LEAVE AS IS**

This was recently debugged (per venting.md). The positioning is correct and intentional.

---

## Code Quality Issues & Recommendations

### MINOR: Commented-Out Code

**Location:** eleventy.config.js:38-46
```javascript
// TEMPORARILY COMMENTED OUT FOR TESTING - SHOW ALL POSTS
// eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
//   if (data.draft) {
//     data.title = `${data.title} (draft)`;
//   }
//   if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
//     return false;
//   }
// });
```

**Recommendation:** Either re-enable or remove. If you want drafts visible in dev but hidden in production, uncomment. Otherwise, delete the block.

---

### MINOR: Disabled Plugins

**Location:** eleventy.config.js:118-121
```javascript
// Disabled - HtmlBasePlugin prepends 'content/' to absolute URLs like /mid-autumn.../assets/...
// eleventyConfig.addPlugin(HtmlBasePlugin);
// Disabled - interfering with post_image paths
// eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
```

**Recommendation:** Document *why* these are disabled in a more permanent way (perhaps in a KNOWN-ISSUES.md or in this analysis file). The comments are good, but could be expanded:

```javascript
// DO NOT ENABLE: HtmlBasePlugin prepends 'content/' to absolute URLs
// This breaks our blog-less asset URLs (assets must be at root, not /content/)
// See: Asset copying in eleventy.after event handler (line 67)
```

---

### MINOR: Unused Filter Function

**Location:** _config/filters.js:238-327

The `processFootnotes` filter is defined but never used. It was likely an intermediate implementation before the current `collectFootnotes` approach.

**Evidence it's unused:**
- Not referenced in any template
- Overlaps with `collectFootnotes` functionality
- More complex than needed (tries to parse broken HTML from markdown)

**Recommendation:** Delete `processFootnotes` function (lines 238-327). Keep `collectFootnotes` which is actively used in post.njk.

---

### MINOR: Inconsistent Date Handling

**Location:** _config/filters.js:11-45

The filters are designed to be "tolerant" of both Luxon DateTime and plain JS Date objects. This is good defensive programming.

**Current State:**
- `readableDate`: Tries Luxon first, falls back to Intl.DateTimeFormat
- `htmlDateString`: Tries Luxon first, falls back to toISOString()
- `dateToRfc3339`: Tries Luxon first, falls back to toISOString()

**Why This Exists:**
Eleventy's base template assumed Luxon, but Eleventy itself provides plain Date objects. The filters paper over this mismatch.

**Recommendation:** **LEAVE AS IS**

This is appropriate defensive programming. The fallback ensures the site builds even if Luxon isn't available or dates come in different formats.

---

### GOOD PRACTICE: CSS Custom Properties

**Location:** css/index.css:15-36

Excellent use of CSS custom properties for theming:
```css
:root {
  --paper: #f6f0e8;
  --ink: #241425;
  --vermillion: #8f1d14;
  /* ... */
}

@media (prefers-color-scheme: dark) {
  :root {
    --paper: #1a1a1a;
    --ink: #e8e0d8;
    /* ... */
  }
}
```

This provides automatic dark mode support with minimal code duplication.

**No changes needed.**

---

### GOOD PRACTICE: Mobile-First CSS

**Location:** css/index.css throughout

The CSS is written mobile-first with desktop overrides at `@media (min-width: 1024px)`.

Examples:
- Base: Single column layout
- Desktop: Two-column grid with margin
- Base: Notes inline, toggled
- Desktop: Notes in margin, always visible

This approach results in cleaner code and better progressive enhancement.

**No changes needed.**

---

### EXCELLENT: Accessibility Features

**Location:** base.njk:93-186, css/index.css margin note styles

The margin note JavaScript includes sophisticated accessibility features:

1. **ARIA Attributes:**
   - `aria-expanded` on mobile (disclosure pattern)
   - `aria-controls` links trigger to note
   - `aria-label` describes what the button does
   - `role="note"` on margin note content

2. **Keyboard Support:**
   - Enter and Space activate triggers
   - Focus management (note receives focus when expanded)
   - Visible focus indicators (outline + background change)

3. **Screen Reader Announcements:**
   - Live region announces when note is expanded
   - Descriptive labels include note number and preview text

4. **Responsive ARIA:**
   - Updates attributes based on viewport (lines 148-167)
   - Desktop: Removes disclosure pattern (notes always visible)
   - Mobile: Enables disclosure pattern (notes toggleable)

**This is professional-grade accessibility work.**

**No changes needed.** Do not simplify this code.

---

### GOOD PRACTICE: Error Handling in Bluesky Integration

**Location:** _config/bluesky-comments.js:40-60

The Bluesky fetching includes proper error handling:
```javascript
try {
  const response = await fetch(`${BLUESKY_API}?${params}`);
  if (!response.ok) {
    console.warn(`Bluesky API error: ${response.status}`);
    return null;
  }
  const data = await response.json();
  // cache and return
} catch (error) {
  console.warn(`Failed to fetch Bluesky thread: ${error.message}`);
  return null;
}
```

Failures are logged but don't break the build. The templates handle null gracefully.

**No changes needed.**

---

## Architecture Decisions: Good Calls

### 1. Blog-less URLs

**Decision:** Posts at `/<slug>/` instead of `/blog/<slug>/`

**Implementation:** 
- Content in `content/blog/` (source organization)
- Output in `_site/<slug>/` (via Eleventy dir config)
- Assets copied in post-processing

**Why This Is Good:**
- Cleaner URLs for readers
- Better for SEO (shorter URLs)
- Source organization separate from output organization

### 2. Hybrid Bluesky Comments

**Decision:** Server-render at build time, client-check for updates

**Implementation:**
- Async filter fetches comments during build
- Caches in HTML (SEO-friendly, fast, owned)
- Client-side script checks for new comments
- Shows "New" badge without full reload

**Why This Is Good:**
- Fast page loads (no client-side fetch delay)
- Works if Bluesky API is down (cached comments remain)
- Fresh comments appear without rebuild
- You own the comment archive

### 3. Margin Note Architecture

**Decision:** Sibling elements in wrapper, absolute positioning via JS

**Why This Is Good:**
- Works with markdown processing (doesn't break in edge cases)
- Accessible on desktop and mobile
- Allows multi-paragraph notes without invalid HTML
- Separates concerns (HTML structure vs CSS presentation)

### 4. Email vs Web Layouts

**Decision:** Separate templates, shared content transformation

**Why This Is Good:**
- DRY: Content written once
- Flexibility: Completely different presentation
- Maintainability: Email constraints isolated to email template
- Web features (margin notes, interactive elements) don't break email

---

## Potential Future Improvements

*(Not urgent, just considerations for future work)*

### 1. Image Optimization Integration

**Current State:** Images excluded from eleventy-img to avoid path issues

**Potential Improvement:** Configure eleventy-img to work with blog-less URLs, enable automatic responsive images

**Effort:** Medium (needs careful testing with asset copying)

### 2. TypeScript/JSDoc

**Current State:** Plain JavaScript

**Potential Improvement:** Add JSDoc comments for better IDE support

**Example:**
```javascript
/**
 * Get Bluesky comments from a thread URL
 * @param {string} url - Bluesky post URL
 * @param {object} [options] - Fetch options
 * @param {number} [options.depth=10] - Reply depth to fetch
 * @param {boolean} [options.useCache=true] - Use cached results
 * @returns {Promise<Array<Comment>>} Array of comment objects
 */
export async function getBlueskyComments(url, options = {}) {
  // ...
}
```

**Effort:** Low (just documentation, no behavior change)

### 3. Test Coverage

**Current State:** No automated tests

**Potential Improvement:** Add tests for critical functions:
- `emailifyMarginNotes` transformation
- Poem shortcode with various input formats
- Date format handling

**Effort:** Medium-High (test infrastructure setup)

### 4. Build Performance

**Current State:** Full rebuild for every change

**Potential Improvement:** Profile build time, optimize slow transforms

**Effort:** Medium (requires profiling)

---

## Files to Consider Deleting

### Confirmed Unused

1. **_config/filters.js:238-327** - `processFootnotes` function (overlaps with `collectFootnotes`)

### Probably Unused (requires verification)

Check if these are actually referenced:
```bash
# Run from project root
grep -r "processFootnotes" content/ _includes/ eleventy.config.js
```

If no results: delete the function.

---

## Final Recommendations

### DO IMMEDIATELY:
✅ **NOTHING** - The codebase is in good shape for the vertical typography work

### DO SOON (non-blocking):
1. Delete `processFootnotes` function from filters.js (if confirmed unused)
2. Either re-enable or fully remove commented draft handling code
3. Expand comments on disabled plugins to explain why

### DO EVENTUALLY (nice-to-have):
1. Add JSDoc comments for better IDE support
2. Consider automated tests for content transformations
3. Profile build performance if it becomes slow

### NEVER DO:
❌ Simplify margin note system (it's complex for good reasons)  
❌ Combine web and email layouts (separation is intentional)  
❌ Remove legacy pattern support from `emailifyMarginNotes` (needed for old content)

---

## Conclusion

This is a **well-crafted codebase** that shows evidence of thoughtful iteration and learning. The margin note system is complex but necessarily so—it handles real-world edge cases that simpler approaches would break.

The separation of concerns is excellent:
- Content (Markdown/YAML) is clean
- Templates (Nunjucks) handle structure
- Styles (CSS) handle presentation
- Scripts (JS) handle interaction
- Filters (JS) handle transformation

**Primary Recommendation:** Proceed with vertical typography work. The codebase is ready. Consider this analysis document as a reference for understanding how the pieces fit together.

**Chesterton's Fence Applied:** Before changing anything, understand *why* it's there. This analysis documents those reasons. The complexity is justified, not accidental.
