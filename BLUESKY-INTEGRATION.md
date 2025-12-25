# Bluesky Integration Guide

This site uses Bluesky posts as a commenting system. When you share a post on Bluesky, replies to that post become comments on your blog.

## How It Works

1. You publish a post to your site: `https://burninghou.se/<slug>/`
2. You share it on Bluesky with a link and OpenGraph card
3. You copy the Bluesky post URL
4. You add it to the post's frontmatter as `bluesky_thread`
5. The site fetches replies and displays them as comments

**Benefits:**
- No database or comment backend needed
- Moderation happens on Bluesky (block/mute works)
- Comments have social context (see commenter's profile)
- Engagement stays on the platform where your audience is
- No spam (Bluesky's built-in protections)

## Publishing Workflow

### 1. Publish Your Post

Make sure post has good metadata:

```yaml
---
title: "Your Post Title"
date: 2025-01-15
publish: true
summary: "Brief description for SEO and social cards."
post_image: "/<slug>/assets/featured-image.jpg"
post_image_alt: "Description of image"
---
```

Build and deploy:

```bash
npm run build
# Deploy to your hosting
```

### 2. Share on Bluesky

Go to [bsky.app](https://bsky.app) and create a post:

**Example post text:**
```
New essay: The Naming of Cats, and an Offering

On translation, proper nouns, and the peculiar history of cat nomenclature in classical Chinese texts.

https://burninghou.se/the-naming-of-cats-and-an-offering/
```

**Tips:**
- Include the full URL so OpenGraph card appears
- Keep text brief and engaging
- Add relevant hashtags if desired
- The OpenGraph card will show your `post_image`, `title`, and `summary`

### 3. Copy the Bluesky Post URL

After posting, click on your post's timestamp to open the individual post view.

Copy the URL from your browser. It will look like:
```
https://bsky.app/profile/burninghou.se/post/3labcdefghijklm
```

### 4. Add to Post Frontmatter

Edit your post's `index.md`:

```yaml
---
title: "Your Post Title"
date: 2025-01-15
publish: true
summary: "Brief description for SEO and social cards."
post_image: "/<slug>/assets/featured-image.jpg"
bluesky_thread: "https://bsky.app/profile/burninghou.se/post/3labcdefghijklm"
---
```

### 5. Rebuild and Redeploy

```bash
npm run build
# Deploy again
```

Comments will now appear at the bottom of your post!

## Template Usage

### Display Comments

In your post template (e.g., `post-woodblock.njk`):

```html
{% if bluesky_thread %}
<section class="comments">
  <h2>Discussion</h2>
  
  {% set comments = bluesky_thread | getBlueskyComments %}
  
  {% if comments.length > 0 %}
    <p class="comment-count">{{ comments.length }} {{ "reply" if comments.length == 1 else "replies" }} on <a href="{{ bluesky_thread }}">Bluesky</a></p>
    
    <ul class="comment-list">
      {% for comment in comments %}
      <li class="comment" data-depth="{{ comment.depth }}">
        <div class="comment-header">
          <img src="{{ comment.author.avatar }}" alt="{{ comment.author.displayName }}" class="comment-avatar">
          <div class="comment-meta">
            <strong class="comment-author">{{ comment.author.displayName }}</strong>
            <span class="comment-handle">@{{ comment.author.handle }}</span>
            <time class="comment-time" datetime="{{ comment.timestamp }}">{{ comment.relativeTime }}</time>
          </div>
        </div>
        <div class="comment-text">{{ comment.text }}</div>
        <div class="comment-actions">
          <a href="{{ comment.url }}">View on Bluesky</a>
        </div>
      </li>
      {% endfor %}
    </ul>
  {% else %}
    <p>No replies yet. <a href="{{ bluesky_thread }}">Start the discussion on Bluesky!</a></p>
  {% endif %}
</section>
{% endif %}
```

### Display Comment Count

Show comment count in post listings:

```html
{% if post.data.bluesky_thread %}
  {% set count = post.data.bluesky_thread | getCommentCount %}
  <span class="comment-count">{{ count }} {{ "comment" if count == 1 else "comments" }}</span>
{% endif %}
```

### Conditional Display

Only show comment section if Bluesky thread exists:

```html
{% if bluesky_thread %}
  <!-- Comments section -->
{% else %}
  <p><a href="https://bsky.app/profile/burninghou.se">Discuss this on Bluesky</a></p>
{% endif %}
```

## Comment Object Structure

Each comment has the following properties:

```javascript
{
  id: "bafyreiabc123...",              // Content ID
  uri: "at://did:plc:abc/app.bsky...", // AT Protocol URI
  author: {
    handle: "burninghou.se",           // Bluesky handle
    displayName: "Burning House",      // Display name
    avatar: "https://cdn.bsky...",     // Avatar URL
    did: "did:plc:abc123..."           // Decentralized ID
  },
  text: "Great post! I especially...", // Comment text
  createdAt: "2025-01-15T10:30:00Z",  // ISO timestamp
  timestamp: "2025-01-15T10:30:00Z",  // Same as createdAt
  relativeTime: "2h ago",              // Human-readable
  likeCount: 5,                        // Number of likes
  replyCount: 2,                       // Number of replies
  repostCount: 1,                      // Number of reposts
  depth: 0,                            // Thread depth (0 = top-level)
  url: "https://bsky.app/..."          // Link to post on Bluesky
}
```

## Styling Comments

Basic CSS structure:

```css
.comments {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--rule);
}

.comment-list {
  list-style: none;
  padding: 0;
}

.comment {
  margin: 1.5rem 0;
  padding-left: calc(var(--depth) * 2rem); /* Indent based on depth */
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.comment-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.comment-author {
  font-weight: 600;
}

.comment-handle {
  color: var(--muted-ink);
  font-size: 0.9em;
}

.comment-time {
  color: var(--muted-ink);
  font-size: 0.85em;
}

.comment-text {
  margin: 0.5rem 0;
  line-height: 1.5;
}

.comment-actions {
  font-size: 0.9em;
  color: var(--muted-ink);
}
```

### Thread Depth Styling

Use CSS custom properties for indentation:

```css
.comment {
  --depth: attr(data-depth);
  padding-left: calc(var(--depth, 0) * 2rem);
}

.comment[data-depth="0"] { padding-left: 0; }
.comment[data-depth="1"] { padding-left: 2rem; }
.comment[data-depth="2"] { padding-left: 4rem; }
.comment[data-depth="3"] { padding-left: 6rem; }
```

## Technical Details

### Bluesky API

Uses the public Bluesky API (no authentication required):

```
https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread
```

**Parameters:**
- `uri` — AT Protocol URI (at://did:plc:.../app.bsky.feed.post/abc123)
- `depth` — How deep to fetch replies (default: 10)

**Response:** Full thread structure with nested replies.

### AT Protocol URIs

Bluesky uses AT Protocol URIs:

```
at://did:plc:abc123xyz.../app.bsky.feed.post/3labcdefghijklm
```

The integration automatically converts bsky.app URLs to AT URIs.

### Caching

Comments are cached in-memory for 5 minutes to reduce API calls during builds.

**Cache duration:** Set in `_config/bluesky-comments.js`:

```javascript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

**Clear cache manually:**

```javascript
import blueskyComments from './_config/bluesky-comments.js';
blueskyComments.clearCache();
```

### Build-Time Fetching

Comments are fetched at **build time**, not in the browser.

**Implications:**
- Comments are static (part of the HTML)
- New comments won't appear until you rebuild
- No JavaScript required on the frontend
- Fast page loads (no API calls on page view)

**To show new comments:** Rebuild and redeploy the site.

### Automated Rebuilds

Consider setting up automatic rebuilds to keep comments fresh:

**Option 1: Scheduled Builds (Cloudflare Pages/Netlify)**
- Trigger daily builds via webhook
- Comments update automatically

**Option 2: Webhook from Bluesky**
- Not currently possible (Bluesky doesn't send webhooks)
- Could poll the API periodically

**Option 3: Manual Rebuilds**
- Rebuild when you notice new interesting comments
- Good for low-traffic sites

## Error Handling

The integration handles errors gracefully:

- **Invalid URL:** Logs warning, returns empty array
- **API error:** Logs warning, returns empty array
- **Network timeout:** Logs warning, returns empty array
- **No replies:** Returns empty array (no error)

**Result:** Pages always build successfully, even if comment fetching fails.

## Privacy Considerations

**What's fetched:**
- Public Bluesky replies only
- Author names, handles, avatars
- Comment text and timestamps
- Like/reply counts

**What's not fetched:**
- Private/protected posts
- Direct messages
- User email or other private data

**User control:**
- Users control their Bluesky privacy settings
- Blocked users' replies won't appear (per Bluesky's API)
- Users can delete their replies on Bluesky (won't appear on next build)

## Moderation

**On Bluesky:**
- Block users → their replies won't show
- Mute users → their replies won't show
- Report posts → Bluesky moderation handles it

**On your site:**
- Rebuild to remove blocked users' comments
- No separate moderation interface needed
- Leverage Bluesky's existing moderation tools

## Troubleshooting

### Comments not appearing

1. **Check Bluesky URL is correct:**
   ```yaml
   bluesky_thread: "https://bsky.app/profile/yourhandle/post/postid"
   ```

2. **Check there are actual replies on Bluesky**
   - Visit the Bluesky post
   - Are there visible replies?
   - Are you blocking the repliers?

3. **Check console during build:**
   ```bash
   npm run build
   ```
   Look for warnings like:
   - "Invalid Bluesky URL"
   - "Bluesky API error"

4. **Clear cache and rebuild:**
   - Comments are cached for 5 minutes
   - Wait 5 minutes or restart dev server

### API rate limits

Bluesky's public API has rate limits (specifics not documented).

**If you hit limits:**
- Increase cache duration
- Build less frequently
- Use scheduled builds (once daily)

### Invalid JSON in console

If you see JSON parsing errors, the API may have changed.

**Check:**
1. Is the API URL still correct?
2. Has the AT Protocol changed?
3. File an issue or update the integration

### Slow builds

Fetching comments adds time to builds.

**Optimizations:**
- Cache is automatic (5 min)
- Only fetches threads that exist (`bluesky_thread` field)
- Parallel fetching (if needed, can be added)

**Typical impact:** +500ms per 10 posts with comments.

## Future Enhancements

### Real-Time Comments

Could add client-side JavaScript to fetch new comments without rebuilding:

```javascript
// _includes/layouts/post-woodblock.njk
<script>
async function refreshComments() {
  const response = await fetch('/api/comments?thread={{ bluesky_thread }}');
  const comments = await response.json();
  // Update DOM with new comments
}
</script>
```

Requires serverless function or Edge Worker.

### Comment Reactions

Could show likes, reposts, and quote posts:

```html
<div class="comment-stats">
  <span>❤️ {{ comment.likeCount }}</span>
  <span>🔄 {{ comment.repostCount }}</span>
</div>
```

### Rich Text Support

Bluesky supports rich text (mentions, links, formatting).

Could parse `comment.record.facets` to render:
- @mentions as links
- URLs as clickable links
- Hashtags
- Formatting

### Nested Reply UI

Current implementation shows all replies flat.

Could render nested structure:

```html
<ul class="comment-thread">
  <li class="comment">
    <div class="comment-content">...</div>
    <ul class="comment-replies">
      <li class="comment">...</li>
    </ul>
  </li>
</ul>
```

## Alternative: Client-Side Loading

If you prefer loading comments in the browser:

```html
<div id="bluesky-comments" data-thread="{{ bluesky_thread }}"></div>

<script>
async function loadComments() {
  const thread = document.getElementById('bluesky-comments').dataset.thread;
  // Fetch from your serverless function or Bluesky API directly
  // (requires CORS-compatible endpoint)
  const comments = await fetchCommentsFromAPI(thread);
  renderComments(comments);
}

document.addEventListener('DOMContentLoaded', loadComments);
</script>
```

**Trade-offs:**
- ✅ Always shows latest comments
- ✅ No rebuild needed
- ❌ Requires JavaScript
- ❌ Slower page load
- ❌ More complex

## Resources

- [Bluesky API Documentation](https://docs.bsky.app/)
- [AT Protocol Specs](https://atproto.com/)
- [Bluesky Developer Discord](https://discord.gg/bluesky-developers)

## Example: Full Integration

Complete example in post layout:

```html
<!-- At bottom of post-woodblock.njk -->

{% if bluesky_thread %}
<section class="post-comments">
  <h2>Discussion on Bluesky</h2>
  
  {% set comments = bluesky_thread | getBlueskyComments %}
  
  {% if comments.length > 0 %}
    <p class="comments-intro">
      {{ comments.length }} {{ "reply" if comments.length == 1 else "replies" }}.
      <a href="{{ bluesky_thread }}">Join the conversation →</a>
    </p>
    
    <div class="comments-list">
      {% for comment in comments %}
      <article class="comment" data-depth="{{ comment.depth }}">
        <header class="comment-header">
          <a href="https://bsky.app/profile/{{ comment.author.handle }}" class="comment-author-link">
            <img src="{{ comment.author.avatar }}" alt="" class="comment-avatar" width="48" height="48">
            <div class="comment-meta">
              <strong class="comment-author-name">{{ comment.author.displayName }}</strong>
              <span class="comment-author-handle">@{{ comment.author.handle }}</span>
            </div>
          </a>
          <a href="{{ comment.url }}" class="comment-time" title="{{ comment.timestamp }}">
            {{ comment.relativeTime }}
          </a>
        </header>
        
        <div class="comment-body">
          {{ comment.text }}
        </div>
        
        {% if comment.likeCount > 0 or comment.replyCount > 0 %}
        <footer class="comment-footer">
          {% if comment.likeCount > 0 %}
            <span class="comment-likes">❤️ {{ comment.likeCount }}</span>
          {% endif %}
          {% if comment.replyCount > 0 %}
            <span class="comment-replies">💬 {{ comment.replyCount }}</span>
          {% endif %}
        </footer>
        {% endif %}
      </article>
      {% endfor %}
    </div>
  {% else %}
    <p class="no-comments">
      No replies yet. <a href="{{ bluesky_thread }}">Be the first to comment on Bluesky!</a>
    </p>
  {% endif %}
</section>
{% else %}
<section class="post-comments">
  <p class="no-thread">
    <a href="https://bsky.app/intent/compose?text={{ title | urlencode }}%20{{ canonicalUrl | urlencode }}">
      Discuss this post on Bluesky
    </a>
  </p>
</section>
{% endif %}
```

---

**Next Steps:**

1. Update `metadata.js` with your Bluesky handle ✅ (Already done: `burninghou.se`)
2. Publish a post and share on Bluesky
3. Add `bluesky_thread` URL to frontmatter
4. Rebuild and see comments appear!