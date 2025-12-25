# Viewing Guide - Where to See Your New Features

Your dev server should be running at: **http://localhost:8080/**

---

## 🏠 Magazine-Style Homepage

**URL:** http://localhost:8080/

**What to look for:**
- Featured story section (if you have published posts)
- Hero stories grid (3-4 posts)
- Smaller story cards below
- Responsive grid that adapts to screen size

**Note:** Currently shows "Welcome to Burning House" because no posts have `publish: true` in their frontmatter. To test with real content:

1. Edit any post file in `content/blog/<slug>/index.md`
2. Add or change frontmatter: `publish: true`
3. Save and the dev server will rebuild automatically
4. Refresh the homepage

---

## 🎨 Design Playground

**URL:** http://localhost:8080/design-playground.html

**What you can do:**
- Adjust colors (paper, ink, rules)
- Change typography (fonts, sizes, line heights)
- Tune layout (column widths, gaps, borders)
- See changes in real-time with full post content
- Export settings as JSON

**Try it:**
1. Open the playground
2. Move the sliders and watch the preview update
3. When you find settings you like, click "📋 Copy JSON"
4. Share that JSON with me to apply to the actual site

---

## 📝 Typography Utilities (In Action)

To see the new typography classes, you'll need to use them in your posts. Here's how:

### Captions

Add to any post markdown:
```html
![Image description](/path/to/image.jpg)
<p class="caption">This is a properly styled caption.</p>
```

### Poems

```html
<div class="poem">
First line of verse
Second line of verse
Third line of verse
</div>
```

Or for centered poems:
```html
<div class="poem centered">
Centered verse
More centered verse
</div>
```

### Chinese Poetry

```html
<div class="poem" lang="zh-Hant">
天淨沙・秋思
枯藤老樹昏鴉
小橋流水人家
</div>
```

### Header Images (4 variants)

In your post markdown, add HTML before the main content:

**Image Left, Title Right:**
```html
<div class="header-image-l">
  <img src="/your-slug/assets/image.jpg" alt="Description">
  <div class="header-content">
    <h1>Your Post Title</h1>
    <p class="subtitle">Optional subtitle</p>
  </div>
</div>
```

**Image Right, Title Left:**
```html
<div class="header-image-r">
  <img src="/your-slug/assets/image.jpg" alt="Description">
  <div class="header-content">
    <h1>Your Post Title</h1>
  </div>
</div>
```

**Full Column Width:**
```html
<div class="header-image">
  <img src="/your-slug/assets/image.jpg" alt="Description">
</div>
```

**Full Bleed (Viewport Width):**
```html
<div class="header-image-f">
  <img src="/your-slug/assets/image.jpg" alt="Description">
</div>
```

---

## 🔍 Search Page

**URL:** http://localhost:8080/search/

**What it does:**
- Full-text search across all posts
- Character-based indexing (works with Classical Chinese!)
- Instant client-side results
- Excludes comments and margin notes from search

**Try searching for:**
- Any words from your existing posts
- Chinese characters (if you have Chinese content)

---

## 💬 Bluesky Comments & Likes

**Note:** These components are ready but require:
1. A published post
2. The post shared on Bluesky
3. The Bluesky post URL added to frontmatter: `bluesky_thread: "https://bsky.app/..."`

**To test the components:**
- Edit `_includes/components/bluesky-comments.njk` to see the code
- Edit `_includes/components/bluesky-likes.njk` to see the code

These will automatically appear on any post with a `bluesky_thread` URL in frontmatter.

---

## 🖼️ Social Card Generator (Test)

**Generate a test card:**

```bash
cd eleventy-blog
node scripts/generate-social-cards.mjs "Your Post Title" "Optional Subtitle" "January 15, 2025"
```

**View the result:**
- Opens `_site/og-test.png` in your image viewer
- 1200x630px PNG with woodblock-inspired design
- Ink-on-linen colors, thick borders, subtle texture

**Customization:**
- Edit `scripts/generate-social-cards.mjs`
- Adjust colors in the `COLORS` object
- Change layout in `generateSvgTemplate()`
- Test changes with the CLI command above

---

## 📚 Woodblock Aesthetic Guide

**File:** `WOODBLOCK-AESTHETIC.md`

**Open in your text editor** to read the comprehensive guide on:
- SVG filter techniques for organic borders
- Texture overlay methods
- What to avoid (grunge, fake aging)
- Code examples ready to use
- Testing checklist
- Performance considerations

**To start experimenting:**
1. Read the "Quick Start: Add One Effect" section
2. Try the organic border distortion first (easiest, most impactful)
3. Test on mobile before committing

---

## 📁 Key Files to Explore

### CSS
- `css/index.css` - All styles, including new utilities (~900 lines total)

### Templates
- `content/index.njk` - Magazine homepage layout
- `_includes/components/bluesky-comments.njk` - Comment system
- `_includes/components/bluesky-likes.njk` - Like counter
- `_includes/components/related-posts.njk` - Manual curation
- `content/search.njk` - Search page

### Scripts
- `scripts/generate-social-cards.mjs` - OG image generator
- `scripts/publish-to-buttondown.mjs` - Email publishing

### Documentation
- `WOODBLOCK-AESTHETIC.md` - Design guide (400 lines)
- `BLUESKY-INTEGRATION.md` - Comment system docs
- `PUBLISHING.md` - Publishing workflow
- `METADATA-SCHEMA.md` - Frontmatter reference
- `STATUS.md` - Project status
- `so-far.md` - Session notes and history

---

## 🎯 Quick Testing Checklist

To fully test the new features:

1. **Publish a test post:**
   - Edit `content/blog/<any-slug>/index.md`
   - Set `publish: true`
   - Add some test content
   - Save

2. **View magazine homepage:**
   - Visit http://localhost:8080/
   - See your post in the featured section
   - Resize browser to test responsive layout

3. **Try the design playground:**
   - Visit http://localhost:8080/design-playground.html
   - Adjust colors and typography
   - Export JSON of your favorite settings

4. **Test typography classes:**
   - Add a `.poem` div to a post
   - Add a `.caption` to an image
   - Try a header image variant
   - View the post to see the styling

5. **Generate a social card:**
   - Run the CLI command (see Social Card Generator section above)
   - View `_site/og-test.png`

6. **Search functionality:**
   - Visit http://localhost:8080/search/
   - Search for words from your content
   - Verify results appear instantly

---

## 🔧 Stopping/Starting the Dev Server

### Stop the server:
```bash
# Find the process
lsof -ti:8080

# Kill it (or just close the terminal)
kill <process-id>
```

### Start again:
```bash
cd eleventy-blog
npm start
```

The server will automatically rebuild when you save changes to:
- Markdown files
- Templates
- CSS
- Configuration

---

## 📸 Current State

✅ **Backed up to GitHub:** Branch `design/ink-linen-nav-typography`
✅ **Dev server running:** http://localhost:8080/
✅ **All features built:** Magazine layout, social cards, typography utilities
✅ **Documentation complete:** Guides for everything
✅ **Ready for polish:** Time to refine design and typography

---

## 🚀 Next Steps

Choose your own adventure:

### Option 1: Polish Design
1. Use design playground to dial in typography
2. Experiment with woodblock effects (use the guide)
3. Test on multiple screen sizes
4. Refine spacing and colors

### Option 2: Test with Real Content
1. Publish several posts (`publish: true`)
2. Add featured images (`post_image` in frontmatter)
3. See how the magazine layout looks with real content
4. Adjust as needed

### Option 3: Try Woodblock Effects
1. Read `WOODBLOCK-AESTHETIC.md`
2. Add the organic border distortion (simplest effect)
3. Test on mobile
4. Decide if you want more or less

---

## 💡 Tips

- **Design playground is your friend** - Use it to experiment before changing actual CSS
- **Start subtle** - It's easier to add effects than remove them
- **Test on mobile** - Resize your browser or use device emulation
- **Back up before big changes** - `git commit` frequently
- **Read the docs** - I wrote comprehensive guides for everything

---

Enjoy exploring your new site! 🎨✨