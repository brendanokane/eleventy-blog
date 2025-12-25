# CMS Evaluation for Burning House

Evaluating content management systems for an Eleventy-based bilingual literary blog with custom shortcodes (margin notes) and sophisticated typography.

## Requirements

### Must Have
- Git-backed (content in repository)
- Markdown support
- Frontmatter editing
- Works with existing file structure (`content/blog/<slug>/index.md`)
- Asset management (images)

### Nice to Have
- Custom shortcode support (`{% mn %}...{% endmn %}`)
- Preview of margin notes
- Bilingual content support (English/Chinese)
- Mobile editing
- Deploy integration

### Deal Breakers
- Requires restructuring content
- Database-dependent (loses git history)
- Doesn't work with Eleventy
- Complex setup (>2 hours)

---

## Option 1: PagesCMS ⭐️ RECOMMENDED

**What it is:** Git-based CMS that works directly with your GitHub/GitLab repository.

### Pros
✅ Works with existing structure (just point it at `content/blog/`)
✅ Git-backed (all edits are commits)
✅ Markdown editor with live preview
✅ Image upload to correct directories
✅ Frontmatter GUI
✅ Free for open source
✅ Can self-host or use hosted version
✅ OAuth integration (GitHub login)
✅ Mobile-friendly interface

### Cons
❌ No custom shortcode rendering in preview
❌ You'll type `{% mn %}...{% endmn %}` manually
❌ Preview won't show aligned margin notes
❌ Limited styling control in editor

### Setup Time
~30 minutes

### How to Set Up

1. **Install PagesCMS:**
   ```bash
   npm install -g @pages-cms/cli
   ```

2. **Initialize in your project:**
   ```bash
   pagescms init
   ```

3. **Configure `pages.config.js`:**
   ```javascript
   export default {
     content: 'content/blog',
     collections: {
       posts: {
         path: 'content/blog',
         fields: {
           title: { type: 'string', required: true },
           date: { type: 'date', required: true },
           publish: { type: 'boolean', default: false },
           draft: { type: 'boolean', default: true },
           buttondown_sent: { type: 'boolean', default: false },
           tags: { type: 'array' },
         }
       }
     }
   };
   ```

4. **Run locally:**
   ```bash
   pagescms dev
   ```

5. **Or deploy to Cloudflare/Vercel for team access**

### Verdict
**Best for:** Solo authoring with occasional edits, comfortable with markdown syntax.

**Use if:** You're okay typing shortcodes manually and previewing the built site separately.

---

## Option 2: Decap CMS (formerly Netlify CMS)

**What it is:** Open-source CMS that commits to git via a web interface.

### Pros
✅ Mature and stable
✅ Rich text editor option
✅ Git-backed
✅ Widget system for custom fields
✅ Works with any static site generator
✅ Good documentation

### Cons
❌ Requires `admin/config.yml` setup
❌ Editorial workflow can be complex
❌ Preview templates need custom React components
❌ Heavier setup than PagesCMS
❌ UI feels dated

### Setup Time
1-2 hours

### Configuration Example

Create `public/admin/config.yml`:

```yaml
backend:
  name: git-gateway
  branch: main

media_folder: "content/blog/{{slug}}/assets"
public_folder: "/{{slug}}/assets"

collections:
  - name: "blog"
    label: "Blog"
    folder: "content/blog"
    create: true
    slug: "{{slug}}"
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Date", name: "date", widget: "datetime"}
      - {label: "Publish", name: "publish", widget: "boolean", default: false}
      - {label: "Body", name: "body", widget: "markdown"}
```

### Verdict
**Best for:** Teams needing editorial workflow and role-based access.

**Use if:** You need multiple content types and complex workflows. Overkill for solo blogging.

---

## Option 3: Tina CMS

**What it is:** Visual editor with git backing, "edit-in-place" interface.

### Pros
✅ Visual editing (click on page to edit)
✅ Git-backed
✅ TypeScript schema for content
✅ Good developer experience
✅ Can see changes live as you type
✅ Block-based content editing

### Cons
❌ Complex setup
❌ Requires schema definition
❌ GraphQL layer (overkill for simple blogs)
❌ Custom shortcodes need custom components
❌ Heavier than other options

### Setup Time
2-3 hours

### Verdict
**Best for:** Sites with many content types and non-technical editors.

**Skip because:** Too complex for your use case. You're the only editor and comfortable with markdown.

---

## Option 4: Obsidian + CSS Snippets

**What it is:** Markdown editor app with powerful plugins, used as drafting environment.

### Pros
✅ Excellent markdown editing
✅ Local-first (fast, offline)
✅ Graph view for connected notes
✅ Custom CSS snippets for preview styling
✅ Templater plugin for shortcuts
✅ Vim mode available
✅ Can sync via git or Obsidian Sync

### Cons
❌ Not a CMS (no web interface)
❌ No built-in publishing workflow
❌ Still need to push to git manually
❌ Preview won't be exact (different renderer)

### Setup Steps

1. **Install Obsidian:** https://obsidian.md/

2. **Open your project as vault:**
   - Open folder: `eleventy-blog/content/blog/`

3. **Create CSS snippet** (`~/.obsidian/snippets/burninghouse.css`):
   ```css
   /* Copy relevant styles from your site CSS */
   .markdown-preview-view {
     font-family: "Vollkorn", serif;
     font-size: 1.2rem;
     line-height: 1.7;
     max-width: 64ch;
     margin: 0 auto;
   }
   
   .markdown-preview-view h1 {
     font-family: "Noto Sans", sans-serif;
     font-size: 2.5em;
   }
   ```

4. **Install Templater plugin:**
   - Settings → Community Plugins → Browse
   - Search "Templater"
   - Install and enable

5. **Create template** (`_templates/post.md`):
   ```markdown
   ---
   title: "<% tp.file.title %>"
   date: <% tp.date.now("YYYY-MM-DD") %>
   publish: false
   draft: true
   ---
   
   # <% tp.file.title %>
   
   Content here...
   ```

6. **Create margin note snippet:**
   - Settings → Templater → Enable
   - Create snippet: `{% mn "anchor" %}\n$1\n{% endmn %}`

### Verdict
**Best for:** Drafting and organizing ideas before publishing.

**Use with:** PagesCMS or direct git commits for actual publishing.

---

## Option 5: Drop-in WYSIWYG Editors

### EditorJS
**What:** Block-based editor like Notion/Medium.
**Verdict:** ❌ Outputs JSON, not Markdown. Would require custom converter.

### Tiptap
**What:** Headless rich text editor framework.
**Verdict:** ⚠️ Could work but requires building entire UI around it (2+ days of work).

### ProseMirror
**What:** Low-level editor framework.
**Verdict:** ❌ Too low-level. Would take weeks to build a usable CMS.

### Medium Editor / Quill
**What:** Simple WYSIWYG editors.
**Verdict:** ❌ Don't output markdown. Not suitable for SSG workflow.

### SimpleMDE / EasyMDE
**What:** Markdown WYSIWYG editors.
**Verdict:** ⚠️ Could integrate into a custom admin panel, but still need to build the panel.

**Conclusion:** None of these are "drop-in" solutions for your use case. They're components you'd use to *build* a CMS, not ready-to-use CMSs.

---

## Option 6: Forestry.io (Sunset) / CloudCannon

### Forestry.io
**Status:** Sunset in 2023, migrated to TinaCMS.
**Verdict:** ❌ Don't use, no longer maintained.

### CloudCannon
**What:** CMS for static site generators.
**Pros:** Good UI, visual editing, git-backed.
**Cons:** $$$ Paid service (~$45-75/month), overkill for solo blog.
**Verdict:** ⚠️ Good but expensive. Consider if you need client access or team collaboration.

---

## Option 7: No CMS (Pure Git + Editor)

**What:** Just use your preferred code editor (VS Code, Cursor, etc.) and commit directly.

### Pros
✅ Zero setup
✅ Full control
✅ Fast
✅ Works offline
✅ No abstraction layer
✅ Can use AI coding assistants

### Cons
❌ No web interface
❌ No mobile editing
❌ Manual git workflow
❌ No preview without building

### VS Code Setup

1. **Install extensions:**
   - Markdown All in One
   - Markdown Preview Enhanced
   - Front Matter CMS (lightweight alternative!)

2. **Front Matter CMS:**
   - Actually a VS Code extension that adds CMS features
   - Frontmatter GUI
   - Content dashboard
   - Media library
   - Worth trying: https://frontmatter.codes/

### Verdict
**Best for:** Developers comfortable with git who want maximum control.

---

## Hosting-Specific Considerations

### DigitalOcean

**App Platform:**
- Auto-deploy from git
- Environment variables for API keys
- $5-12/month
- Easy setup

**Droplets:**
- Full control (nginx, etc.)
- Can host large files (PDFs, podcasts)
- Need to manage server yourself
- $6-12/month

**Spaces (Object Storage):**
- Static hosting possible but clunky
- Better for large file storage
- $5/month + bandwidth

**Recommendation:** Use App Platform for the site + Spaces for large files.

### Cloudflare

**Pages:**
- Free for unlimited sites
- Auto-deploy from git
- Edge network (fast globally)
- Environment variables supported
- No SSH needed

**R2 (Object Storage):**
- S3-compatible
- Cheaper than S3 (~$0.015/GB)
- Good for large files

**Workers:**
- Could add dynamic features later (comments, search)
- Pay-as-you-go

**Recommendation:** Use Pages for site + R2 for large files. Most cost-effective.

---

## Final Recommendations

### Immediate Setup (This Week)

**Primary workflow:**
1. **Obsidian for drafting** — Fast, local, good UX
2. **PagesCMS for publishing** — Web interface when away from computer
3. **Direct git commits** — For quick fixes and template edits

**Why this combo:**
- Obsidian: Great for thinking/drafting, won't mess up your frontmatter
- PagesCMS: Web access when needed, proper git commits
- Direct git: Full control when needed

### Setup Steps

```bash
# 1. Install Obsidian
# Download from https://obsidian.md

# 2. Set up PagesCMS
npm install -g @pages-cms/cli
cd eleventy-blog
pagescms init

# 3. Configure PagesCMS (create pages.config.js as shown above)

# 4. Test locally
pagescms dev
```

### Hosting Recommendation

**Start with Cloudflare Pages:**
1. Free
2. Easy git integration
3. Fast edge network
4. Environment variables for `BUTTONDOWN_API_KEY`
5. Automatic HTTPS

**Add Cloudflare R2 later if you need large file storage.**

**Deployment steps:**
1. Push your repo to GitHub
2. Go to Cloudflare Pages dashboard
3. Connect repository
4. Build command: `npm run build`
5. Output directory: `_site`
6. Add environment variable: `BUTTONDOWN_API_KEY`
7. Done!

### Don't Bother With

- ❌ Building custom WYSIWYG editor (weeks of work, marginal benefit)
- ❌ Tina CMS (too complex for your needs)
- ❌ Paid CMSs (CloudCannon, etc.) — overkill for solo blog
- ❌ Decap CMS (dated, more complex than PagesCMS)

### Time Investment

- **PagesCMS setup:** 30 minutes
- **Obsidian + snippets:** 30 minutes  
- **Cloudflare Pages deploy:** 15 minutes
- **Total:** ~1.5 hours to full working CMS + hosting

### Future Considerations

If you later want:
- **Team collaboration:** Upgrade to CloudCannon or use PagesCMS hosted
- **Visual editing:** Consider Tina CMS (but prepare for complexity)
- **Advanced workflows:** Decap CMS
- **Client access:** CloudCannon with training

But for now, Obsidian + PagesCMS + Cloudflare Pages is the sweet spot.

---

## Quick Decision Matrix

| Feature | PagesCMS | Obsidian | Git+Editor | Decap | Tina |
|---------|----------|----------|------------|-------|------|
| Setup time | 30min | 30min | 0min | 2hr | 3hr |
| Web interface | ✅ | ❌ | ❌ | ✅ | ✅ |
| Mobile editing | ✅ | ⚠️ | ❌ | ✅ | ⚠️ |
| Git-backed | ✅ | ✅ | ✅ | ✅ | ✅ |
| Markdown | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Cost | Free | Free | Free | Free | Free |
| Learning curve | Low | Low | None | Med | High |
| **Recommendation** | ⭐️⭐️⭐️ | ⭐️⭐️⭐️ | ⭐️⭐️ | ⭐️ | ⚠️ |

**Legend:**
- ⭐️⭐️⭐️ Highly recommended
- ⭐️⭐️ Good option
- ⭐️ Usable but not ideal
- ⚠️ Possible with caveats
- ❌ Not suitable

---

## Next Steps

1. **Try Obsidian first** (30 min)
   - Install, open `content/blog/` as vault
   - Create CSS snippet from site styles
   - Draft one post
   
2. **Set up PagesCMS** (30 min)
   - Install CLI
   - Configure for your content
   - Test editing a post
   
3. **Deploy to Cloudflare Pages** (15 min)
   - Push to GitHub if not already
   - Connect to Cloudflare Pages
   - Set build command + env vars
   
4. **Test workflow:**
   - Draft in Obsidian
   - Publish via PagesCMS
   - Send email via Buttondown script
   
5. **Iterate as needed**

**Total time investment: ~1.5 hours to production-ready CMS + hosting.**