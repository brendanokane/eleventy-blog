---
title: "Import Instructions (Substack/BHArchive)"
draft: true
publish: false
permalink: false
eleventyExcludeFromCollections: true
---

This file documents the one-off Substack import that created `content/blog/<slug>/index.md` posts.

- Source: `BHArchive/*.md`
- Import script: `scripts/import-substack.mjs`
- All imported posts are created with:
  - `draft: true`
  - `publish: false`
  - `bluesky_thread:` empty

To re-run the import locally:

- Run `node scripts/import-substack.mjs`

If you re-run, it will overwrite `content/blog/<slug>/index.md`.
