# Astro Feasibility Check: Can It Do Everything Eleventy Does?

**Question:** Is there anything Eleventy currently does that Astro cannot do?

**Short Answer:** No. Everything is feasible. Some things need custom code, but nothing is blocked.

---

## Critical Features: Can Astro Do It?

### ✅ 1. Margin Notes with Sequential Numbering

**Eleventy Approach:** Per-page Map tracking counters

**Astro Approach:** Multiple options

#### Option A: Remark Plugin (Build-time)
```javascript
// Process markdown at build time, inject counters
export function remarkMarginNotes() {
  let counter = 0;
  
  return (tree, file) => {
    counter = 0; // Reset per file
    
    visit(tree, 'mdxJsxFlowElement', (node) => {
      if (node.name === 'MarginNote') {
        counter++;
        node.attributes.push({
          type: 'mdxJsxAttribute',
          name: 'number',
          value: counter,
        });
      }
    });
  };
}
```

**Pros:** Automatic numbering, no manual work  
**Cons:** Need to learn remark plugins

#### Option B: Vite Plugin (Build-time)
```javascript
// Transform MDX files during build
export function viteMarginNotes() {
  return {
    name: 'margin-notes',
    transform(code, id) {
      if (!id.endsWith('.mdx')) return;
      
      let counter = 0;
      return code.replace(/<MarginNote>/g, () => {
        counter++;
        return `<MarginNote number={${counter}}>`;
      });
    }
  };
}
```

**Pros:** Works with existing setup  
**Cons:** Regex-based (less robust)

#### Option C: Component with Context (Runtime)
```astro
---
// Create a context provider for the page
import { setPageContext } from '../lib/context';

const counter = { mn: 0 };
setPageContext('counter', counter);
---

// In MarginNote component:
---
const counter = getPageContext('counter');
counter.mn++;
const noteNum = counter.mn;
---
```

**Pros:** Simple, uses React-like patterns  
**Cons:** Runtime overhead (minimal)

#### Option D: Manual Numbers (Fallback)
```mdx
<MarginNote number={1}>First note</MarginNote>
<MarginNote number={2}>Second note</MarginNote>
```

**Pros:** Complete control, no magic  
**Cons:** Manual numbering (but at least it's explicit)

**Verdict:** ✅ **Feasible**. Option A (remark plugin) is cleanest. Option D works immediately.

---

### ✅ 2. Dual Output (Web + Email)

**Eleventy Approach:** Two layouts, `emailifyMarginNotes` filter

**Astro Approach:** Multiple options

#### Option A: Separate Layouts
```
src/
  layouts/
    PostLayout.astro        # Web version
    PostLayoutEmail.astro   # Email version
  pages/
    blog/[slug].astro       # Web
    emails/[slug].astro     # Email
```

**Both layouts use same content, different rendering:**

```astro
// PostLayoutEmail.astro
---
const { Content } = await post.render();

// Transform margin notes to endnotes
function transformToEmail(html) {
  // Same logic as emailifyMarginNotes
  let endnotes = [];
  let counter = 0;
  
  let transformed = html.replace(
    /<MarginNote[^>]*>(.*?)<\/MarginNote>/g,
    (match, content) => {
      counter++;
      endnotes.push(content);
      return `<sup><a href="#fn-${counter}">${counter}</a></sup>`;
    }
  );
  
  return { transformed, endnotes };
}
---
```

**Pros:** Same pattern as Eleventy  
**Cons:** Need to port emailifyMarginNotes logic

#### Option B: Build-time Output Variants
```javascript
// astro.config.mjs
export default defineConfig({
  output: 'static',
  build: {
    // Generate both versions
  }
});
```

**Verdict:** ✅ **Feasible**. Option A is straightforward port of existing logic.

---

### ✅ 3. Poem Component with YAML Loading

**Status:** ✅ **Already Working** in prototype!

```astro
---
import { getEntry } from 'astro:content';

const poem = await getEntry('poems', id);
---

<div class="poem-container">
  {poem.data.title?.zh && <h3>{poem.data.title.zh}</h3>}
  {/* ... */}
</div>
```

**This is BETTER than Eleventy:**
- Type-safe access to poem data
- Auto-completion in IDE
- Build fails if poem doesn't exist (catches errors early)

**Verdict:** ✅ **Already done**.

---

### ✅ 4. RSS/Atom Feeds

**Eleventy Approach:** `@11ty/eleventy-plugin-rss`

**Astro Approach:** Built-in RSS support

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://burninghou.se',
});
```

```typescript
// src/pages/feed.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');
  
  return rss({
    title: 'Burning House',
    description: 'Essays, notes, and translations',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
```

**Verdict:** ✅ **Easier than Eleventy**. Built-in support, cleaner API.

---

### ✅ 5. Bluesky Comments Integration

**Eleventy Approach:** Async filter fetching from API

**Astro Approach:** Same logic, different syntax

```astro
---
// In PostLayout.astro
import { getBlueskyComments } from '../lib/bluesky-comments';

const { bluesky_thread } = post.data;
const comments = bluesky_thread 
  ? await getBlueskyComments(bluesky_thread)
  : [];
---

{comments.length > 0 && (
  <section class="bluesky-comments">
    <h2>Discussion ({comments.length})</h2>
    {comments.map(comment => (
      <article class="comment">
        <header>
          <img src={comment.author.avatar} alt="" />
          <strong>{comment.author.displayName}</strong>
        </header>
        <p>{comment.text}</p>
      </article>
    ))}
  </section>
)}
```

**The bluesky-comments.js logic is identical**, just imported differently.

**Verdict:** ✅ **Direct port**. Same code, different import.

---

### ✅ 6. Publishing Workflow

**Eleventy Approach:** Node scripts in `scripts/`

**Astro Approach:** Same scripts, minor tweaks

```javascript
// scripts/publish-workflow.mjs
// Almost identical, just change paths:

const SITE_DIR = path.join(PROJECT_ROOT, 'dist'); // was '_site'
const CONTENT_DIR = path.join(PROJECT_ROOT, 'src/content/blog'); // was 'content/blog'
```

**Verdict:** ✅ **Trivial changes**. Scripts are framework-agnostic.

---

### ✅ 7. Buttondown Email Integration

**Eleventy Approach:** Fetch HTML from `_site/emails/`

**Astro Approach:** Fetch HTML from `dist/emails/`

```javascript
// scripts/publish-to-buttondown.mjs
const emailPath = path.join(PROJECT_ROOT, 'dist/emails', slug, 'index.html');
// Rest is identical
```

**Verdict:** ✅ **One-line change**.

---

### ✅ 8. Search (Pagefind)

**Eleventy Approach:** Run after build

**Astro Approach:** Same

```bash
npm run build && npx pagefind --site dist
```

**Verdict:** ✅ **Identical**. Pagefind is framework-agnostic.

---

### ✅ 9. Custom Markdown Processing

**Eleventy Approach:** markdown-it with custom config

**Astro Approach:** Remark/Rehype plugins (more powerful)

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  markdown: {
    remarkPlugins: [
      // Custom plugins for special processing
    ],
    rehypePlugins: [
      // HTML transformation plugins
    ],
  },
});
```

**Verdict:** ✅ **More powerful than Eleventy**.

---

### ✅ 10. Vertical Chinese Typography

**Status:** CSS-only, framework-agnostic

```css
.poem-text-zh {
  writing-mode: vertical-rl;
  text-orientation: upright;
}
```

**Verdict:** ✅ **Works identically**. CSS doesn't care about framework.

---

## What Needs to Be Built

### Week 1: Core Infrastructure ✅ (Done)
- [x] Astro setup
- [x] Content collections
- [x] Base layouts
- [x] CSS ported
- [x] Poem component

### Week 2: Components & Features
- [ ] Margin note counter logic (3-4 hours)
  - Remark plugin OR manual numbering
- [ ] Figure component with Image optimization (1 hour)
- [ ] Footnote component (2 hours)
- [ ] Email layout (4-6 hours)
  - Port emailifyMarginNotes transformation
- [ ] RSS feed (1 hour)

**Total: ~2-3 days**

### Week 3: Publishing & Integration
- [ ] Update publish-workflow.mjs (2 hours)
- [ ] Update publish-to-buttondown.mjs (1 hour)
- [ ] Port Bluesky integration (2 hours)
- [ ] Test publishing flow (2 hours)
- [ ] Add Pagefind (1 hour)

**Total: ~1-2 days**

### Week 4: Content Migration
- [ ] Run conversion script (10 minutes)
- [ ] Review all 36 posts (3-4 hours)
- [ ] Fix edge cases (2-3 hours)
- [ ] Test each post (2 hours)

**Total: ~1 day**

### Week 5: Polish & Launch
- [ ] Vertical typography refinements (2-3 days)
- [ ] Mobile testing (1 day)
- [ ] Accessibility audit (half day)
- [ ] Performance testing (half day)
- [ ] Deploy (1 hour)

**Total: ~4-5 days**

---

## Updated Timeline

**Realistic estimate with focused work:**
- Week 1: Foundation ✅ (already done)
- Week 2: Features (3 days)
- Week 3: Publishing (2 days)
- Week 4: Content (1 day)
- Week 5: Polish (5 days)

**Total: ~3 weeks** of focused work (not 4-5 weeks)

With part-time work (2-3 hours/day):
- **~6-8 weeks calendar time**

---

## Showstoppers: Any Deal-Breakers?

Let me be brutally honest about potential issues:

### ❓ Margin Note Counters

**Risk Level:** 🟡 Medium

**Why:** The remark plugin approach requires learning remark AST manipulation.

**Mitigation:** 
- Option 1: Learn remark (2-3 hours, one-time investment)
- Option 2: Use manual numbering temporarily
- Option 3: Use Vite plugin (simpler regex approach)

**Verdict:** Not a blocker. Multiple solutions exist.

---

### ❓ Email Transformation

**Risk Level:** 🟡 Medium

**Why:** Need to port complex regex logic from emailifyMarginNotes.

**Mitigation:**
- Copy existing function almost verbatim
- Regex patterns are framework-agnostic
- Already tested and working in Eleventy

**Verdict:** Not a blocker. Direct port.

---

### ❓ Build-time Data Fetching (Bluesky)

**Risk Level:** 🟢 Low

**Why:** Astro has excellent async support.

```astro
---
// This just works in Astro
const comments = await getBlueskyComments(url);
---
```

**Verdict:** Easier than Eleventy (no async filter quirks).

---

### ❓ Blog-less URLs

**Risk Level:** 🟢 Low

**Astro Approach:**
```
src/pages/
  [slug].astro          # /<slug>/
  emails/[slug].astro   # /emails/<slug>/
```

Or use routing:
```
src/pages/
  blog/[...slug].astro  # /blog/<slug>/
```

Then configure redirects or use dynamic routing to strip `/blog/`.

**Verdict:** Multiple approaches, all straightforward.

---

### ❓ Asset Management

**Risk Level:** 🟢 Low

**Current:** Assets in `content/blog/<slug>/assets/`  
**Astro:** Assets in `public/<slug>/assets/` OR `src/content/blog/<slug>/assets/`

**Both work.** Astro's Image component handles both.

**Verdict:** No changes needed.

---

## The Only Real Question

**Not "Can Astro do it?"** (Yes, everything is feasible)

**But "Is 3 weeks worth it for?"**

### What You Gain:
1. ✅ **Better image handling** (10x smaller files, zero config)
2. ✅ **Better syntax** (`<Component>` vs `{%`)
3. ✅ **Better errors** (clear, actionable messages)
4. ✅ **Faster builds** (3s vs 8.5s, will scale better)
5. ✅ **Type safety** (catch bugs at build time)
6. ✅ **Modern tooling** (Vite, TypeScript, better DX)
7. ✅ **Future-proof** (Astro is actively developed, growing)

### What You Spend:
- **~3 weeks of focused work**
- **~6-8 weeks calendar time** (if part-time)

### What You Risk:
- **Nothing critical**. All features are achievable.
- Worst case: Hit an unforeseen issue, pause migration, finish in Eleventy.

---

## My Recommendation Has Changed

**Before seeing image handling:** "Maybe not worth it, 50/50"

**After seeing image handling:** "Probably worth it, 70/30"

**Why the shift:**

1. Images are currently a pain point (disabled eleventy-img)
2. Astro solves it completely with zero config
3. Your readers get 10x faster loads
4. The migration is more straightforward than I initially thought
5. 3 weeks is manageable for a long-term improvement

**The calculus:**
- **Cost:** 3 weeks of work
- **Benefit:** Better experience for you (DX) and readers (performance)
- **Risk:** Low (everything is feasible)

**If you have 3 weeks:** Do it.  
**If you need to launch now:** Finish in Eleventy, migrate later.

---

## The Decision Framework

### Choose Astro IF:
✓ You have 3 weeks available  
✓ Image optimization matters to you  
✓ The `{%` syntax genuinely bothers you  
✓ You're excited about modern tooling  
✓ You want faster page loads for readers  

### Stay with Eleventy IF:
✓ You need to launch in <2 weeks  
✓ Images are "good enough" (they're not, but maybe you don't care)  
✓ The syntax difference feels minor  
✓ You just want to write posts, not rebuild  

---

## Final Verdict: No Showstoppers

**Every feature Eleventy currently does can be replicated in Astro.**

Some require custom code (margin note counters, email transformation), but nothing is impossible or even particularly difficult.

The question isn't capability—it's **priority and timeline**.

If you have the time, Astro is the better long-term choice.

If you need to ship now, Eleventy works fine.

**What's your timeline?**
