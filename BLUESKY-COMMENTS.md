# Bluesky Comments System

## Overview

The blog uses Bluesky threads as a commenting system. When you share a blog post on Bluesky, replies to that post appear as comments on the blog.

**Architecture:**
- **Build-time rendering**: Comments are fetched from Bluesky's public API during the build and baked into the static HTML
- **Client-side refresh**: JavaScript checks for new comments when readers visit and displays them with a "New" badge
- **Graceful degradation**: If the Bluesky API is unavailable, cached comments remain visible

## How It Works

### 1. Post Setup

Add a `bluesky_thread` field to your post's frontmatter:

```yaml
---
title: "My Post"
date: 2025-12-15
bluesky_thread: "https://bsky.app/profile/burninghou.se/post/3ma2dmjbzss2n"
---
```

When this field is set, the comments section will automatically appear at the bottom of the post.

### 2. Build-Time Fetching

During the Eleventy build:

1. The `getBlueskyComments` async filter is called for each post with a `bluesky_thread` value
2. It extracts the post URI from the URL and queries the Bluesky public API
3. Comments are parsed into a flat list with threading information (depth)
4. The comments are rendered into the static HTML

**Files involved:**
- `_config/bluesky-comments.js` - API client and filter implementation
- `eleventy.config.js` - Filter registration
- `_includes/components/bluesky-comments.njk` - Template component
- `_includes/layouts/post.njk` - Includes the component

### 3. Client-Side Refresh

When a reader visits the page:

1. The cached comments render immediately (fast, SEO-friendly)
2. JavaScript fetches the latest comments from Bluesky's API
3. If new comments exist, they're appended with a "New" badge
4. A toast notification appears: "X new replies"
5. The comment count updates

This happens silently - if the API fails, the page still works with cached comments.

### 4. Comment Display

Comments are displayed with:
- Author avatar, display name, and handle
- Timestamp (relative format: "2h ago")
- Comment text
- Engagement stats (likes, replies, reposts)
- Thread depth-based indentation
- Link to the comment on Bluesky

**Threading:**
- Top-level replies have `depth: 0` with a colored left border
- Nested replies increase in depth and are visually indented
- Maximum depth is 10 (configurable in API call)

## Features

### Styling

The comments section includes:
- Clean, minimal design matching the blog aesthetic
- Mobile-responsive layout (stacked on narrow screens)
- Hover effects on comments and author names
- Different styling for top-level vs nested comments

**CSS classes:**
- `.bluesky-comments` - Container section
- `.comment` - Individual comment wrapper
- `.comment[data-depth="0"]` - Top-level comments
- `.comment-new` - Newly fetched comments
- `.new-badge` - "New" label on fresh comments
- `.new-comments-notification` - Toast notification

### No Authentication Required

The system uses Bluesky's **public API** which doesn't require authentication for reading public posts. This means:
- No API keys or tokens needed
- No rate limits (or very generous ones)
- Works entirely client-side for live updates
- No server-side infrastructure required

### Performance

**Build time:**
- Each thread URL is fetched once during build
- 5-minute in-memory cache prevents redundant API calls
- Parallel fetching for multiple posts (Eleventy handles this)

**Client-side:**
- Comments appear instantly from cached HTML
- Fresh check happens asynchronously (doesn't block rendering)
- Minimal JavaScript (~5KB)

## API Reference

### Filter: `getBlueskyComments`

```njk
{% set comments = bluesky_thread | getBlueskyComments %}
```

**Input:** Bluesky post URL (string)

**Output:** Array of comment objects

**Comment object structure:**
```javascript
{
  id: "bafyrei...",              // Content ID
  uri: "at://did:plc:.../post/...", // AT Protocol URI
  author: {
    handle: "user.bsky.social",
    displayName: "User Name",
    avatar: "https://cdn.bsky.app/img/...",
    did: "did:plc:..."
  },
  text: "Comment text",
  timestamp: "2025-12-15T19:12:37.853Z",
  relativeTime: "2h ago",
  likeCount: 5,
  replyCount: 2,
  repostCount: 0,
  depth: 0,                      // Thread nesting level
  url: "https://bsky.app/profile/..."  // Link to comment
}
```

### Function: `getCommentCount`

```javascript
import { getCommentCount } from './_config/bluesky-comments.js';
const count = await getCommentCount(url);
```

Returns the total number of replies without fetching full comment data.

### Function: `clearCache`

```javascript
import { clearCache } from './_config/bluesky-comments.js';
clearCache();
```

Clears the in-memory comment cache. Useful for development or forced refresh.

## Workflow

### Publishing a New Post

1. Write your post
2. Build and deploy the site
3. Share the post on Bluesky (copy the URL from your blog)
4. Copy the Bluesky post URL
5. Add `bluesky_thread: "URL"` to the post's frontmatter
6. Rebuild and redeploy

### Manual Flow (Current)

This is the current workflow. See "Future Enhancements" below for automation ideas.

## Customization

### Styling

All styles are in `_includes/components/bluesky-comments.njk` within a `<style>` block. Key CSS variables:

- `--ink` - Text color
- `--muted-ink` - Secondary text
- `--paper` - Background color
- `--rule` - Border color
- `--marker-color` - Accent color (links, badges)

### API Options

In `_config/bluesky-comments.js`, adjust:

```javascript
const BLUESKY_API = 'https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// In fetchThread():
const { depth = 10, useCache = true } = options;
```

**Depth:** Controls how many levels of nested replies to fetch (max 1000)

**Cache duration:** How long to cache API responses during build

### Comment Filtering

To filter out certain comments, modify the `parseComments()` function in `_config/bluesky-comments.js`:

```javascript
function traverse(reply, depth = 0) {
  if (!reply?.post) return;
  
  const post = reply.post;
  
  // Example: Skip comments from blocked users
  if (BLOCKED_HANDLES.includes(post.author.handle)) {
    return;
  }
  
  // ... rest of function
}
```

## Testing

### Local Testing

1. Start the dev server: `npm start`
2. Visit a post with `bluesky_thread` set
3. Check browser console for API calls
4. Verify comments render (or "No replies yet" appears)

### Testing with Comments

To test the full flow, you need a Bluesky thread with actual replies:

1. Post on Bluesky
2. Reply to your own post (or ask someone to reply)
3. Add the thread URL to frontmatter
4. Rebuild and check

### Client-Side Testing

Open browser DevTools → Network tab:
- Look for requests to `public.api.bsky.app`
- Check the response JSON structure
- Verify "New" badges appear for fresh comments

## Troubleshooting

### Comments not appearing

**Check:**
1. Is `bluesky_thread` set in frontmatter?
2. Is the URL format correct? Should be: `https://bsky.app/profile/HANDLE/post/POSTID`
3. Does the post have any replies on Bluesky?
4. Check browser console for API errors

**Debug:**
```javascript
// In browser console on the post page:
fetch('https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://HANDLE/app.bsky.feed.post/POSTID&depth=10')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Build errors

If the build fails with Bluesky API errors:

1. Check your internet connection
2. Verify the Bluesky API is accessible
3. The system should fail gracefully (comments just won't appear)

To skip comment fetching during build (emergency):
```javascript
// In _config/bluesky-comments.js
export async function getBlueskyComments(url, options = {}) {
  return []; // Temporary bypass
}
```

### Stale comments

Comments are cached for 5 minutes during build. To force refresh:

```javascript
// In eleventy.config.js or any build script
import { clearCache } from './_config/bluesky-comments.js';
clearCache();
```

Or just wait 5 minutes and rebuild.

## Future Enhancements

See TODO.md for the full Bluesky Comments implementation plan, including:

### Phase 1: Backfill Script
Create Bluesky posts for all existing blog posts with backdated timestamps

### Phase 2: Cloudflare KV Archival
Store comments in Cloudflare KV for durability and offline access

### Phase 3: Automated Publishing
Automatically post to Bluesky when publishing a new blog post

### Phase 4: Comment Moderation
Add ability to flag/hide specific comments

### Phase 5: Enhanced Features
- Show quote posts and reposts
- Display like/repost counts on blog
- Threading visualization improvements

## References

- [Bluesky API Documentation](https://docs.bsky.app/)
- [AT Protocol Specs](https://atproto.com/)
- [getPostThread API](https://docs.bsky.app/docs/api/app-bsky-feed-get-post-thread)

## Files

| File | Purpose |
|------|---------|
| `_config/bluesky-comments.js` | API client, parsing logic, Eleventy filter |
| `_includes/components/bluesky-comments.njk` | UI template and client-side JS |
| `_includes/layouts/post.njk` | Includes the comments component |
| `eleventy.config.js` | Registers the async filter |

---

*Last updated: 2026-01-07*
