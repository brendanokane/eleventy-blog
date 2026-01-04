# Workflow Guide — Burning House

Essential commands and workflows for the Burning House blog.

---

## Quick Commands

### Build & Serve

```bash
npm run build          # Build site to _site/
npm start              # Dev server with live reload (port 8080)
npm run debug          # Build with debug output
```

### Asset Management

```bash
npm run assets:localize         # Download Substack images to local
npm run assets:localize:dry     # Preview what would be downloaded
npm run assets:mirror           # Mirror assets for blog-less URLs (runs automatically before build)
```

---

## Writing & Publishing Posts

### 1. Create Post Structure

```bash
mkdir -p content/blog/<slug>/assets
touch content/blog/<slug>/index.md
```

### 2. Frontmatter (Required)

```yaml
---
title: "Post Title"
date: 2025-01-15
publish: false  # Set to true when ready
---
```

### 3. Preview Locally

```bash
npm start
# Web: http://localhost:8080/<slug>/
# Email: http://localhost:8080/emails/<slug>/
```

### 4. Publish to Web

Update frontmatter:
```yaml
publish: true
```

Build and deploy:
```bash
npm run build
# Deploy _site/ to your hosting
```

---

## Email Publishing (Buttondown)

### Setup (One-Time)

```bash
export BUTTONDOWN_API_KEY="your-api-key-here"
# Or add to ~/.zshrc or ~/.bashrc
```

### Publishing Flow

```bash
# List posts ready to send
npm run buttondown:list

# Preview what would be sent (safe)
npm run buttondown:send:dry <slug>

# Actually send the email
npm run buttondown:send <slug>
```

**Important:** Emails only send once (tracked via `buttondown_sent: true` in frontmatter). Subsequent edits update web/RSS but don't trigger emails.

---

## Margin Notes

### Shortcode Format (Preferred)

```markdown
Body text with a note.{% mn "anchor text" %}
Note content (can include *markdown*).
{% endmn %}
```

### HTML Format (Substack Imports)

```html
<sup class="mn-marker" data-mn-id="mn-1">※</sup>
<aside class="mn-note" id="mn-1">
Note content.
</aside>
```

Both formats work. Most posts use HTML (imported from Substack); Li Bai/Du Fu post uses shortcode.

---

## File Locations

- **Posts**: `content/blog/<slug>/index.md`
- **Assets**: `content/blog/<slug>/assets/*`
- **Config**: `eleventy.config.js`, `_data/metadata.js`
- **Layouts**: `_includes/layouts/`
- **CSS**: `css/index.css`
- **Scripts**: `scripts/`

---

## URLs

- Post: `/<slug>/`
- Email variant: `/emails/<slug>/`
- Assets: `/<slug>/assets/<file>`
- RSS: `/feed/feed.xml`

Note: No `/blog/` in URLs (blog-less paths for cleaner URLs).

---

## Frontmatter Reference

### Required
```yaml
title: "Post Title"
date: 2025-01-15
publish: true/false
```

### Optional
```yaml
summary: "Brief description (1-2 sentences)"
tags: [translation, poetry]
layout: layouts/post-woodblock.njk
bluesky_thread: "https://bsky.app/profile/..."
```

### Auto-Generated (by Buttondown script)
```yaml
buttondown_sent: true
buttondown_sent_date: 2025-01-15T10:30:00.000Z
buttondown_email_id: "abc123..."
```

---

## Troubleshooting

### Build fails
```bash
npm run debug  # Check for syntax errors
```

### Assets not found
```bash
ls -la content/<slug>/assets/  # Verify assets exist
npm run build                  # Rebuild
```

### Email variant missing
```bash
npm run build  # Must build before sending email
ls _site/emails/<slug>/index.html  # Verify output
```

### Post already sent
Post has `buttondown_sent: true` in frontmatter (prevents duplicate sends).

---

## Typography Quick Reference

- **Body**: Vollkorn / Noto Serif TC, 1.2rem, line-height 1.7
- **Headlines**: Noto Sans, bold
- **Margin notes**: Gill Sans / Noto Sans TC, 0.85rem
- **Colors**: Ink `#241425`, Paper `#f6f0e8`, Marker `#8f1d14`

---

## Documentation Files

- **WORKFLOW.md** (this file) — Commands and workflows
- **README.md** — Project overview and setup
- **STATUS.md** — Current project state
- **TYPOGRAPHY.md** — Typography details
- Other `.md` files at root — Archived design docs (can be ignored)

---

Last updated: 2026-01-04
