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

### ✅ Bluesky Comments System (2026-01-07)
- Implemented hybrid static/dynamic comment system
- Server-side: `getBlueskyComments` filter fetches at build time via public Bluesky API
- Client-side: JavaScript checks for new comments and displays with "New" badge
- Graceful fallback if API unavailable
- Threaded comment display with depth-based indentation
- Shows author avatars, handles, timestamps, and engagement stats
- Mobile-responsive layout
- Included in post.njk layout, only renders if `bluesky_thread` is set in frontmatter
- See `_config/bluesky-comments.js` and `_includes/components/bluesky-comments.njk`

---

## In Progress

### Open Graph / Social Sharing
- [ ] **OG metadata implementation**: Add Open Graph tags for social sharing cards
- [ ] **Test OG cards**: Verify preview cards work on Bluesky, Twitter, etc.
- [ ] **Add OG metadata to existing posts**: Currently only fishing-for-snow has `post_image` and `post_image_alt`

### Bluesky Publishing Workflow
- [ ] **Create Bluesky posting script**: Script to create posts via Bluesky API with backdating support
- [ ] **Backfill old posts**: Once OG cards work, backfill Bluesky threads starting with "whats-good"
- [ ] **Store thread URLs**: Add `bluesky_thread` to frontmatter for backfilled posts
- [ ] **Environment setup**: Need `BLUESKY_HANDLE` and `BLUESKY_APP_PASSWORD` env vars

**Note:** Old Substack comments will be lost in migration to Bluesky comments, but that's unavoidable.

### Design Polish
- [ ] **Margin note anchor wrapping**: When anchor text wraps, note aligns with first line instead of the superscript marker on the last line. Needs JavaScript solution to calculate marker position.
- [ ] **Mobile font sizes for poetry**: Preformatted text may cause horizontal scroll on narrow viewports
- [ ] **Dark mode testing**: Verify all components render correctly
- [ ] **Replace emoji in comment stats**: Use glyphs or SVGs instead of ❤️💬🔄 (polish phase)

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

### Search & SEO
- [ ] **Pagefind tuning**: Working but could be optimized
- [ ] **SEO audit**: Meta tags, Open Graph, structured data

### CMS
- [ ] **Decap CMS authentication**: Currently uses git-gateway; needs setup for production
- [ ] For local dev: uncomment `local_backend: true` in admin/config.yml

---

## Bluesky Comments - Future Enhancements

Complete implementation plan for Bluesky-based commenting with reader-triggered archival.

### Overview

**Goal:** Display Bluesky thread replies as comments on blog posts, with automatic archival triggered by reader visits.

**Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│  Reader visits post                                         │
│         ↓                                                   │
│  Page renders with cached comments (from last archive)      │
│         ↓                                                   │
│  Client JS fetches fresh comments from Bluesky API          │
│         ↓                                                   │
│  If new comments: display them + POST to archive endpoint   │
│         ↓                                                   │
│  Cloudflare Worker writes to KV storage                     │
│         ↓                                                   │
│  Next build pulls from KV → bakes into static HTML          │
└─────────────────────────────────────────────────────────────┘
```

### Phase 1: Bluesky Backfill Script

**Goal:** Create Bluesky posts for all existing blog posts, backdated to original publish date.

**Files to create:**
- [ ] `scripts/bluesky-backfill.mjs` - One-time script to create backdated posts

**Implementation:**
```javascript
// scripts/bluesky-backfill.mjs
// 1. Authenticate with Bluesky API (app password)
// 2. Read all posts from content/blog/
// 3. For each post without a bluesky_thread:
//    - Create Bluesky post with title + URL
//    - Set createdAt to post's original date (backdating is allowed per Bluesky docs)
//    - Store returned thread URL
// 4. Write thread URLs to _data/bluesky-threads.json
```

**Data structure:**
```json
// _data/bluesky-threads.json
{
  "qiao-ji-explains-himself": "https://bsky.app/profile/you.bsky.social/post/abc123",
  "tao-yuanming-home-again": "https://bsky.app/profile/you.bsky.social/post/def456"
}
```

**Environment variables needed:**
- `BLUESKY_HANDLE` - Your Bluesky handle
- `BLUESKY_APP_PASSWORD` - App password (not main password)

**Run once:** `node scripts/bluesky-backfill.mjs`

---

### Phase 2: Build-Time Comment Fetching

**Goal:** At build time, fetch comments from Bluesky and/or KV archive, bake into HTML.

**Files to modify:**
- [ ] `eleventy.config.js` - Add async data fetching for comments
- [ ] `_data/comments.js` - Global data file that fetches/merges comment sources

**Implementation:**
```javascript
// _data/comments.js
// 1. Read bluesky-threads.json for thread URLs
// 2. For each thread:
//    a. Try to fetch from Cloudflare KV (archived comments)
//    b. Optionally fetch fresh from Bluesky API (or skip, let client do it)
// 3. Return merged comments keyed by post slug
```

**Template access:**
```njk
{# In post.njk #}
{% set postComments = comments[page.fileSlug] %}
{% include "components/bluesky-comments.njk" %}
```

---

### Phase 3: Client-Side Freshness + Archive Trigger

**Goal:** Client fetches fresh comments, displays new ones, triggers archival.

**Files to modify:**
- [ ] `_includes/components/bluesky-comments.njk` - Update client JS

**Client-side logic:**
```javascript
// In bluesky-comments.njk <script>
async function checkForNewComments() {
  const freshComments = await fetchFromBluesky(threadUrl);
  const cachedTimestamps = new Set(/* from data attributes */);
  
  const newComments = freshComments.filter(c => !cachedTimestamps.has(c.timestamp));
  
  if (newComments.length > 0) {
    // 1. Display new comments with "New" badge (already implemented)
    appendNewComments(newComments);
    
    // 2. Trigger archival (NEW)
    archiveComments(postSlug, freshComments);
  }
}

async function archiveComments(slug, comments) {
  try {
    await fetch('/api/archive-comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, comments, timestamp: Date.now() })
    });
  } catch (e) {
    // Silent fail - archival is best-effort, don't break UX
    console.debug('Comment archival failed:', e);
  }
}
```

---

### Phase 4: Cloudflare Worker for Archival

**Goal:** Serverless endpoint that receives comments and stores in KV.

**Files to create:**
- [ ] `functions/api/archive-comments.js` - Cloudflare Pages Function

**Implementation:**
```javascript
// functions/api/archive-comments.js
export async function onRequestPost({ request, env }) {
  try {
    const { slug, comments, timestamp } = await request.json();
    
    // Basic validation
    if (!slug || !Array.isArray(comments)) {
      return new Response('Bad request', { status: 400 });
    }
    
    // Sanitize slug to prevent KV key injection
    const safeSlug = slug.replace(/[^a-z0-9-]/gi, '');
    
    // Store in KV with metadata
    await env.COMMENTS_KV.put(
      `comments:${safeSlug}`,
      JSON.stringify({
        comments,
        archivedAt: timestamp,
        count: comments.length
      })
    );
    
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response('Internal error', { status: 500 });
  }
}
```

**Cloudflare setup required:**
- [ ] Create KV namespace `COMMENTS_KV`
- [ ] Bind KV to Pages project
- [ ] Deploy via Cloudflare Pages (auto-detects `functions/` directory)

---

### Phase 5: Build Integration with KV

**Goal:** Pull archived comments from KV at build time.

**Files to modify:**
- [ ] `_data/comments.js` - Fetch from KV during build

**Implementation:**
```javascript
// _data/comments.js
module.exports = async function() {
  const threads = require('./bluesky-threads.json');
  const comments = {};
  
  for (const [slug, threadUrl] of Object.entries(threads)) {
    // Option A: Fetch from KV via REST API (requires API token)
    // Option B: Fetch fresh from Bluesky at build time
    // Option C: Use local JSON fallback, KV is just for persistence
    
    comments[slug] = await fetchCommentsForSlug(slug, threadUrl);
  }
  
  return comments;
};
```

**Note:** For build-time KV access, you'll need either:
- Cloudflare API token with KV read permissions, OR
- A build hook that exports KV to JSON before build, OR
- Just fetch fresh from Bluesky at build time (simpler, KV is backup)

**Recommended approach:** Fetch from Bluesky at build time (simple), use KV as the durable archive that survives if Bluesky API is down or rate-limited.

---

### Phase 6: New Post Workflow

**Goal:** Streamline posting flow so Bluesky thread is created automatically.

**Option A: Manual (current)**
1. Publish post
2. Manually post to Bluesky
3. Add thread URL to `_data/bluesky-threads.json`
4. Rebuild

**Option B: Semi-automated**
- [ ] Add to publish script: prompt for "Post to Bluesky? [Y/n]"
- [ ] If yes, create post via API, add URL to data file, commit

**Option C: Fully automated**
- [ ] Eleventy build event creates Bluesky post if not exists
- [ ] Stores thread URL automatically
- [ ] Requires build-time Bluesky credentials (environment variable)

**Recommendation:** Start with Option A, graduate to B once the system is proven.

---

### Implementation Order

1. **Phase 4 first** (Cloudflare Worker) - Get the archival endpoint working
2. **Phase 3** (Client-side trigger) - Wire up the frontend to call it
3. **Phase 1** (Backfill script) - Populate Bluesky with your archive
4. **Phase 2 + 5** (Build integration) - Make archived comments appear in static HTML
5. **Phase 6** (Workflow) - Streamline ongoing posting

---

### Testing Checklist

- [ ] Backfill script creates backdated posts correctly
- [ ] Thread URLs are stored and accessible in templates
- [ ] Comments display on page load (cached)
- [ ] Client fetches fresh comments from Bluesky
- [ ] New comments appear with "New" badge
- [ ] Archive endpoint receives POST and stores to KV
- [ ] Build can read from KV (or Bluesky directly)
- [ ] Fallback works if Bluesky API is down
- [ ] No errors on posts without threads yet

---

### Security Considerations

- [ ] Archive endpoint validates input (slug format, comment structure)
- [ ] Rate limiting on archive endpoint (Cloudflare handles this mostly)
- [ ] Bluesky app password stored securely (env vars, not in repo)
- [ ] KV API token (if used at build) has minimal permissions

---

### Future Enhancements (Post-MVP)

- [ ] Moderation: Flag/hide individual comments
- [ ] Analytics: Track which posts get most engagement
- [ ] Backup: Periodic export of KV to git repo
- [ ] Display: Show like/repost counts from Bluesky
- [ ] Threading: Visual nesting for reply chains

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
