# burninghou.se / eleventy-blog — so far

A running scratchpad of what’s implemented, what’s working, what’s still rough, and what we’re doing next.

Last updated: 2025-12-24

---

## Canonical working copy / repo

- Repo: `https://github.com/brendanokane/eleventy-blog`
- Current working branches in play:
  - `woodblock-theme-and-import` (import + plumbing)
  - `design/ink-linen-nav-typography` (ink-on-linen styling)

Local work should be done in `~/Code/eleventy-blog`.

---

## What we have working

### Substack import + local assets
- Posts are folder-per-post under `content/blog/<slug>/index.md`.
- Images have been localized and verified:
  - Per-post assets live at `content/blog/<slug>/assets/*`.
  - Post content references assets with blog-less URLs: `/<slug>/assets/<file>`.
  - A verification script run showed `missing: 0` for referenced `/<slug>/assets/...` files.
- Remote Substack CDN images:
  - A script (`_config/localize-substack-images.mjs`) downloads `substackcdn` images into per-post assets and rewrites refs.
  - Note: Substack “linked images” may still have outer links pointing to remote URLs; can be fixed later.

### Blog-less asset URLs (static-friendly)
- We keep blog-less asset URLs (`/<slug>/assets/...`) while storing sources under `content/blog/<slug>/assets/...`.
- To make this work on static hosting, we use a build-time mirroring step:
  - Mirror: `content/blog/<slug>/assets/**` → `content/<slug>/assets/**`
  - This produces built output at `/_site/<slug>/assets/**`.
- Mirroring script: `_config/mirror-post-assets.mjs`

### Build stability fixes
- Feed conflict resolved:
  - plugin feed now writes to `/feed/plugin.xml`
  - custom feed template writes to `/feed/feed.xml`
- Email template filter:
  - `emailifyMarginNotes` filter exists (currently no-op) so `/emails/posts/` can render.
- Date filters hardened:
  - `_config/filters.js` date filters now tolerate JS `Date` vs Luxon `DateTime` to avoid `toFormat` crashes.

### Current build/start scripts
- `npm run build` works.
- `npm run start` works, with `assets:mirror` in the start pipeline (organizer removed from hot path).

---

## Design work in progress

### Ink-on-linen design direction
- Target look:
  - very dark purple/brown “ink” on warm linen background
  - unvisited link underlines in dark vermillion
  - high readability priority
- Current design branch: `design/ink-linen-nav-typography`
  - simplified nav: Home / Archive / About
  - ink-block nav styling
  - linen-ish background gradient
  - body typography tuned (Alegreya, weight 500)

### Fonts
- Adobe Fonts kit in use: `https://use.typekit.net/jtc7wrn.css`
- Alegreya Medium (body weight ~500) is desired.
- Adobe Aldine is desired for titles.
- Current issue:
  - Aldine did not apply initially due to incorrect font-family name.
  - Devtools reported Aldine family available as: `adobe-aldine-variable`.
  - A fix PR exists to switch the CSS display family to `adobe-aldine-variable`, but local checkout still showed the old stack (needs merge/pull verification).

---

## Known issues / rough edges

1) `/emails/posts/` page inlines `post.templateContent`, which can include duplicate margin-note IDs (e.g. `mn-1`) across multiple posts.
   - Workaround used: comment out the inlined content for now.
   - Proper fix later: make `/emails/posts/` a link-only index, or truly “emailify” margin notes to unique IDs/endnotes.

2) Asset scripts:
   - `assets:organize` is now effectively a one-time migration tool and should not run on every start/build.
   - `assets:mirror` is still required if we keep blog-less asset URLs on static hosting (unless we switch to host-level rewrites).

3) Some Substack linked images still link to remote CDN URLs on click (outer anchor not rewritten). Not urgent.

---

## Next steps

### Immediate (next session)
1) Get Aldine working:
   - Merge/pull the CSS change that sets `--font-display: "adobe-aldine-variable"`.
   - Confirm in devtools: `getComputedStyle(h1).fontFamily` includes `adobe-aldine-variable`.

2) Tighten typography + hierarchy:
   - Ensure body at 500 feels right across pages.
   - Make post titles “noticeable but calm” (weight/size/spacing).

3) Post header layout with optional title image:
   - Add optional frontmatter: `headerImage: /path/to/image.jpg`
   - Default: image left, title right; no-image: full-width title.
   - (A PR exists for this on a different design branch; decide whether to adopt it into the current design branch.)

### Near-term design tasks
- Magazine-style homepage layout (featured + recent grid + sections).
- Woodblock motifs:
  - heavier rules/borders for content block
  - subtle ink “spread” effects (without harming readability)
- Navigation polish:
  - add search placeholder UI in nav (functionality later)

### Later
- Real `emailifyMarginNotes` implementation (margin notes → endnotes for email/RSS)
- Decide final feed strategy (likely email-variant-derived)
- OG/social card images generation

---

## Useful commands

- Serve:
  - `npm run start`

- Mirror assets (blog-less URLs):
  - `npm run assets:mirror`

- Localize Substack CDN images:
  - `npm run assets:localize`

- Debug font loading:
  - In devtools:
    - `getComputedStyle(document.querySelector('h1')).fontFamily`
    - `getComputedStyle(document.body).fontWeight`
    - `[...document.fonts].map(f => f.family).filter((v,i,a)=>a.indexOf(v)===i).sort()`
