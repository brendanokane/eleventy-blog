# Project Status — Burning House

Simple session recovery document. Updated at end of each session.

---

## Current State (2026-01-04)

### What Works
- ✅ Blog builds and deploys successfully
- ✅ Margin notes work (both HTML and shortcode formats)
- ✅ Email variants generate correctly
- ✅ Buttondown integration functional
- ✅ Typography and styling complete

### Active Work
- Consolidating documentation (removing stale/aspirational docs)
- Simplifying project tracking (removed beads)

### Known Issues
- **Margin note format inconsistency**: 1 post uses `{% mn %}` shortcode, 15 posts use raw HTML from Substack imports
  - **Decision**: Leave as-is for now (both formats work)
  - **Future**: Could convert HTML → shortcode, but requires careful, character-perfect edits

### Next Steps
- Test margin note alignment after recent CSS changes
- Consider whether to convert HTML margin notes to shortcode format
- Routine: write and publish posts

### Blocked/Waiting
- None currently

---

## Recent Changes

### 2026-01-04
- Removed beads workflow (overhead without benefit for solo project)
- Created WORKFLOW.md (consolidated PUBLISHING.md, QUICK-REFERENCE.md, PREFLIGHT.md)
- Created STATUS.md (this file) for simple session recovery
- Archived aspirational docs (CMS-EVALUATION.md, BLUESKY-INTEGRATION.md not yet implemented)

---

## Documentation Map

**Active docs** (check these first):
- `WORKFLOW.md` — Commands, publishing flow
- `STATUS.md` — This file, current state
- `README.md` — Project overview, setup

**Reference docs**:
- `TYPOGRAPHY.md` — Font system details
- `WOODBLOCK-AESTHETIC.md` — Design rationale
- `VIEWING-GUIDE.md` — How to view the site

**Archived docs** (can ignore):
- `CMS-EVALUATION.md` — CMS options (not implemented)
- `BLUESKY-INTEGRATION.md` — Bluesky comments (not implemented)
- `PREFLIGHT.md` — Merged into WORKFLOW.md
- `PUBLISHING.md` — Merged into WORKFLOW.md
- `QUICK-REFERENCE.md` — Merged into WORKFLOW.md
- `LEISHU-DESIGN.md`, `METADATA-SCHEMA.md` — Design exploration
- `so-far.md`, `venting.md`, `HANDOFF.md` — Session notes

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
