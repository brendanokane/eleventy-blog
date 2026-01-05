# Development Notes

## Architecture Overview

### Note Processing Pipeline

**Shortcode Phase (per-page):**
1. `{% mn %}` → `<span class="mn-ref">...<span class="mn-note">...</span></span>`
2. `{% fn %}` → `<sup class="fn-ref">...</sup>` + stored in `page._footnotes`
3. Both increment shared `counters.mn`

**Template Phase (post.njk):**
- Footnotes are rendered from `page._footnotes` array at bottom of article
- Margin notes remain inline in the HTML
- No filter processing needed for web output

**Client-Side (web only):**
- JS positions margin notes vertically to align with anchors
- Mobile: toggle visibility on tap

### Layout Structure
```
.layout-container (CSS grid)
├── .post (grid-column: 2 on desktop)
│   ├── .post-header
│   ├── .post-body (position: relative)
│   │   ├── content with .mn-ref (position: static on desktop)
│   │   │   └── .mn-note (position: absolute, left: calc(100% + gap))
│   │   └── inline footnote markers
│   └── .footnotes section (from page._footnotes)
└── margin column (grid-column: 4, implicit)
```

---

## 2026-01-05: Per-Page Counter Implementation

### Summary
Fixed per-page counter reset so each page starts numbering at 1.

### The Problem
Module-level counters (`mnCounter`, `figCounter`) persisted across all pages during build, causing pages built later to start at higher numbers.

### The Solution
Changed from global counters to a per-page Map:

```javascript
const pageCounters = new Map();

function getPageCounter(page) {
    const key = page?.inputPath || 'unknown';
    if (!pageCounters.has(key)) {
        pageCounters.set(key, { mn: 0, fig: 0 });
    }
    return pageCounters.get(key);
}

eleventyConfig.on("eleventy.before", () => {
    pageCounters.clear();
});
```

Shortcodes use `getPageCounter(this.page)` to get their page's counter.

---

## 2026-01-05: Footnote Collection Fix

### Summary
Switched footnotes from filter-based collection to template-based collection using `page._footnotes`.

### The Problem
The `emailifyMarginNotes` filter was designed for email output (converting all notes to endnotes). Using it for web output was causing margin notes to disappear or numbering to restart.

### The Solution
- The `{% fn %}` shortcode now pushes footnotes to `page._footnotes` array
- The `post.njk` template iterates over `page._footnotes` to render the Notes section
- Margin notes stay inline in the HTML, no filter processing needed

### Key Files
- `eleventy.config.js`: Shortcodes push to `this.page._footnotes`
- `_includes/layouts/post.njk`: Template renders footnotes from `page._footnotes`

---

## 2026-01-04: Markdown Configuration

### Footnote Shortcode (`{% fn %}`)
- Created paired shortcode sharing counter with `{% mn %}`
- Outputs superscript link in text
- Content stored in `page._footnotes` for template rendering

### Markdown Configuration
```javascript
const md = new MarkdownIt({
    html: true,   // Required for shortcode HTML output
    breaks: true, // Line breaks in poetry
});
eleventyConfig.setLibrary("md", md);
```

---

## Two Contexts for Notes

| Context | Margin Notes | Footnotes |
|---------|--------------|-----------|
| **Web** | In right margin | Endnotes section |
| **Email/RSS** | Converted to endnotes | Endnotes section |

For email/RSS, the `emailifyMarginNotes` filter converts everything to numbered endnotes (margins don't work in email).

For web, margin notes stay in place and footnotes are collected by the template.

---

*Last updated: 2026-01-05*
