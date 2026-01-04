# Burning House Blog — Handoff

**Last Updated:** January 3, 2026 (evening)
**Branch:** `main`
**Status:** Simplified codebase, working well

---

## Quick Start

```bash
npm start           # Dev server at http://localhost:8080/
npm run build       # Production build
```

---

## Current State

### Session 3 (Jan 3, 2026, 7:15 PM EST)

**THE SIMPLIFICATION IS COMPLETE.** Previous sessions did the heavy lifting - this session verified and polished.

**Codebase now:**
- **CSS: 590 lines** (down from 1478) - clean, minimal, well-documented
- **base.njk: 152 lines** (down from 457) - no search UI, no theme toggle, minimal JS

**What works:**
- ✅ Margin notes with both anchor and marker styles
- ✅ Desktop: notes positioned in right margin, aligned with anchors
- ✅ Mobile: notes hidden, toggle on tap
- ✅ CJK characters never italicized (zh/ja/ko rules)
- ✅ Print stylesheet
- ✅ Dark mode (automatic, follows system preference)
- ✅ Text centering at wide desktop (1200px+)

**Fixed this session:**
- Added CSS for `mn-ref` and `mn-anchor` classes (shortcode output)
- Updated JS to handle both anchor and marker click handlers
- Added desktop positioning JS to align notes with their anchors
- Completed CJK italic prevention (added ja/ko to margin notes)
- Added superscripted numeral after anchor text (`mn-anchor-num` class)
- Reverted text width to 65ch (85ch was too wide, centering needs rethinking)

**Known issues:**
- Margin note desktop positioning may need tuning (notes can overlap with main text)
- Test page: /li-bai-to-du-fu-wish-you-were-here/

### Previous Session Notes (for context)

**Margin notes shortcode fixed:**
- The `{% mn %}` shortcode now properly strips `<p>` wrappers from single-paragraph notes
- Having `<p>` inside `<span>` was invalid HTML — browsers "fixed" it by breaking layout
- Both marker style (`{% mn %}...{% endmn %}` → ※) and anchor style (`{% mn "anchor text" %}...{% endmn %}`) work
- Li Bai post converted from generated HTML back to shortcode format

**Typography:**
- Pre/code elements now use body font (Vollkorn) instead of monospace
- Blockquotes: no left border, no italics, 2em indent

**Design playground** (`public/design-playground-post.html`):
- Now loads actual production CSS via `/css/production.css` passthrough
- Has working sliders for CSS variables
- Full post content preserved

### Current CSS Architecture

The responsive layout uses a progressive enhancement approach:

```css
/* Base: All content centered at --measure (70ch) */
main { padding: var(--page-pad); }
main > * { max-width: var(--measure); margin-left: auto; margin-right: auto; }

/* Tablet (768-1199px): Notes in right margin, left-aligned to avoid overflow */
main .post {
  margin-left: var(--page-pad);
  margin-right: auto;
  max-width: var(--post-measure);  /* 65ch */
}

/* Desktop (768px+): Notes positioned absolutely to right */
main .post {
  max-width: var(--post-measure);
  margin-left: auto;
  margin-right: auto;
}

/* Wide desktop (1200px+): Text+notes centered as unit via transform */
main .post {
  transform: translateX(calc((var(--mn-width) + var(--mn-gap)) / -2));
}
```

Note: `.post` is inside `<heading-anchors>` web component, not a direct child of `main`.

### Previous Work (Jan 2, 2026)

- Switched from Adobe Fonts to Google Fonts (Vollkorn, Source Sans 3, Lato)
- Removed woodblock layouts, consolidated to single `post.njk`
- Margin notes JavaScript in `base.njk`
- Design branch merged to main

### Branch Comparison

The `design/ink-linen-nav-typography` branch is **38 commits ahead** of `main` with:

| Feature | Main | Design Branch |
|---------|------|---------------|
| Fonts | Adobe Fonts (Typekit) | Google Fonts |
| Homepage | Basic list | Leishu-inspired broadsheet |
| Navigation | Dynamic | Simplified (Home/Archive/About) |
| Search | None | Pagefind with suggestions |
| Theme toggle | None | Light/dark with persistence |
| SEO/OG | Minimal | Full OpenGraph, Twitter cards |
| Favicons | None | Complete set with SVG logo |

**Recommendation:** Safe to merge. No conflicts expected.

---

## Architecture

### Layouts (Simplified)

```
base.njk          # Base template (header, footer, scripts)
  └── post.njk    # Individual blog posts
  └── post-email.njk  # Email-friendly post variant
```

The woodblock layouts were removed. Everything now uses `post.njk`.

### Key Files

| File | Purpose |
|------|---------|
| `css/index.css` | All styles (~1350 lines) |
| `_includes/layouts/base.njk` | Base template + margin notes JS |
| `_includes/layouts/post.njk` | Post layout |
| `content/index.njk` | Homepage (broadsheet layout) |
| `eleventy.config.js` | Build config, filters, plugins |

### Margin Notes

The margin notes system handles two formats:
1. **New format:** `<span class="mn-ref">` wrapper with marker + note inside
2. **Legacy (Substack imports):** `<aside class="mn-note">` with `<sup class="mn-marker">`

Desktop (>900px): Notes positioned in margin column, aligned with markers via JS
Mobile (≤900px): Notes hidden, toggle on marker click

---

## Design System

### Colors (CSS Variables)

```css
--paper: #f6f0e8;      /* warm linen background */
--ink: #241425;        /* dark purple-brown text */
--vermillion: #8f1d14; /* accent/links */
```

Dark mode automatically inverts.

### Typography

```css
--font-body: "Vollkorn", ...;      /* Body text */
--font-display: "Source Sans 3";   /* Headings */
--font-mn: "Gill Sans", "Lato";    /* Margin notes */
```

### Layout

```css
--measure: 70ch;        /* Main column width */
--post-measure: 65ch;   /* Post body width */
--mn-width: 280px;      /* Margin notes width */
--mn-gap: 2.5rem;       /* Gap between text and notes */
```

---

## Upcoming Work

### Immediate: Fix Text Column Centering

See "What's Broken" section above. The text column needs to be horizontally centered.

### Soon: Chinese Character Baseline

Chinese characters currently display slightly below the baseline of surrounding roman text. This is a font metrics issue — probably needs `vertical-align` adjustment or careful line-height tuning. Low priority but would polish the typography for posts with mixed Chinese/English.

### Medium-term

1. **Hero images** - Featured post needs prominent image
2. **Publishing workflow** - Most posts still have `draft: true`
3. **Migrate Substack markup** - Convert `<aside class="mn-note">` to `{% mn %}` shortcode

---

## Documentation Files

Many docs are stale (from Dec 2024). Key ones:

| File | Status | Notes |
|------|--------|-------|
| `HANDOFF.md` | **Current** | This file |
| `venting.md` | Active | Private thinking/debugging space |
| `so-far.md` | Historical | Long running log, useful for archaeology |
| `README.md` | Stale | Needs update to match current state |

### Candidates for Removal/Archival

These are from December 2024 and largely superseded:
- `END-OF-SESSION-SUMMARY.md`
- `HANDOFF-NEXT-SESSION.md`
- `HANDOFF-NOTES.md`
- `SESSION-SUMMARY.md`
- `STATUS.md`
- `CURRENT-STATUS.md`

---

## Commands

```bash
# Development
npm start                    # Serve locally with drafts

# Build
npm run build                # Production build

# Beads (issue tracking)
bd ready                     # Available work
bd list --status=in_progress # Active work
bd sync                      # Sync with git
```

---

## Known Issues

1. **Draft filtering disabled** - All posts visible for testing
2. **Some posts lack `post_image`** - Homepage images may be missing
3. **Mobile breakpoint** - User mentioned wanting ~1900px instead of 950px (unclear if still relevant)

---

## User Preferences (Learned)

- Values restraint over abundance in design
- Prefers suggestion over simulation for historical aesthetics
- Likes dramatic typography (large H1s, generous spacing)
- Appreciates clear, consolidated documentation
- Uses `venting.md` as a thinking/catharsis space

---

*Updated by Claude, January 3, 2026*
