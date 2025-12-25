# Burning House — Eleventy Blog

A bilingual (English/Traditional Chinese) literary translation blog with a woodblock-inspired design and sophisticated margin notes system.

## Features

- 🎨 **Woodblock-inspired design** — Ink-on-linen aesthetic with thoughtful typography
- 📝 **Margin notes** — Align vertically with markers in text, responsive behavior
- 🌏 **Bilingual support** — Optimized for English and Traditional Chinese
- 📧 **Email integration** — Buttondown API for newsletter distribution
- 🖼️ **Image optimization** — Automatic responsive images via eleventy-img
- 📱 **Responsive design** — Graceful degradation from desktop to mobile
- 🔍 **Dual output** — Web (with margin notes) and email (with endnotes) variants

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd eleventy-blog

# Install dependencies
npm install

# Start development server
npm run start
```

The site will be available at `http://localhost:8080/`

## Project Structure

```
eleventy-blog/
├── content/
│   ├── blog/
│   │   └── <slug>/
│   │       ├── index.md           # Post content (Markdown + frontmatter)
│   │       └── assets/            # Images and files for this post
│   ├── feed/                      # RSS/Atom feed templates
│   └── emails/                    # Email variant collection
├── _includes/
│   └── layouts/
│       ├── post-woodblock.njk     # Main post layout (web version)
│       └── post-email.njk         # Email variant layout
├── _config/
│   ├── filters.js                 # Eleventy filters (including emailifyMarginNotes)
│   └── localize-substack-images.mjs
├── scripts/
│   └── publish-to-buttondown.mjs  # Email publishing script
├── public/
│   ├── css/
│   └── design-playground.html     # Typography testing playground
├── _site/                         # Build output (generated, not in git)
└── PUBLISHING.md                  # Complete publishing workflow guide
```

### Key Concepts

**Source of truth:** Everything lives in `content/blog/<slug>/`
- `index.md` — Post content
- `assets/` — Images (git-tracked)

**Published URLs:** Blog-less for cleaner paths
- Post: `/<slug>/`
- Images: `/<slug>/assets/image.jpg`

**Dual variants:**
- Web: `/<slug>/` (woodblock layout with margin notes)
- Email: `/emails/<slug>/` (endnotes for email clients)

## Writing Posts

### 1. Create a New Post

```bash
mkdir -p content/blog/my-new-post/assets
touch content/blog/my-new-post/index.md
```

### 2. Frontmatter

```yaml
---
title: "Your Post Title"
date: 2025-01-15
publish: false         # Set to true when ready
draft: true            # Optional, for your own organization
tags:
  - translation
  - poetry
---
```

### 3. Margin Notes

Use the `{% mn %}` shortcode for margin notes:

```markdown
This is body text with a note.{% mn "anchor text" %}
This is the content of the margin note. It can contain *markdown*.
{% endmn %}
```

**Important:** Margin notes should be brief. Long notes may overlap. For extended commentary, consider regular paragraphs or footnotes.

### 4. Images

Place images in `content/blog/<slug>/assets/` and reference them:

```markdown
![Alt text](/<slug>/assets/image.jpg)
```

Eleventy will automatically optimize and create responsive variants.

### 5. Chinese Text

Wrap Chinese text with `lang` attribute for proper typography:

```markdown
<span lang="zh-Hant">繁體中文</span>
```

Chinese text is never italicized (even in `<em>` tags), but other text within the same element can be.

## Development Commands

### Building

```bash
npm run build              # Build site to _site/
npm run start              # Dev server with hot reload
npm run debug              # Build with debug output
```

### Assets

```bash
npm run assets:organize    # Organize local images
npm run assets:localize    # Download Substack images to local
```

### Email Publishing

```bash
npm run buttondown:list              # List posts ready to send
npm run buttondown:send:dry <slug>   # Preview (safe)
npm run buttondown:send <slug>       # Actually send email
```

See `PUBLISHING.md` for complete workflow.

## Publishing Workflow

### 1. Preview Locally

```bash
npm run start
```

Check both:
- Web version: `http://localhost:8080/<slug>/`
- Email version: `http://localhost:8080/emails/<slug>/`

### 2. Publish to Web

Update frontmatter:

```yaml
publish: true
```

Build and deploy:

```bash
npm run build
# Deploy _site/ to your hosting
```

### 3. Send Email (First Publication Only)

Set your Buttondown API key:

```bash
export BUTTONDOWN_API_KEY="your-api-key"
```

Send email:

```bash
npm run buttondown:send <slug>
```

The script automatically:
- Gets HTML from `_site/emails/<slug>/`
- Sends to Buttondown API
- Updates frontmatter with `buttondown_sent: true`
- Prevents duplicate sends

Subsequent edits update the web/feed but don't trigger emails.

## Design System

### Typography

**Body text:**
- Font: Vollkorn (Latin), Noto Serif TC (Chinese)
- Size: 1.2rem
- Line height: 1.7

**Headlines:**
- Font: Noto Sans (Latin/Chinese)
- H1: 2.5em, weight 800
- H2: 1.75em, weight 700

**Margin notes:**
- Font: Gill Sans (Latin), Noto Sans TC (Chinese)
- Size: 0.85rem
- Line height: 1.3

### Colors

- Paper: `#f6f0e8` (warm beige)
- Ink: `#241425` (dark purple-brown)
- Muted ink: `#3a223a`
- Marker: `#8f1d14` (dark red)

### Testing Typography

Open `http://localhost:8080/design-playground.html` for live typography controls. Export settings as JSON to apply to production.

### Responsive Behavior

1. **Desktop (>950px):** Two columns with margin notes
2. **Margins shrink first:** 12rem → 8rem → 4rem → 2rem → 1rem at breakpoints
3. **Mobile (≤950px):** Single column, margin notes hidden by default, tap markers to toggle

## Margin Notes System

### How It Works

1. **HTML structure:** Substack imports use `<sup class="mn-marker">` + `<aside class="mn-note">`
2. **JavaScript alignment:** On page load, notes are moved to be direct children of `.wb-grid` and positioned to align with markers
3. **Responsive:** Recalculates on window resize (debounced)
4. **Mobile:** Notes start hidden, toggle on marker tap

### Email Variant

The `emailifyMarginNotes` filter converts margin notes to numbered endnotes for email:

- Markers become superscript numbers with anchor links
- Notes appear at end with backlinks
- Works with both shortcode and Substack HTML

## Deployment

### Build for Production

```bash
npm run build
```

Output is in `_site/` directory.

### Hosting Options

**DigitalOcean:**
- App Platform (automatic deployments from git)
- Droplet + nginx (full control)
- Spaces (static hosting)

**Cloudflare Pages:**
- Connect git repository
- Build command: `npm run build`
- Output directory: `_site`
- Automatic edge deployment

**Netlify/Vercel:**
- Similar to Cloudflare Pages
- One-click deployment from git

### Environment Variables

Set these in your hosting platform:

```
BUTTONDOWN_API_KEY=your-api-key-here
```

## Content Management

### Current: Manual Editing

Edit markdown files directly in `content/blog/<slug>/index.md`

### Future: CMS Options

Evaluating:
- **PagesCMS** — Git-based, works with existing structure
- **Decap CMS** (formerly Netlify CMS)
- **Tina CMS** — Visual editing with git backing
- **Obsidian** — With custom CSS snippets (for drafting)

## Troubleshooting

### Margin notes overlapping

Keep notes brief (3-4 sentences max). Long notes may overlap. Consider editing down or converting to regular paragraphs/endnotes.

### Images not loading

- Check path: `/<slug>/assets/image.jpg` (note: no `/blog/` in URL)
- Run `npm run build` to ensure assets are copied
- Check `_site/<slug>/assets/` exists

### Email variant missing

Run `npm run build` first. Email HTML must exist at `_site/emails/<slug>/index.html` before sending to Buttondown.

### "Post already sent to Buttondown"

The post has `buttondown_sent: true` in frontmatter. This prevents duplicate sends. To override (BE CAREFUL):

```bash
node scripts/publish-to-buttondown.mjs --post <slug> --force
```

## Technical Details

### Stack

- **Eleventy 3.x** — Static site generator
- **Markdown-it** — Markdown parsing with custom rendering
- **eleventy-img** — Image optimization
- **Nunjucks** — Templating
- **Buttondown** — Email newsletter service

### Custom Features

1. **Synchronous margin note rendering** — Uses markdown-it directly to avoid async issues
2. **Dual output strategy** — Same content, two layouts (web + email)
3. **Asset copying via Eleventy events** — Avoids cluttering source directories
4. **Frontmatter-based email tracking** — Prevents duplicate sends

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid required
- JavaScript required for margin note alignment
- Progressive enhancement: Notes visible but not aligned if JS fails

## Contributing

This is a personal blog, but if you're working on it:

1. Test both web and email variants
2. Check responsive behavior at multiple breakpoints
3. Verify margin note alignment after CSS changes
4. Run `npm run build` before committing to catch errors

## Documentation

- `PUBLISHING.md` — Complete publishing workflow
- `TYPOGRAPHY.md` — Typography details and rationale
- `PREFLIGHT.md` — Pre-launch checklist
- This README — Project overview and setup

## License

[Your license here]

## Acknowledgments

- Eleventy starter blog by Zach Leatherman
- Typography inspired by Ming dynasty woodblock prints
- Margin notes inspired by Tufte CSS and LessWrong