# Metadata Schema for Burning House

Complete specification of frontmatter fields for posts, with defaults, validation, and future expansion planning.

## Core Principles

1. **Defaults cascade:** Site → Collection → Post
2. **Explicit overrides:** Post frontmatter overrides everything
3. **SEO-first:** Summary and description drive discoverability
4. **Social integration:** Bluesky threads as comment system
5. **Future-proof:** Schema supports both blog posts and structured collections

---

## Frontmatter Fields

### Required Fields

#### `title` (string, required)
The main title of the post.

```yaml
title: "The Naming of Cats, and an Offering"
```

#### `date` (YYYY-MM-DD, required)
Date of first publication (not last edit).

```yaml
date: 2023-07-18
```

### Content Organization

#### `subtitle` (string, optional)
Secondary title, displayed below main title.

```yaml
subtitle: "A meditation on translation and proper nouns"
```

**Display:** Shown in `<h2>` below title, in SEO description if no summary provided.

#### `summary` (string, optional but recommended)
Brief description for SEO, search results, and social cards.

**Length:** 120-160 characters ideal (Google's sweet spot).

```yaml
summary: "Exploring the challenges of translating personal names and the peculiar naming conventions for cats in classical Chinese texts."
```

**Used in:**
- `<meta name="description">`
- OpenGraph `og:description`
- RSS feed descriptions
- Internal search results
- Social card generation

**Defaults to:** First 160 characters of post content (stripped of HTML/markdown).

#### `excerpt` (string, optional)
Longer excerpt for internal use (archive pages, search results).

**Length:** 1-3 sentences, 200-400 characters.

```yaml
excerpt: "If you can read Classical Chinese, you can have a moderately good time looking in pre-20th century reference texts to see what they have for 'cat.' But finding actual historical cat names? That's another story entirely."
```

**Used in:**
- Post listings/archives
- "Related posts" sections
- Internal search preview
- RSS feed content preview

**Defaults to:** Summary field, or first 300 characters of content.

#### `tags` (array, optional)
Internal tags for organization and related posts. **Not publicly visible** on posts.

```yaml
tags:
  - translation
  - classical-chinese
  - animals
  - humor
```

**Used for:**
- Related post recommendations
- Internal search filtering
- Future taxonomy pages (if you choose to make them public)
- Content organization

**Display:** Hidden by default. Can be shown on archive pages if desired.

#### `publish` (boolean, default: false)
Whether post is published on public site.

```yaml
publish: true
```

**Behavior:**
- `false`: Post accessible during dev (`npm run start`) but excluded from production build
- `true`: Post appears on site, in feeds, in archives

#### `draft` (boolean, optional)
Personal organizational flag. Does not affect build.

```yaml
draft: false
```

**Purpose:** Track your own writing status separately from publication status.

#### `related_posts` (array, optional)
Manually curated list of related post slugs. **Recommended for key posts.**

```yaml
related_posts:
  - tao-yuanming-home-again
  - pangur-ban-translation
  - on-proper-nouns
```

**Display:** Show at bottom of post as "Related Reading" or "You might also like".

**Why manual?** With <200 posts, manual curation provides:
- Better context ("If you liked X, try Y because...")
- Intentional connections between ideas
- Control over what readers see next

**Best practices:**
- Include 2-4 related posts
- Add brief explanation for each connection (in template)
- Update as you publish new related content

---

### Social & Comments

#### `bluesky_thread` (URL, optional but strongly recommended)
URL to the Bluesky post announcing this article. Replies become comments.

```yaml
bluesky_thread: "https://bsky.app/profile/burninghou.se/post/abc123xyz"
```

**Workflow:**
1. Publish post to site
2. Share on Bluesky with OpenGraph card: "New post: [Title] https://burninghou.se/<slug>"
3. Copy Bluesky post URL
4. Add to `bluesky_thread` field
5. Rebuild site

**Display:** 
- "Discuss on Bluesky" link at bottom of post
- (Future) Fetch and display replies as threaded comments

**API:** Use Bluesky AT Protocol to fetch thread:
```javascript
// Future implementation
const thread = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${blueskyUri}`);
```

#### `bluesky_handle` (string, optional)
Override default Bluesky handle for this post.

```yaml
bluesky_handle: "burninghou.se"
```

**Defaults to:** `metadata.social.bluesky` from `_data/metadata.js`.

---

### Images

#### `post_image` (path, optional but recommended)
Hero image for the post. Used in social cards and as featured image.

```yaml
post_image: "/the-naming-of-cats/assets/cat-contract.jpeg"
```

**Requirements:**
- Minimum 1200x630px (OpenGraph standard)
- JPEG or PNG
- Relative to site root (include leading slash)

**Used in:**
- Social cards (OpenGraph, Twitter)
- Archive page thumbnails
- RSS feed featured images
- Top of post (if you add that to template)

**Defaults to:** 
1. First image in post content
2. Site default (`metadata.og.defaultImage`)

#### `post_image_alt` (string, required if post_image set)
Alt text for the post image.

```yaml
post_image_alt: "Woodblock print of a cat surrounded by Chinese contract text"
```

---

### OpenGraph / Social Override

These fields override computed values. Usually not needed (auto-generated from post metadata).

#### `og_title` (string, optional)
Override OpenGraph title (defaults to `title`).

```yaml
og_title: "Cat Names in Classical Chinese Texts"
```

**When to use:** If your title is too long for social cards (>60 chars).

#### `og_description` (string, optional)
Override OpenGraph description (defaults to `summary`).

```yaml
og_description: "Exploring cat nomenclature in classical Chinese reference works"
```

#### `og_image` (URL, optional)
Override OpenGraph image (defaults to `post_image` or site default).

```yaml
og_image: "/assets/social-cards/naming-of-cats-card.jpg"
```

**Use case:** Custom-designed social card (see Social Card Generation below).

#### `og_type` (string, optional)
OpenGraph type (defaults to `article` for posts).

```yaml
og_type: "article"
```

**Options:** `article`, `website`, `book` (for translation collections).

---

### Email Publishing

#### `buttondown_sent` (boolean, auto-added)
Tracks whether post was sent via Buttondown. **Do not set manually.**

```yaml
buttondown_sent: true
```

**Auto-populated by:** `scripts/publish-to-buttondown.mjs`

#### `buttondown_sent_date` (ISO 8601, auto-added)
Timestamp of when email was sent.

```yaml
buttondown_sent_date: "2025-01-15T14:30:00.000Z"
```

#### `buttondown_email_id` (string, auto-added)
Buttondown's ID for the sent email.

```yaml
buttondown_email_id: "497f6eca-6276-4993-bfeb-53cbbbba6f08"
```

---

### Future: Translation Collections

These fields support future structured browsing of translations.

#### `content_type` (string, optional)
Type of content. Enables different templates and browsing.

```yaml
content_type: "translation"
```

**Options:**
- `post` (default) — Essay, note, blog post
- `translation` — Literary translation
- `page` — Static page (about, etc.)

#### `original_author` (string, optional, for translations)
Author of the original work.

```yaml
original_author: "陶淵明"
original_author_en: "Tao Yuanming"
```

#### `original_title` (string, optional, for translations)
Title of the original work.

```yaml
original_title: "歸去來兮辭"
original_title_en: "Home Again"
```

#### `period` (string, optional, for translations)
Historical period of original work.

```yaml
period: "Eastern Jin"
period_years: "365–427 CE"
```

**Enables:** Browse translations by dynasty/period.

#### `genre` (string, optional, for translations)
Literary genre.

```yaml
genre: "shi" # poetry
```

**Options:** `shi` (poetry), `ci` (lyric poetry), `qu` (song), `prose`, `fu` (rhapsody)

#### `themes` (array, optional)
Thematic tags for browsing.

```yaml
themes:
  - nature
  - reclusion
  - drinking
  - friendship
```

**Different from `tags`:** Themes are user-facing, browsable categories. Tags are internal.

---

## Complete Example

### Basic Blog Post

```yaml
---
title: "The Naming of Cats, and an Offering"
subtitle: "On translation and proper nouns"
date: 2023-07-18
publish: true
draft: false

summary: "Exploring the challenges of translating personal names and the peculiar naming conventions for cats in classical Chinese texts."

excerpt: "If you can read Classical Chinese, you can have a moderately good time looking in pre-20th century reference texts to see what they have for 'cat.' But finding actual historical cat names? That's another story entirely."

tags:
  - translation
  - classical-chinese
  - animals

related_posts:
  - tao-yuanming-home-again
  - on-translating-names

post_image: "/the-naming-of-cats/assets/cat-contract.jpeg"
post_image_alt: "Woodblock print of a cat surrounded by Chinese contract text"

bluesky_thread: "https://bsky.app/profile/burninghou.se/post/abc123xyz"
---
```

### Translation (Future)

```yaml
---
title: "Home Again"
subtitle: "歸去來兮辭 (Gui qu lai xi ci)"
date: 2024-03-15
publish: true

content_type: "translation"

original_author: "陶淵明"
original_author_en: "Tao Yuanming"
original_title: "歸去來兮辭"
original_title_en: "Home Again"
period: "Eastern Jin"
period_years: "365–427 CE"
genre: "fu"

themes:
  - reclusion
  - nature
  - simplicity
  - home

summary: "Tao Yuanming's famous rhapsody on leaving office and returning to rural life."

post_image: "/translations/tao-yuanming-home-again/assets/landscape.jpg"
post_image_alt: "Ink painting of a scholar returning to a thatched cottage"

tags:
  - tao-yuanming
  - eastern-jin
  - rhapsody

bluesky_thread: "https://bsky.app/profile/burninghou.se/post/xyz789abc"
---
```

---

## Social Card Generation

### Workflow

1. **Default cards:** Generated at build time for all posts
2. **Custom cards:** Designed manually for select posts (optional)

### Implementation Options

#### Option A: Automated (Recommended)

Use `@11ty/eleventy-img` + Canvas/SVG to generate cards:

```javascript
// _config/social-cards.js
import { Image } from '@11ty/eleventy-img';

async function generateSocialCard(title, author, image) {
  // Create 1200x630 image with:
  // - Title
  // - Author
  // - Post image or site logo
  // - Woodblock-inspired border
  // - Site colors
}
```

**Trigger:** Eleventy computed data or shortcode.

#### Option B: Cloudinary (Easier)

Use Cloudinary's URL API to generate cards:

```javascript
const cardUrl = `https://res.cloudinary.com/your-cloud/image/upload/w_1200,h_630,c_fill,g_auto/l_text:Arial_72:${title}/logo.jpg`;
```

#### Option C: Manual Design

Create custom cards in Figma/Sketch for important posts, export as JPG.

### Required Dimensions

- **OpenGraph:** 1200x630px (recommended), minimum 600x315px
- **Twitter:** Same, or 1200x600px
- **Format:** JPEG (smaller) or PNG (better quality)
- **File size:** <1MB for fast loading

---

## Validation Schema

For PagesCMS or other CMS integrations:

```javascript
// pages.config.js
export default {
  collections: {
    posts: {
      path: 'content/blog',
      fields: {
        title: { 
          type: 'string', 
          required: true,
          maxLength: 100
        },
        subtitle: { 
          type: 'string',
          maxLength: 150
        },
        date: { 
          type: 'date', 
          required: true 
        },
        publish: { 
          type: 'boolean', 
          default: false 
        },
        draft: { 
          type: 'boolean', 
          default: true 
        },
        summary: { 
          type: 'string',
          maxLength: 160,
          help: 'Used for SEO and social cards. 120-160 characters ideal.'
        },
        excerpt: { 
          type: 'string',
          maxLength: 400
        },
        tags: {
          type: 'array',
          items: { type: 'string' }
        },
        related_posts: {
          type: 'array',
          items: { type: 'string' },
          help: 'Slugs of related posts (manual curation)'
        },
        post_image: {
          type: 'image',
          help: 'Minimum 1200x630px for social cards'
        },
        post_image_alt: { 
          type: 'string',
          requiredIf: 'post_image'
        },
        bluesky_thread: { 
          type: 'url',
          pattern: '^https://bsky\\.app/'
        },
        
        // Future fields
        content_type: {
          type: 'select',
          options: ['post', 'translation', 'page'],
          default: 'post'
        },
        original_author: { type: 'string' },
        original_title: { type: 'string' },
        period: { type: 'string' },
        genre: { 
          type: 'select',
          options: ['shi', 'ci', 'qu', 'prose', 'fu']
        },
        themes: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  }
};
```

---

## Eleventy Implementation

### Computed Data

Create `content/blog/blog.11tydata.js`:

```javascript
export default {
  eleventyComputed: {
    // Compute summary from content if not provided
    summary: (data) => {
      if (data.summary) return data.summary;
      if (data.subtitle) return data.subtitle;
      // Extract first 160 chars from content
      const text = data.content?.replace(/<[^>]*>/g, '').substring(0, 160);
      return text ? text + '...' : data.title;
    },
    
    // Compute excerpt from summary or content
    excerpt: (data) => {
      if (data.excerpt) return data.excerpt;
      if (data.summary) return data.summary;
      const text = data.content?.replace(/<[^>]*>/g, '').substring(0, 300);
      return text ? text + '...' : '';
    },
    
    // Compute OpenGraph image
    ogImage: (data) => {
      if (data.og_image) return data.og_image;
      if (data.post_image) return data.post_image;
      return data.metadata.og.defaultImage;
    },
    
    // Compute OpenGraph description
    ogDescription: (data) => {
      if (data.og_description) return data.og_description;
      return data.summary;
    },
    
    // Full canonical URL
    canonicalUrl: (data) => {
      return data.metadata.url + data.page.url;
    },
    
    // Content type defaults
    contentType: (data) => data.content_type || 'post',
  }
};
```

### Base Layout Integration

Update `_includes/layouts/base.njk`:

```html
<meta name="description" content="{{ summary or description }}">

<!-- OpenGraph -->
<meta property="og:title" content="{{ og_title or title }}">
<meta property="og:description" content="{{ ogDescription }}">
<meta property="og:image" content="{{ metadata.url }}{{ ogImage }}">
<meta property="og:url" content="{{ canonicalUrl }}">
<meta property="og:type" content="{{ og_type or 'article' }}">
<meta property="og:site_name" content="{{ metadata.og.siteName }}">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ og_title or title }}">
<meta name="twitter:description" content="{{ ogDescription }}">
<meta name="twitter:image" content="{{ metadata.url }}{{ ogImage }}">

<!-- Bluesky comment thread -->
{% if bluesky_thread %}
<link rel="discussion" href="{{ bluesky_thread }}">
{% endif %}

<!-- Canonical URL -->
<link rel="canonical" href="{{ canonicalUrl }}">
```

---

## Future: Browsing Translations

### Collection Page Structure

```
content/
  translations/
    index.njk          # Main translations landing
    by-period.njk      # Browse by dynasty/period
    by-author.njk      # Browse by poet
    by-theme.njk       # Browse by theme
    by-genre.njk       # Browse by genre
```

### Example Taxonomy Query

```javascript
// Get all translations grouped by period
const translationsByPeriod = collections.all
  .filter(post => post.data.content_type === 'translation')
  .reduce((acc, post) => {
    const period = post.data.period || 'Unknown';
    if (!acc[period]) acc[period] = [];
    acc[period].push(post);
    return acc;
  }, {});
```

---

## Migration Path

### Phase 1: Basic Metadata (Now)
- Add `summary`, `excerpt`, `post_image` to existing posts
- Implement computed fields
- Add Bluesky integration

### Phase 2: Social Cards (Next)
- Implement automated card generation
- Add cards to build process
- Test OpenGraph rendering

### Phase 3: Translation Collection (Later)
- Add `content_type` and related fields
- Create taxonomy pages
- Build browsing interface

---

## Quick Reference

### Minimal Post
```yaml
title: "Post Title"
date: 2025-01-15
publish: true
```

### Recommended Post
```yaml
title: "Post Title"
date: 2025-01-15
publish: true
summary: "Brief description for SEO and social."
post_image: "/<slug>/assets/image.jpg"
post_image_alt: "Description of image"
bluesky_thread: "https://bsky.app/profile/burninghou.se/post/abc123"
tags:
  - relevant
  - tags
related_posts:
  - another-post-slug
  - third-post-slug
```

### Full-Featured Translation
```yaml
title: "Translated Title"
subtitle: "Original Title in Chinese"
date: 2025-01-15
publish: true
content_type: "translation"
original_author: "Author Name"
period: "Tang Dynasty"
genre: "shi"
themes: [nature, friendship]
summary: "About this translation."
post_image: "/<slug>/assets/image.jpg"
bluesky_thread: "https://..."
```

---

**Next Steps:**
1. Add computed data file (`content/blog/blog.11tydata.js`)
2. Update base layout with new meta tags
3. Implement Bluesky integration
4. Plan social card generation approach