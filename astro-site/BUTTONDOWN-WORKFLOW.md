# Buttondown Publishing Workflow

## Overview

Buttondown handles email newsletter delivery AND automatic RSS/Atom feed generation, which dramatically simplifies our publishing workflow.

**Key Insight**: We don't need separate RSS/Atom feeds or email layouts. Buttondown does it all!

## How It Works

### 1. Write Once in MDX

Posts are written in MDX with Astro components:

```mdx
---
title: "My Post"
date: 2025-01-09T00:00:00.000Z
---

This is my post text.<MarginNote>This is a margin note</MarginNote>

Some more text.<Footnote>This is a footnote</Footnote>
```

### 2. Web Output (Astro Build)

`npm run build` generates static site with:
- Margin notes in right column (desktop) or toggleable (mobile)
- Footnotes at bottom with backrefs
- Optimized images (WebP/AVIF)
- Full interactivity

### 3. Email Output (Conversion Script)

`node mdx-to-buttondown.mjs` converts to standard markdown:

```markdown
This is my post text.[^1]

Some more text.[^2]

---

[^1]: This is a margin note
[^2]: This is a footnote
```

### 4. Buttondown Processing

Send markdown to Buttondown API:
- Buttondown renders HTML email with auto-numbered footnotes
- Generates web archive at `buttondown.com/username/archive/slug`
- **Automatically creates RSS feed** at `buttondown.com/username/rss`

### 5. RSS/Atom Feeds (Automatic!)

Buttondown automatically exposes RSS feed when web archives are enabled:
- Feed URL: `https://buttondown.com/username/rss`
- Default: 30 most recent emails
- Customizable: `?count=50` for more entries
- No additional setup needed!

**Source**: [Buttondown RSS Documentation](https://docs.buttondown.com/email-to-rss)

## Benefits

✅ **Single source of truth**: One MDX file per post
✅ **No RSS boilerplate**: Buttondown generates feeds automatically
✅ **Standard markdown**: Uses `[^1]` footnote syntax Buttondown already supports
✅ **Simple workflow**: Convert → Send → Done

## Conversion Script: `mdx-to-buttondown.mjs`

### Features

- Converts `<MarginNote>` and `<Footnote>` → markdown footnotes `[^n]`
- Preserves anchor text: `<MarginNote anchor="text">` → `text[^n]`
- Maintains unified counter (1, 2, 3... across both types)
- Removes import statements
- Cleans up JSX syntax

### Usage

```bash
# Print to stdout
node mdx-to-buttondown.mjs src/content/blog/my-post/index.mdx

# Save to file
node mdx-to-buttondown.mjs src/content/blog/my-post/index.mdx --output email.md
```

### Example Transformation

**Input MDX**:
```mdx
First paragraph.<MarginNote>Note 1</MarginNote>

Second paragraph.<Footnote>Note 2</Footnote>

Third with anchor.<MarginNote anchor="highlighted text">Note 3</MarginNote>
```

**Output Markdown**:
```markdown
First paragraph.[^1]

Second paragraph.[^2]

Third with anchor.highlighted text[^3]

---

[^1]: Note 1

[^2]: Note 2

[^3]: Note 3
```

## Current Limitations

### Images
Currently outputs placeholder `IMAGE_URL_HERE`. Need to:
- Upload images to Buttondown or CDN
- Replace Astro image imports with public URLs
- Or: Include images inline as base64 (not recommended for large images)

### Poems
Currently outputs placeholder `[Poem: id]`. Options:
- Render poem content inline as blockquote
- Link to web version
- Or: Skip poems in email, web-only feature

### Figures
Need to handle `<Figure>` component similar to images.

## Next Steps

1. ✅ Basic conversion script working
2. ⏳ Handle images (CDN URLs or Buttondown uploads)
3. ⏳ Handle poems (inline rendering or skip)
4. ⏳ Buttondown API integration script
5. ⏳ Publishing automation (convert → upload → schedule)

## API Integration (To Be Built)

```javascript
// buttondown-publish.mjs
import { convertMDXToButtondown } from './mdx-to-buttondown.mjs';

async function publishToButtondown(mdxPath, options = {}) {
  const { markdown, footnoteCount } = await convertMDXToButtondown(mdxPath);
  
  const response = await fetch('https://api.buttondown.com/v1/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.BUTTONDOWN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: options.title,
      body: markdown,
      // schedule_for: options.publishDate,
    }),
  });
  
  return response.json();
}
```

## Publishing Checklist

When publishing a new post:

1. Write post in MDX with components
2. Build web version: `npm run build`
3. Preview locally
4. Convert to markdown: `node mdx-to-buttondown.mjs path/to/post.mdx --output email.md`
5. Review email markdown
6. Send to Buttondown API (or paste into web UI)
7. Buttondown automatically:
   - Sends email to subscribers
   - Creates web archive
   - Updates RSS feed

Done! One post, three outputs (web, email, RSS).
