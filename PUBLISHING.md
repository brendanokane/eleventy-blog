# Publishing Workflow Guide

This document describes how to publish posts to your site and send them to Buttondown email subscribers.

## File Organization

Your content lives in a clean structure:

```
content/blog/<slug>/
  ├── index.md          # Post content (source of truth)
  └── assets/           # Images and files for this post
      ├── image1.jpg
      └── image2.png
```

**Note:** You may see `content/<slug>/assets/` directories locally, but these are build artifacts (mirrored from `content/blog/<slug>/assets/` to make URLs work without `/blog/` in them). They're gitignored and regenerated on each build.

## Publishing a New Post

### 1. Write Your Post

Create or edit: `content/blog/<slug>/index.md`

```yaml
---
title: "Your Post Title"
date: 2025-01-15
publish: false  # Start with false
draft: true
---

Your content here...
```

### 2. Preview Locally

```bash
npm run start
# Opens at http://localhost:8080/<slug>/
```

Check both layouts:
- **Web version:** `http://localhost:8080/<slug>/`
- **Email version:** `http://localhost:8080/emails/<slug>/`

### 3. Publish to Web

When ready, update frontmatter:

```yaml
publish: true
draft: false  # Optional, for your own organization
```

Build and deploy:

```bash
npm run build
# Deploy _site/ to your hosting (however you do that)
```

### 4. Send to Buttondown Subscribers

**Important:** This only happens on FIRST publication. Subsequent edits update the web + RSS feed but don't trigger emails.

#### Setup (one-time):

Get your API key from https://buttondown.com/settings/api

```bash
export BUTTONDOWN_API_KEY="your-api-key-here"
# Or add to your .env file or shell profile
```

#### List posts ready to send:

```bash
npm run buttondown:list
```

This shows posts with `publish: true` and no `buttondown_sent: true`.

#### Preview what would be sent:

```bash
npm run buttondown:send:dry <slug>
# Example: npm run buttondown:send:dry the-naming-of-cats
```

#### Actually send the email:

```bash
npm run buttondown:send <slug>
# Example: npm run buttondown:send the-naming-of-cats
```

This will:
1. Get the HTML from `_site/emails/<slug>/index.html`
2. Send it to Buttondown API
3. Update frontmatter to add:
   ```yaml
   buttondown_sent: true
   buttondown_sent_date: 2025-01-15T10:30:00.000Z
   buttondown_email_id: abc123...
   ```

## Editing Published Posts

If you edit a post after publication:

1. Edit `content/blog/<slug>/index.md`
2. Run `npm run build` and deploy

**Result:**
- ✅ Web version updated
- ✅ RSS feed updated
- ❌ No email sent (because `buttondown_sent: true` exists)

This is by design - subscribers only get the initial publication email.

## Frontmatter Fields

### Required for all posts:
- `title`: Post title
- `date`: Publication date (YYYY-MM-DD format)

### Publication control:
- `publish: true/false` - Whether post appears on public site
- `draft: true/false` - For your own organization (doesn't affect build)

### Buttondown tracking (auto-added by script):
- `buttondown_sent: true/false` - Prevents duplicate sends
- `buttondown_sent_date` - ISO timestamp of when email was sent
- `buttondown_email_id` - Buttondown's ID for the sent email

## Troubleshooting

### "Email HTML not found" error

Run `npm run build` first! The script needs the built HTML from `_site/emails/<slug>/`.

### "Post has already been sent to Buttondown"

The post has `buttondown_sent: true` in frontmatter. This prevents accidental duplicate emails.

If you REALLY need to resend (be careful!):
```bash
node scripts/publish-to-buttondown.mjs --post <slug> --force
```

### "BUTTONDOWN_API_KEY environment variable not set"

Set your API key:
```bash
export BUTTONDOWN_API_KEY="your-key-here"
```

Or add to `~/.zshrc` / `~/.bashrc`:
```bash
export BUTTONDOWN_API_KEY="your-key-here"
```

## Quick Reference

```bash
# Development
npm run start                              # Local dev server with hot reload

# Building
npm run build                              # Build site to _site/

# Email publishing
npm run buttondown:list                    # List posts ready to send
npm run buttondown:send:dry <slug>         # Preview (safe)
npm run buttondown:send <slug>             # Actually send

# Asset management
npm run assets:localize                    # Download Substack images
npm run assets:organize                    # Organize local images
```

## Workflow Summary

1. **Write** → Edit `content/blog/<slug>/index.md` with `publish: false`
2. **Preview** → `npm run start` and check both web and email versions
3. **Publish Web** → Set `publish: true`, run `npm run build`, deploy
4. **Send Email** → Run `npm run buttondown:send <slug>` (one-time only)
5. **Edit Later** → Just rebuild and deploy (no email sent)

That's it! The frontmatter tracking ensures emails only go out once.
