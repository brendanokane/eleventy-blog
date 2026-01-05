# TODO

## Completed

### ✅ Content Model & CMS Setup (2026-01-05)
- Defined content model in CONTENT-MODEL.md
- Set up Front Matter CMS extension (frontmatter.json)
- Set up Decap CMS at /admin with full schema
- Removed deprecated `publish` field from all posts
- Added `og_description` for separate social summaries
- Added `related` field for manual post curation

### ✅ Poem Shortcode (2026-01-05)
- Implemented `{% poem "id" %}` shortcode for bilingual poems
- Looks first in frontmatter `poems` array, then in `content/poems/{id}.yaml`
- Renders Chinese/English titles, poets, and text with proper typography
- Side-by-side layout on desktop, stacked on mobile
- Shows helpful error message if poem not found

### ✅ Margin Note/Footnote Shared Counter (2026-01-05)
- Fixed per-page counter reset using Map keyed by `page.inputPath`
- Now correctly: mn1, mn2, fn3, mn4... (shared sequential numbering)

### ✅ Margin Note Positioning (2026-01-05)
- CSS grid layout with margin column
- `.mn-ref` set to `position: static` on desktop so notes position relative to `.post-body`
- JS positions notes vertically to align with their anchors
- Mobile: notes hidden by default, toggle on tap

### ✅ Template Design Rebuild (2026-01-05)
- Rebuilt CSS from scratch with clean variable system
- Grid-based layout with main column + margin column
- Dark mode support via `prefers-color-scheme`
- Print styles for margin notes

## Future Enhancements

### Poem Shortcode Enhancements
- Support for poems with only one language
- Alternative layout options (e.g., interleaved lines, columnar fanti)
- Optional source/attribution field

### Figure Caption Styling
- Review margin caption positioning on mid-autumn-tiger-hill page
- Ensure captions align properly with images

### Consolidate Marker Styles
- `fn-marker` and `mn-marker` could share styles (both are superscripted numerals)

### Decap CMS Authentication
- Currently configured for git-gateway (requires Netlify Identity or similar)
- For local dev, uncomment `local_backend: true` in admin/config.yml

---

*Last updated: 2026-01-05*
