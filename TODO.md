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

### ✅ Multi-Paragraph Margin Notes (2026-01-07)
- Fixed HTML structure (block elements can't nest in inline)
- Convert `<p>` → `<span class="mn-p">`, `<blockquote>` → `<span class="mn-blockquote">`
- CSS makes spans display as blocks with proper styling
- Updated emailifyMarginNotes filter to handle span structure

### ✅ Mobile Layout (2026-01-07)
- Fixed CSS cascade conflicts (display: block vs display: none)
- Reset absolute positioning on mobile
- Removed character-based measure on narrow viewports
- Clean visual hierarchy for toggled notes

### ✅ Accessibility (2026-01-07)
- Semantic `<button>` elements for margin note triggers
- ARIA attributes (aria-expanded, aria-controls, role="note")
- Keyboard navigation (Space/Enter to toggle)
- Focus management for expanded notes
- `.visually-hidden` class for screen reader announcements
- Fixed Space key bug (was capturing globally instead of only on triggers)

### ✅ Figure Captions (2026-01-07)
- Positioned outside bottom-right corner of image (touching, no gutter)
- Uses `display: inline-block; width: fit-content` on figure to shrink-wrap
- Typography matches margin notes (font-mn, 0.85rem, line-height 1.5)
- Mobile: degrades to centered caption below image

---

## In Progress

### Design Polish
- [ ] **Margin note anchor wrapping**: When anchor text wraps, note aligns with first line instead of the superscript marker on the last line. Needs JavaScript solution to calculate marker position.
- [ ] **Mobile font sizes for poetry**: Preformatted text may cause horizontal scroll on narrow viewports
- [ ] **Dark mode testing**: Verify all components render correctly

---

## Content Migration

### Post Format Migration (Optional)
9 posts still use old `<aside>` HTML format from Substack imports:
- [ ] tao-yuanming-home-again
- [ ] tao-yuanming-reads-on-a-summer-evening
- [ ] the-emperor-s-so-called-cats-and-the-manjurist-bat-signal
- [ ] the-five-virtues-of-the-cat
- [ ] the-naming-of-cats-and-an-offering
- [ ] too-much-party
- [ ] two-poems-for-a-rainy-sunday
- [ ] unidentified-flying-object-seen-over-yangzhou
- [ ] yo-man-mo-yan

Both formats work correctly; migration is for code consistency only.

---

## Infrastructure

### Publishing Workflow
- [ ] **Buttondown integration**: Test email rendering with complex margin notes
- [ ] **Publishing script**: Review and document `scripts/publish-workflow.mjs`

### Social/Comments
- [ ] **Bluesky integration**: Infrastructure exists in `_config/bluesky-comments.js` but incomplete
- [ ] **Mastodon integration**: Consider for fediverse commenting

### Search & SEO
- [ ] **Pagefind tuning**: Working but could be optimized
- [ ] **SEO audit**: Meta tags, Open Graph, structured data

### CMS
- [ ] **Decap CMS authentication**: Currently uses git-gateway; needs setup for production
- [ ] For local dev: uncomment `local_backend: true` in admin/config.yml

---

## Future Enhancements

### Poem Shortcode
- [ ] Support for poems with only one language
- [ ] Alternative layout options (interleaved lines, columnar fanti)
- [ ] Optional source/attribution field

### Developer Experience
- [ ] **Safe start script**: Created `scripts/safe-start.sh` to prevent duplicate Eleventy processes
- [ ] Consider adding to npm scripts

### Consolidate Styles
- [ ] `fn-marker` and `mn-marker` could share CSS (both are superscripted numerals)

---

## Documentation

- [ ] **MOBILE.md**: Create mobile-specific design considerations guide
- [ ] **WORKFLOW.md**: Update if process changes needed

---

## Notes for Future Agents

1. **Always use `scripts/safe-start.sh`** instead of `npm start` to avoid duplicate Eleventy processes.

2. **Test both desktop AND mobile** after any CSS changes. The 1024px breakpoint is critical.

3. **Read SHORTCODES.md** before modifying the margin note system - it's complex but well-documented.

4. **Figure captions require `display: inline-block; width: fit-content`** on `.fig-margin` to shrink-wrap to image size.

5. **Keyboard handlers must check target BEFORE `preventDefault()`** - we had a bug where Space was captured globally.

6. **If builds are slow**, check for zombie processes: `ps aux | grep eleventy`

---

*Last updated: 2026-01-07*
