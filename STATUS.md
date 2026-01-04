# Project Status — Burning House

Simple session recovery document. Updated at end of each session.

---

## Current State (2026-01-04)

### What Works
- ✅ Blog builds and deploys successfully
- ✅ **Margin notes work perfectly** (both HTML and shortcode formats, desktop + mobile)
- ✅ Email variants generate correctly
- ✅ Buttondown integration functional
- ✅ Typography and styling complete
- ✅ Documentation consolidated and accurate

### Active Work
- None currently - margin note positioning issue resolved!

### Known Issues
- **Margin note format inconsistency**: 1 post uses `{% mn %}` shortcode, 15 posts use raw HTML from Substack imports
  - **Status**: Both formats work correctly now
  - **Optional future work**: Convert HTML → shortcode for consistency, but requires character-perfect edits

### Next Steps
- Write and publish posts
- Optionally convert HTML margin notes to shortcode format (when ready)

### Blocked/Waiting
- None currently

---

## Recent Changes

### 2026-01-04 (Session 2) - Margin Note Positioning Fix
**Problem solved**: Shortcode-generated margin notes (`{% mn %}`) were misaligned on desktop
- First note overlapped main text (too far left)
- Second note positioned too high (wrong vertical alignment)

**Root cause**: Shortcode generates nested HTML structure:
```html
<span class="mn-ref">           <!-- inline wrapper -->
  <span class="mn-anchor">...</span>
  <span class="mn-note">...</span>
</span>
```

`.mn-ref` had `position: relative`, making `.mn-note` (with `position: absolute`) position relative to that tiny inline span, not the full `.post-body`.

**Solution** (two-part fix):
1. **CSS change** (`css/index.css`): On desktop (>= 768px), set `.mn-ref { position: static; }` instead of `relative`. This makes notes position relative to `.post-body` (which has `position: relative`).

2. **JavaScript change** (`_includes/layouts/base.njk`): Calculate position based on the actual anchor/marker element, not the `.mn-ref` wrapper:
   ```javascript
   // OLD: var refRect = ref.getBoundingClientRect();
   // NEW: 
   var anchor = ref.querySelector('.mn-anchor, .mn-marker, .mn-anchor-num');
   var anchorRect = anchor.getBoundingClientRect();
   ```

**Why this works**:
- Desktop: Notes position absolute relative to `.post-body`, JavaScript calculates vertical offset from marker position
- Mobile: `.mn-ref` keeps `position: relative`, notes toggle inline (unchanged behavior)
- Both shortcode and HTML formats now work identically

**Result**: Perfect alignment on both desktop and mobile! 🎉

### 2026-01-04 (Session 1) - Documentation Cleanup
- Removed beads workflow (overhead without benefit for solo project)
- Created WORKFLOW.md (consolidated PUBLISHING.md, QUICK-REFERENCE.md, PREFLIGHT.md)
- Created STATUS.md (this file) for simple session recovery
- Archived aspirational docs (CMS-EVALUATION.md, BLUESKY-INTEGRATION.md not yet implemented)

---

## Documentation Map

**Active docs** (check these first):
- `STATUS.md` — This file, current state and recent fixes
- `WORKFLOW.md` — Commands, publishing flow
- `README.md` — Project overview, setup

**Reference docs**:
- `TYPOGRAPHY.md` — Font system details
- `WOODBLOCK-AESTHETIC.md` — Design rationale
- `VIEWING-GUIDE.md` — How to view the site

**Archived docs** (in `docs-archive/`, gitignored):
- CMS-EVALUATION.md, BLUESKY-INTEGRATION.md (not implemented)
- PREFLIGHT.md, PUBLISHING.md, QUICK-REFERENCE.md (merged into WORKFLOW.md)
- LEISHU-DESIGN.md, METADATA-SCHEMA.md (design exploration)
- HANDOFF.md (old session notes)

**Working notes**:
- `so-far.md` — Scratch notes, project thinking
- `venting.md` — Private debug frustrations (never shown to humans)

---

## Technical Notes

### Margin Note Implementation Details

**Two formats supported** (both work identically now):

1. **Shortcode format** (recommended for new content):
   ```markdown
   Text with note.{% mn "anchor text" %}
   Note content with *markdown*.
   {% endmn %}
   ```
   Generates nested structure with `.mn-ref` wrapper.

2. **HTML format** (Substack imports):
   ```html
   <sup class="mn-marker" data-mn-id="mn-1">※</sup>
   <aside class="mn-note" id="mn-1">Note content</aside>
   ```
   Generates sibling elements (no wrapper).

**Key implementation points**:
- Desktop: Notes positioned `absolute` relative to `.post-body`, JavaScript calculates vertical alignment
- Mobile: Notes hidden by default, toggle inline on tap
- Breakpoint: 768px
- JavaScript required for desktop alignment
- CSS-only fallback on mobile

---

## Session Close Checklist

Before ending a session:

```bash
# 1. Update this STATUS.md file with current state

# 2. Check what changed
git status

# 3. Stage and commit changes
git add <files>
git commit -m "Session end: <brief summary>"

# 4. Push to remote
git push
```

---

Last updated: 2026-01-04
