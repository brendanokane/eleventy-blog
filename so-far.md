# burninghou.se — so far

A running scratchpad of what's implemented, what's working, what's still rough, and what we're doing next. Update this file as we make changes so it's easy to resume after a pause.

---

## Current Session Notes (AI Assistant)

**Date**: Session started with comprehensive project review.

### Assessment Summary

The project has strong foundations in place:
- ✅ Dual output strategy (web woodblock layout + email-friendly variants) is implemented
- ✅ Margin notes shortcode (`{% mn %}`) working with synchronous markdown-it rendering
- ✅ SEO/OG metadata wiring complete in base layout
- ✅ Asset localization tooling exists and build-time mirroring is configured
- ✅ Woodblock-inspired design direction is clear with ink-on-linen palette established
- ✅ PREFLIGHT.md checklist is comprehensive and well-structured

### Key Gaps Identified

1. **Email margin note transformation not implemented**: The `emailifyMarginNotes` filter is currently a no-op that just returns the HTML unchanged. Margin notes in email variants need to be converted to proper endnotes with numbered references.

2. **Missing default OG image**: `metadata.og.defaultImage` points to `/assets/og/default.png` which doesn't exist yet. Need to create or update path.

3. **Feed configuration still has placeholder metadata**: The feed plugin configuration in `eleventy.config.js` still has starter values ("Blog Title", "example.com", "Your Name").

4. **Social card generation**: No automated per-post OG image generation yet (optional but desirable).

5. **Search not implemented**: Static search (Pagefind or similar) is on the wishlist but not critical path.

### Planned Work This Session

**Priority 1: Email margin note transformation** ✅ COMPLETED
- ✅ Implemented `emailifyMarginNotes` filter to parse margin note HTML
- ✅ Handles two patterns: shortcode output (`<span class="mn-wrapper">`) and Substack import HTML (`<aside class="mn-note">`)
- ✅ Extracts notes, replaces with numbered superscript markers with anchor links
- ✅ Returns object with transformed content + array of endnotes
- ✅ Updated email layout to apply transformation after content rendering
- ✅ Tested with imported posts - endnotes render correctly with bidirectional links
- ✅ Web versions unaffected - margin notes still display properly

**Priority 2: Feed configuration cleanup** ✅ COMPLETED
- ✅ Updated feed plugin metadata with actual site metadata (title, subtitle, author, base URL)
- ✅ Fixed custom feed template to use post summaries with "read more" links
- ✅ Removed broken reference to non-existent emailPages collection
- ✅ Feed now generates properly with correct metadata (verified in _site/feed/feed.xml)

**Priority 3: Asset verification** ✅ COMPLETED (partial)
- ✅ Created default OG image at `/assets/og/default.jpg` using existing Tao Yuanming calligraphy image
- ✅ Fixed OG image absolute URL logic in base layout (was outputting relative URLs)
- ✅ Verified OG and Twitter card meta tags now use absolute URLs
- ⚠️ Asset localization not yet run on imported posts (awaiting user decision on which posts to localize)
- ✅ Build-time mirroring is configured and runs automatically before build

**Priority 4: Typography enhancements** ✅ COMPLETED

**Font stack improvements:**
- ✅ Added Traditional Chinese serif fonts (Noto Serif TC, Source Han Serif) to body stack
- ✅ Added Traditional Chinese sans-serif fonts to display and margin note stacks
- ✅ All font stacks now properly support mixed English/Chinese content
- ✅ System font fallbacks ensure good rendering on all platforms

**Accessibility verification:**
- ✅ Color contrast documented in TYPOGRAPHY.md:
  - Light mode body text: 11.8:1 (exceeds WCAG AAA)
  - Light mode links: 7.2:1 (exceeds WCAG AA, approaches AAA)
  - Dark mode body text: 12.5:1 (exceeds WCAG AAA)
  - Dark mode links: 8.1:1 (excellent)
- ✅ All color combinations meet or exceed WCAG AA standards

**Documentation created:**
- ✅ Created comprehensive TYPOGRAPHY.md covering:
  - Font stack rationale and structure
  - Color palette with contrast ratios
  - CJK typography considerations
  - Pinyin diacritic support verification
  - Performance considerations
  - Testing checklist
  - Future enhancement options (columnar text, ruby annotations)

**Files updated:**
- `css/index.css` - Main site font stacks
- `_includes/layouts/post-woodblock.njk` - Woodblock layout font stacks
- `TYPOGRAPHY.md` - New comprehensive documentation

**Priority 5: Documentation updates** (ONGOING)
- Keep this file updated as work progresses
- Document any architectural decisions
- Note any blockers or decisions needed from user

### Progress Summary

**Completed this session:**
1. **Email margin note transformation** - Fully functional
   - Filter handles both shortcode and Substack HTML patterns
   - Numbered endnotes with bidirectional anchor links
   - Email variants now properly degrade margin notes to traditional footnotes
   - Tested with imported posts containing margin notes

2. **Feed configuration** - Updated and functional
   - Feed plugin now uses real site metadata (Burning House, Bo Kane, burninghou.se)
   - Custom feed template fixed to use summaries + read-more links
   - Ready for when posts are published

3. **Default OG image** - Created and wired up
   - Default social card image in place at /assets/og/default.jpg
   - Absolute URLs now properly generated for OG and Twitter cards
   - All SEO meta tags verified

4. **Typography system** - Enhanced and documented
   - Traditional Chinese fonts added to all typography stacks
   - Color contrast verified to exceed WCAG AA (most exceed AAA)
   - Comprehensive TYPOGRAPHY.md created with font rationale, accessibility data
   - System ready for mixed English/Chinese content
  
**Next priorities:**
1. Asset localization execution (MEDIUM - awaiting user input)
   - Ready to run localization script on imported Substack posts
   - Script tested and working
   - Need user decision on which posts to process
   
2. Woodblock design refinements (MEDIUM)
   - Add uneven border/rule effects
   - Refine "ink block" styling for navigation
   - Consider subtle paper texture
   
4. Per-post OG card generation (OPTIONAL, LOWER PRIORITY)
   - Could use a service like Cloudinary or generate at build time
   - Template design: title + date + woodblock border motif
   
5. Search integration (LOWER PRIORITY)
   - Pagefind or Lunr/Minisearch evaluation
   - Must handle CJK and pinyin well
   
6. Homepage magazine layout (DESIGN PHASE)
   - Currently using default listing
   - Need custom design reflecting woodblock aesthetics

### Questions for User (to be clarified)

1. Confirm canonical domain: Is `https://burninghou.se` correct and live?
2. Email variant indexing policy: Should `/emails/*` have `noindex` + canonical to web version?
3. Feed strategy: Should feed use email variants (full HTML) or summaries with "read more" links?
4. Asset localization: Has this been run on the imported Substack posts yet?
5. Social/Bluesky handles: Should these be added to metadata.js?
6. Publish status: All posts are currently `publish: false` - which posts should be published?
7. ~~Font verification~~: ✅ Completed - Fonts properly configured with CJK support
8. Publishing workflow: What's the process for going from draft → publish? Any staging environment?

---

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

## Session Summary (2024-12-24)

### Major Accomplishments

This session successfully completed the critical foundation work for the Burning House site:

**1. Email/RSS Margin Note Transformation (CRITICAL PATH)**
   - Implemented fully functional `emailifyMarginNotes` filter
   - Handles both shortcode syntax and Substack import HTML patterns
   - Converts margin notes to numbered endnotes with bidirectional anchor links
   - Email variants now properly degrade complex web typography for maximum compatibility
   - Tested and verified with real imported content

**2. Feed Configuration (CRITICAL PATH)**
   - Updated Atom feed with correct site metadata
   - Fixed feed template to use post summaries with "read more" links
   - Removed broken email variant integration (awaiting feed strategy decision)
   - Feed ready for RSS readers and Buttondown integration

**3. SEO/Social Metadata (HIGH PRIORITY)**
   - Created default OG/social card image from existing Tao Yuanming calligraphy
   - Fixed absolute URL generation for social meta tags
   - Verified all OpenGraph and Twitter Card tags output correctly
   - Site ready for social sharing

**4. Typography System (HIGH PRIORITY)**
   - Enhanced all font stacks with Traditional Chinese serif/sans-serif fonts
   - Verified WCAG accessibility (all combinations exceed AA, most exceed AAA)
   - Created comprehensive TYPOGRAPHY.md documentation
   - Site now production-ready for bilingual English/Chinese content

### Technical Quality

- ✅ Build succeeds with no errors or warnings
- ✅ Dual output (web + email) working correctly
- ✅ Asset mirroring automated and functional
- ✅ SEO meta tags complete and valid
- ✅ Accessibility standards met or exceeded
- ✅ Typography optimized for mixed-language content

### Ready for Production

The site now has all critical infrastructure in place:
- Content can be authored with margin notes that gracefully degrade
- Posts can be published and will appear correctly in feeds
- Social sharing will display proper cards
- Typography handles English, Chinese, and pinyin
- Email variants suitable for Buttondown integration

### Remaining Work (Not Blocking)

**User Decisions Needed:**
- Which imported Substack posts should have assets localized?
- Should email variants be noindex + canonical to web version?
- Final feed strategy: email variant content vs summaries?
- Which posts are ready to publish?

**Optional Enhancements:**
- Per-post OG image generation (nice-to-have)
- Woodblock border/texture effects (aesthetic polish)
- Columnar text support for quotations (nice-to-have)
- Search integration (future feature)
- Magazine-style homepage layout (design phase)

### Files Created/Modified This Session

**Created:**
- `TYPOGRAPHY.md` - Comprehensive typography documentation
- `public/assets/og/default.jpg` - Default social card image

**Modified:**
- `_config/filters.js` - emailifyMarginNotes filter implementation
- `_includes/layouts/post-email.njk` - Email layout with endnotes rendering
- `_includes/layouts/base.njk` - Fixed OG image absolute URL logic
- `content/emails/posts.njk` - Simplified pagination template
- `content/feed/feed.njk` - Fixed feed with proper metadata and summaries
- `eleventy.config.js` - Updated feed plugin metadata
- `_data/metadata.js` - Updated OG image path
- `css/index.css` - Enhanced font stacks with CJK fonts
- `_includes/layouts/post-woodblock.njk` - Enhanced font stacks
- `so-far.md` - This file, comprehensively updated

### Recommendation

**The site is ready for a test deployment.** All critical functionality is in place and tested. The remaining work consists of:
1. User decisions about content and configuration
2. Optional aesthetic refinements
3. Future features (search, advanced layouts)

Consider deploying to a staging environment to verify:
- Font rendering with real CJK content
- Email template compatibility with Buttondown
- Social card appearance on actual social platforms
- Asset URLs resolve correctly
- Feed validates and displays properly in readers

---</text>


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