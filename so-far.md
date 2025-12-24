# burninghou.se — so far

A running scratchpad of what’s implemented, what’s working, what’s still rough, and what we’re doing next. Update this file as we make changes so it’s easy to resume after a pause.

## IMPORTANT: Active working copy / project root

Right now the “real” imported Substack content is located under:

- `~/Code/eleventy-blog/content/blog/`

This repository copy at:

- `~/Code/burninghou.se/`

may not include the imported corpus, which means scripts like asset localization will scan only the starter/demo posts unless you run them against `~/Code/eleventy-blog`.

When running scripts from outside the active project root, use `npm --prefix` to target the correct folder.

---

## Current goal / focus

1. **Finish local organization + completeness of the Substack import** (content and assets; organize locally; do rewrites as needed).
2. **Ensure images are handled automatically** (responsive `srcset`/formats/resizing) and that Substack assets are localized per-post where possible.
3. **Add OG/SEO metadata and social cards** with sensible defaults + per-post overrides.
4. **Add a preflight checklist** to standardize publishing and reduce regressions.
5. Start planning/designing:
   - magazine-style homepage
   - woodblock-inspired design elements (nav blocks, uneven ink borders/rules)
   - typography improvements on entry pages
   - search and nav integration
6. Comments (Bluesky) later.
7. Email template: likely constrained by Buttondown; keep `/emails/` output clean and robust.

---

## What exists and works

### Build + content structure
- Eleventy build is stable.
- Content is folder-based posts under:
  - `content/blog/<slug>/index.md`
- Web posts live at `/<slug>/` (no `/blog/` prefix).
- Email variants live at `/emails/<slug>/`.

### Dual output strategy (web vs email)
- Web version supports richer typography and advanced layout (margin notes, pull quotes).
- Email version is simplified and designed to be feed/email friendly:
  - margin notes are converted to footnotes/endnotes
  - pull quotes are omitted or simplified

### Margin notes shortcode
- Custom paired shortcode:
  - `{% mn "Anchor text" %}...markdown note content...{% endmn %}`
- Implemented synchronously using `markdown-it` rendering and stripping outer `<p>` wrappers for inline flow.
- There is also a basic `{% fn %}{% endfn %}` shortcode.

### Image pipeline (baseline)
- The project includes `@11ty/eleventy-img`.
- The config uses the **Eleventy Image Transform plugin** so Eleventy can transform `<img>` tags:
  - formats include `avif`, `webp`, and `auto`
  - lazy loading/async decoding defaults are set
  - `failOnError: false` (build won’t fail on image pipeline issues)
- Images are watched: `content/**/*.{svg,webp,png,jpg,jpeg,gif}`

> Note: We still need to verify that the current content is authored in a way that triggers the transform consistently (Markdown images vs raw `<img>`, local vs remote URLs) and decide how to handle Substack remote images.

### Blog-less asset URLs (implemented via build-time mirroring)
We want:
- Posts at: `/<slug>/` (blog-less)
- Assets referenced as: `/<slug>/assets/<file>` (blog-less)
- But source-of-truth assets live with the post at: `content/blog/<slug>/assets/<file>`

Eleventy passthrough copy preserves directory structure under `content/`, so `content/blog/<slug>/assets/*` would normally publish at `/blog/<slug>/assets/*`. To get blog-less asset URLs without moving source assets:

- We **mirror assets at build time only**:
  - Mirror from: `content/blog/<slug>/assets/**`
  - Mirror to: `content/<slug>/assets/**`
  - Resulting public URL: `/<slug>/assets/**`

This keeps authoring ergonomics (Obsidian/Typora-friendly per-post assets) while matching the blog-less URL scheme.

### Asset localization tooling (implemented)
- A localization script exists to download remote images into **per-post assets folders** and rewrite post content:
  - Script: `_config/localize-substack-images.mjs`
  - Output location: `content/blog/<slug>/assets/*`
  - Rewrites URLs in content to: `/<slug>/assets/<file>`
- Convenience scripts (run from the active project root, or use `--prefix`):
  - From inside `~/Code/eleventy-blog`:
    - `npm run assets:localize:dry` (dry run)
    - `npm run assets:localize` (download + rewrite)
    - `npm run assets:localize:all:dry` (all remote images; dry run)
    - `npm run assets:localize:all` (all remote images)
  - From anywhere (targets the active project root explicitly):
    - `npm --prefix ~/Code/eleventy-blog run assets:localize:dry`
    - `npm --prefix ~/Code/eleventy-blog run assets:localize`
    - `npm --prefix ~/Code/eleventy-blog run assets:localize:all:dry`
    - `npm --prefix ~/Code/eleventy-blog run assets:localize:all`
- Build-time mirroring script:
  - Script: `_config/mirror-post-assets.mjs`
  - Run via: `npm run assets:mirror`
  - This runs automatically before `build`/`start`/`debug` scripts.
- Git ignores the generated mirror:
  - `content/*/assets/` is build output and should not be committed.

### Metadata + SEO/OG baseline (implemented)
- Global metadata lives at `_data/metadata.js` and has been updated from starter placeholders to real site defaults:
  - site title, author
  - canonical site URL baseline
  - social fields placeholders
  - OG defaults (including a default image path)
  - Twitter card defaults
- Base layout `_includes/layouts/base.njk` now supports:
  - canonical URL computation
  - OpenGraph tags (`og:*`)
  - Twitter cards (`twitter:*`)
  - robots meta
  - per-page/frontmatter overrides via fields like `canonical_url`, `og_image`, `og_title`, etc.

### Project scratchpad + checklist docs (implemented)
- This file (`so-far.md`) is the running resume point.
- A full checklist exists at `PREFLIGHT.md` for:
  - import/rewrites
  - images/media
  - web + email rendering checks
  - SEO/OG checks
  - feed checks
  - publish gating

---

## What’s incomplete / risky / needs verification

### Substack completeness + organization
- We should ensure we’ve captured:
  - all posts we want (including short notes if applicable)
  - titles/dates/slugs
  - canonical URLs if we care about SEO continuity
  - images/media embeds

### Asset localization (needs to run on real imported posts)
- The tooling is in place, but we need to run it against the imported Substack corpus and verify:
  - it finds the expected remote images (Substack CDN or otherwise)
  - downloads don’t get blocked (429s, hotlink protection, HTML error pages)
  - rewritten URLs resolve correctly in the built site
- Policy decision: **assets per-post** (consistent with Obsidian/Typora workflows), but **public URLs are blog-less** (`/<slug>/assets/...`) via build-time mirroring.

### Image optimization verification (important)
- The transform plugin is installed, but we still need to confirm:
  - which markup patterns in our content trigger transforms (Markdown `![]()` vs raw `<img>`)
  - whether transforms apply to local images only (likely) and what happens with remote images
  - whether we want explicit shortcodes for images (more control) vs relying on transforms

### Feeds
- There are two feed systems in play:
  - the starter feed plugin configured for `/feed/feed.xml` (still has starter metadata unless updated)
  - the desired Buttondown-friendly feed derived from **email variants**
- We need to settle on one strategy:
  - Option A: one canonical feed from email variants (recommended)
  - Option B: separate web feed (summaries) + email feed (full HTML)

### Social cards (images)
- Metadata wiring exists, but social card assets do not yet:
  - We need a default OG image at the configured path, or change the path.
  - We still need a per-post social card generation strategy (template-based, deterministic).

### Search + navigation
- Search not implemented.
- We want:
  - magazine-style top navigation bar
  - integrated search UI
  - likely a static search index (e.g. Pagefind) or build-time index (Lunr/Minisearch)
  - CJK/pinyin-friendly considerations

### Woodblock-inspired design system
- Direction is clear, but needs concrete implementation:
  - magazine-style front page layout
  - typography hierarchy and spacing system for entry pages
  - “uneven ink” motifs: heavy dark blocks for nav, uneven border rules around main text/margin rail
  - careful line-height/measure for mixed English + CJK + diacritics

### Buttondown templates (confirmed)
- Buttondown provides several email template “types”:
  - `classic`: plaintext-oriented template emphasizing content
  - `modern`: default HTML template
  - `naked`: email body is used directly with no Buttondown scaffolding
  - `plaintext`: literal plaintext only
- Source: https://docs.buttondown.com/api-emails-template
- Implication:
  - we can defer deep email template design; most effort should go into producing clean `/emails/` HTML that can be dropped into `naked` or survive the default template.
  - sanitization/stripping rules for RSS → email still need verification later.

---

## Preflight checklist
- See `PREFLIGHT.md` (source of truth).

---

## Next steps (concrete engineering tasks)

### 1) Run asset localization on real imported posts
Because the imported corpus lives in `~/Code/eleventy-blog/content/blog/`, run localization in that working copy.

- Dry-run first to see what will be changed:
  - from inside `~/Code/eleventy-blog`:
    - `npm run assets:localize:dry`
  - or from anywhere:
    - `npm --prefix ~/Code/eleventy-blog run assets:localize:dry`
- Then run actual localization:
  - from inside `~/Code/eleventy-blog`:
    - `npm run assets:localize`
  - or from anywhere:
    - `npm --prefix ~/Code/eleventy-blog run assets:localize`

After that:
- run a build (mirroring happens automatically before build/start):
  - from inside `~/Code/eleventy-blog`:
    - `npm run build`
  - or from anywhere:
    - `npm --prefix ~/Code/eleventy-blog run build`
- verify that assets resolve at `/<slug>/assets/<file>` in `_site`
- verify that Eleventy image transforms kick in where expected

### 2) Verify/adjust site URL + metadata defaults
- Confirm `metadata.url` is the real canonical domain.
- Decide whether email variants should:
  - `noindex,follow` + canonicalize to web post (common)
  - or be indexed (rare; requires careful canonical strategy)

### 3) Social card generation (first working version)
- Create a default OG image at `metadata.og.defaultImage` OR update config to point to a real file.
- Implement per-post OG image generation (simple, deterministic):
  - title + site name + date
  - woodblock-inspired border/rules (later)
- Wire default `og_image` to generated output when not explicitly set.

### 4) Feed strategy finalization (Buttondown-ready)
- Choose canonical feed source:
  - email variants (full HTML) OR summaries + link.
- Update feed metadata to non-placeholder values.

### 5) Search (after assets + feeds)
- Decide approach:
  - Pagefind (strong static UX) vs Lunr/Minisearch (custom control).
- Plan UI integration in top nav (design + keyboard UX).

### 6) Design work (parallel, but avoid breaking plumbing)
- Magazine-style homepage layout
- Woodblock visual language:
  - nav “ink blocks”
  - uneven border rules around main content/margin rail
  - restrained “paper” background texture if desired
- Entry page typography adjustments and spacing system.

---

## Known constraints / decisions
- Comments (Bluesky) are not in the critical path.
- Email template design is not in the critical path; Buttondown templates exist (`classic`/`modern`/`naked`/`plaintext`).
- Prefer durable, local assets over hotlinking to Substack CDN.

---

## Pointers (important files)
- Eleventy config: `eleventy.config.js`
- Base HTML layout (SEO/OG): `_includes/layouts/base.njk`
- Global metadata: `_data/metadata.js`
- Asset localization script: `_config/localize-substack-images.mjs`
- Build-time mirroring script: `_config/mirror-post-assets.mjs`
- Content: `content/blog/<slug>/index.md`
- Checklist: `PREFLIGHT.md`

---

## Open questions
1. Confirm canonical site URL (domain) for `metadata.url`.
2. Should `/emails/*` be `noindex` + canonicalize to `/<slug>/`?
3. Do we want to preserve Substack canonical URLs with redirects?
4. Desired OG card visual style (simple typographic vs woodblock border/paper).
5. Confirm RSS → email sanitization behavior in Buttondown (later).

---