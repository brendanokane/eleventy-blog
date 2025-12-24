# Quick Reference Card – Burning House

Fast lookup for common commands and workflows.

---

## Build & Serve

```bash
# Build site (includes asset mirroring)
npm run build

# Build and serve locally with live reload
npm start

# Build with debug output
npm run debug

# Build without colors (for logs)
npm run build-nocolor
```

**Output:** `_site/` directory

---

## Asset Management

```bash
# Preview what assets would be localized (dry run)
npm run assets:localize:dry

# Download Substack images and rewrite URLs
npm run assets:localize

# Preview ALL remote image localization
npm run assets:localize:all:dry

# Download ALL remote images
npm run assets:localize:all

# Mirror assets for blog-less URLs (runs automatically before build)
npm run assets:mirror
```

**Note:** Mirroring copies `content/blog/<slug>/assets/*` → `content/<slug>/assets/*` for blog-less URLs.

---

## Publishing Workflow

1. **Edit content:** `content/blog/<slug>/index.md`
2. **Add frontmatter:**
   ```yaml
   ---
   title: "Post Title"
   date: 2024-12-24
   publish: true  # Set to true when ready
   summary: "Brief description for feeds/SEO"
   ---
   ```
3. **Test locally:** `npm start`
4. **Check preflight:** See `PREFLIGHT.md`
5. **Build:** `npm run build`
6. **Deploy:** Upload `_site/` directory

---

## Margin Notes

### In Markdown (shortcode)
```markdown
This is text with a margin note.{% mn "Note anchor" %}
The note content can include **markdown**.
{% endmn %}
```

### In HTML (Substack imports)
```html
<sup class="mn-marker" data-mn-id="mn-1">※</sup>
<aside class="mn-note" id="mn-1">
Note content here.
</aside>
```

**Both convert to endnotes in email variants automatically.**

---

## File Locations

### Content
- Posts: `content/blog/<slug>/index.md`
- Post assets: `content/blog/<slug>/assets/*`
- Email variants: Auto-generated at `/emails/<slug>/`

### Templates
- Base layout: `_includes/layouts/base.njk`
- Woodblock layout: `_includes/layouts/post-woodblock.njk`
- Email layout: `_includes/layouts/post-email.njk`

### Configuration
- Eleventy config: `eleventy.config.js`
- Site metadata: `_data/metadata.js`
- Filters: `_config/filters.js`

### Styling
- Main CSS: `css/index.css`
- Public assets: `public/` → `_site/`

---

## URLs

- Web post: `/<slug>/`
- Email variant: `/emails/<slug>/`
- Post assets: `/<slug>/assets/<file>`
- Feed: `/feed/feed.xml`
- Feed (plugin): `/feed/plugin.xml`

---

## Frontmatter Fields

### Required
```yaml
title: "Post Title"
date: 2024-12-24
publish: true  # or false
```

### SEO/Social (optional but recommended)
```yaml
summary: "Brief description (1-2 sentences)"
description: "Longer description (if different from summary)"
og_image: "/path/to/image.jpg"
og_image_alt: "Image description"
canonical_url: "https://example.com/original"
robots: "noindex,follow"  # Override default
```

### Other (optional)
```yaml
layout: layouts/post-woodblock.njk  # Override default
tags: [translation, poetry]
bluesky_thread: "URL"
```

---

## Typography

### Font Stacks
- **Body:** Alegreya → Noto Serif TC → System serif
- **Display:** Adobe Aldine → Noto Sans TC → System sans
- **Margin notes:** Gill Sans → Noto Sans TC → System sans

### Colors (Light Mode)
- Text: `#241425` (ink)
- Background: `#f6f0e8` (paper)
- Links: `#8f1d14` (vermillion underline)

See `TYPOGRAPHY.md` for full details.

---

## Common Tasks

### Add a new post
```bash
mkdir -p content/blog/my-new-post
touch content/blog/my-new-post/index.md
mkdir content/blog/my-new-post/assets
```

### Check diagnostics
```bash
npm run build 2>&1 | grep -i "error\|warning"
```

### Verify feed
```bash
npm run build
cat _site/feed/feed.xml | head -30
```

### Test email variant
```bash
npm start
# Visit: http://localhost:8080/emails/my-post/
```

### Find posts with margin notes
```bash
grep -l "mn-marker\|{% mn" content/blog/*/index.md
```

---

## Troubleshooting

### Build fails
```bash
# Check for syntax errors in config
node eleventy.config.js

# Run with debug output
npm run debug
```

### Assets not found
```bash
# Verify mirroring ran
ls -la content/*/assets/

# Force rebuild
rm -rf _site .cache
npm run build
```

### Fonts not loading
- Check Adobe Fonts kit is active: `https://use.typekit.net/jtc7wrn.css`
- Verify browser has system fonts (Noto/Source Han)
- Check browser console for errors

### Email endnotes not showing
- Verify `{% mn %}` syntax is correct
- Check `post.templateContent` has rendered HTML
- Inspect `/emails/<slug>/` in browser

---

## Documentation

- `so-far.md` - Project status and history
- `PREFLIGHT.md` - Pre-publish checklist
- `TYPOGRAPHY.md` - Font and color system
- `SESSION-SUMMARY.md` - Latest session summary
- `README.md` - Original starter documentation

---

## Contact / Help

For Eleventy help: https://www.11ty.dev/docs/  
For Buttondown help: https://docs.buttondown.com/

---

Last updated: 2024-12-24