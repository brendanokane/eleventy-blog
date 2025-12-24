# Preflight — Publishing + Substack Import Checklist

This checklist is designed to make each post/issue publishable without surprises, and to keep the Substack import consistent over time.

Use it in two phases:
1) **Import/Rewrite phase** (local completeness + correctness)
2) **Publish phase** (site correctness + metadata + feeds + social sharing)

---

## A. Import / Local Organization (Substack → Eleventy)

### A1. Post exists and is correctly located
- [ ] Post lives at `content/blog/<slug>/index.md` (folder-per-post).
- [ ] `<slug>` matches the intended canonical URL:
  - web: `/<slug>/`
  - email variant: `/emails/<slug>/`

### A2. Frontmatter baseline (required)
- [ ] `title`: present and final.
- [ ] `date`: present and correct (timezone consistent).
- [ ] `publish`: set appropriately (`false` during import/edits; `true` when ready).
- [ ] `layout`: set to the intended post layout (woodblock layout for web).
- [ ] `tags`: present if you rely on tag pages/collections.

### A3. Frontmatter metadata (recommended for quality)
- [ ] `summary` (1–2 sentences): present (used for SEO, sharing, listings, feeds).
- [ ] `description` (optional override): present if summary ≠ description.
- [ ] `canonical_url` (optional): set if you want to preserve Substack canonical URL or another canonical.
- [ ] `og_image` (optional): set if you’re overriding the default OG image.
- [ ] `og_image_alt` (recommended if `og_image` present).
- [ ] `og_title` / `og_description` (optional overrides).
- [ ] `robots` (optional override): e.g. `noindex,follow` for email variants.

### A4. Content integrity and rewrites
- [ ] Remove/replace Substack-specific cruft:
  - [ ] “Subscribe” widgets/CTAs that don’t apply
  - [ ] “Like/comment on Substack” CTAs
  - [ ] Substack-only footers/headers
- [ ] Internal links:
  - [ ] Rewrite links pointing to Substack posts to the new site URLs where possible.
  - [ ] If you keep Substack canonical URLs, ensure they don’t conflict with your internal linking strategy.
- [ ] Embeds:
  - [ ] Replace Substack embeds with durable equivalents (plain links or local embeds).
  - [ ] Confirm iframes are allowed/desired (many email clients strip them).

---

## B. Images and Media (Durable + Optimized)

### B1. Image source policy decision (must be consistent)
Choose one (prefer local):
- [ ] **Local-first**: download Substack CDN images and rewrite to local paths.
- [ ] **Remote allowed**: keep Substack CDN URLs (accept that transforms/resizing may not apply consistently, and external images may break later).

### B2. If local-first: store images predictably
- [ ] Images are stored locally in a predictable location, e.g.:
  - per-post: `content/blog/<slug>/assets/*`
  - or global: `content/assets/*` (hashed filenames)
- [ ] References in content are updated to the local path.

### B3. Accessibility + semantics
- [ ] Every meaningful image has `alt` text.
- [ ] Decorative images use empty alt (`alt=""`) if appropriate.
- [ ] Captions (if needed) use semantic markup (`<figure><figcaption>` or equivalent).

### B4. Responsive image output verification
- [ ] Confirm that built HTML outputs appropriate `srcset`/formats (e.g. AVIF/WebP fallbacks) for local images.
- [ ] Verify at least one representative post after import:
  - [ ] local images are transformed as expected
  - [ ] remote images behave as expected (if allowed)

---

## C. Web Post Rendering (Woodblock Layout Quality)

### C1. Margin notes / pull quotes
- [ ] Margin notes render correctly in web layout:
  - [ ] no broken inline flow
  - [ ] no invalid nesting (e.g. block inside inline where it shouldn’t be)
- [ ] Pull quotes render as intended (or intentionally omitted).

### C2. Typography + layout regressions
- [ ] No overflow in the margin rail on common viewport widths.
- [ ] CJK + diacritics render correctly (no missing glyphs, bad line breaks).
- [ ] Headings look correct and anchors don’t break layout.

---

## D. Email Variant Rendering (Feed/Email-Friendly)

### D1. URL + intent
- [ ] Email variant is accessible at `/emails/<slug>/`.
- [ ] Email variant is simpler than web version:
  - [ ] margin notes become endnotes/footnotes
  - [ ] pull quotes omitted or simplified

### D2. Email-friendly HTML
- [ ] Structure is semantic and robust:
  - [ ] headings are real headings
  - [ ] lists are lists
  - [ ] code blocks render acceptably
- [ ] Footnotes/endnotes are usable:
  - [ ] numbered links from marker → endnote
  - [ ] backlinks endnote → marker (where feasible)

### D3. Indexing policy for email variants
Decide and enforce one:
- [ ] Email variants are **noindex** and canonicalize to web post (common choice).
- [ ] Email variants are indexed (less common; requires careful canonical strategy).

---

## E. SEO / OpenGraph / Social Cards

### E1. Required metadata
- [ ] `<title>` is correct and not placeholder.
- [ ] `<meta name="description">` is populated and not empty.
- [ ] `<link rel="canonical">` points to the intended canonical URL.

### E2. OpenGraph checks
- [ ] `og:title`, `og:description`, `og:url` correct.
- [ ] `og:image` resolves (absolute URL) and is valid.
- [ ] `og:image:alt` present (recommended).

### E3. Twitter cards checks
- [ ] `twitter:card` is correct (`summary_large_image` when image exists).
- [ ] `twitter:title`, `twitter:description` correct.
- [ ] `twitter:image` resolves.

### E4. Social card generation status
- [ ] If you’re generating per-post OG images:
  - [ ] The image exists and is referenced by `og_image` (or computed default).
  - [ ] The image is stable and deterministic (no build-time randomness unless intentional).

---

## F. Feeds (Buttondown / Syndication)

### F1. Feed source of truth decision (must be consistent)
- [ ] Feed content comes from **email variants** (recommended for newsletters), OR
- [ ] Feed is summaries + “Read on web” links.

### F2. Feed entry checks (for this post)
- [ ] Post appears in the correct feed(s) when `publish: true`.
- [ ] Feed entry contains:
  - [ ] correct title
  - [ ] correct URL
  - [ ] correct date
  - [ ] correct content (or summary) and does not break feed readers
- [ ] Images in feed are either absolute URLs or handled in a reader-safe way.

---

## G. Publish Gate

### G1. Final flip to publish
Before setting `publish: true`:
- [ ] All items in sections A–F are satisfied (or explicitly waived).
- [ ] One last read-through on:
  - [ ] web post
  - [ ] email variant
  - [ ] homepage/listing appearance (title/summary/date)

### G2. Optional discussion thread (later)
- [ ] If using Bluesky comments later:
  - [ ] `bluesky_thread` present (if required)
  - [ ] “Discuss” link renders on web post

---

## H. Waivers (document exceptions)
If you knowingly skip an item (e.g. leaving remote images), record it here for the post:

- Post slug:
- Waived items:
- Reason:
- Follow-up task:

---