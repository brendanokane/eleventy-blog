# Burning House Blog — Handoff

**Last Updated:** January 2, 2026  
**Branch:** `design/ink-linen-nav-typography`  
**Status:** Ready for merge to main

---

## Quick Start

```bash
npm start           # Dev server at http://localhost:8080/
npm run build       # Production build
```

---

## Current State

### What Just Happened (Jan 2, 2026)

Committed and pushed typography/font changes:
- **Switched from Adobe Fonts (Typekit) to Google Fonts**
  - Body: Vollkorn (serif)
  - Headings: Source Sans 3 (sans-serif)
  - Margin notes: Lato/Gill Sans (sans-serif)
- Removed unused woodblock layouts (`post-woodblock.njk`, `woodblock-preview.njk`)
- Consolidated margin notes JavaScript into `base.njk`
- Improved post layout with proper `.post` component structure

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
--mn-width: 220px;      /* Margin notes width */
--mn-gap: 2.5rem;       /* Gap between text and notes */
```

---

## Upcoming Work

### Immediate: Design Playground for Posts

User requested an updated design playground for single posts with sliders for:
- Font attributes (size, weight, line-height)
- Character spacing (letter-spacing)
- Left margin width
- Gutter width (between text and margin notes)
- Margin notes column width

Use "The Naming of Cats" content as filler.

Reference: `public/design-playground-post.html` exists but may need updating.

### Medium-term

1. **Hero images** - Featured post needs prominent image
2. **Merge to main** - Branch is ready
3. **Publishing workflow** - Most posts still have `draft: true`

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

*Updated by Claude, January 2, 2026*
