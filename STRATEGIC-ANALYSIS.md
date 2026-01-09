# Strategic Analysis: Is Eleventy the Right Choice?
**Date:** January 9, 2026  
**Question:** Should we continue with Eleventy or consider alternatives?

## Executive Summary

**Short Answer:** **Yes, stay with Eleventy** — but with clear eyes about what you're committing to.

**Why:**
- You're 80% done with a working implementation
- Your requirements align well with static site generators
- The complexity you've encountered is inherent to the problem, not the tool
- Migration would reset you to 0% while facing the same challenges

**Key Insight:** The hard parts (margin notes, responsive typography, email transformation) will be equally hard in any framework. The difference is you've already solved them in Eleventy.

---

## What You're Actually Building

Let me restate your requirements based on the codebase and documentation:

### Core Features
1. **Literary blog with sophisticated typography**
   - Bilingual (English + Traditional Chinese)
   - Vertical Chinese text layout
   - Professional typesetting (variable fonts, proper CJK rendering)
   - Woodblock-inspired aesthetic

2. **Margin notes system**
   - Tufte-style side notes
   - Multi-paragraph with blockquotes
   - Responsive (desktop margin, mobile toggle)
   - Accessible (ARIA, keyboard support)

3. **Dual output formats**
   - Web: Full-featured with margin notes
   - Email: Simplified with endnotes
   - RSS/Atom feeds

4. **Content ownership & portability**
   - Plain markdown files
   - Git-based workflow
   - No vendor lock-in
   - Offline editing

5. **Publishing workflow**
   - Preview before publish
   - Email newsletter integration (Buttondown)
   - Social media integration (Bluesky)
   - No accidental re-sends

6. **Poetry collection system**
   - Reusable YAML-based poems
   - Consistent rendering across posts
   - Support for traditional vertical layout

### Future Aspirations (from docs)
- Possible CMS for easier editing
- Automated social card generation
- Better dark mode
- Performance optimization

---

## The Eleventy Case

### Strengths for Your Use Case

1. **Content as Source of Truth**
   - Markdown files you own forever
   - Git version control
   - Can edit in any text editor
   - Easy backup and migration

2. **Build-Time Processing**
   - Complex transformations happen once (margin notes → endnotes)
   - Fast page loads (no client-side rendering)
   - SEO-friendly (all content in HTML)
   - Works without JavaScript

3. **Flexibility Without Framework Lock-In**
   - Custom shortcodes for domain-specific needs
   - Direct control over HTML output
   - Any CSS framework (or none)
   - Escape hatches everywhere

4. **Strong Templating**
   - Nunjucks is powerful and well-documented
   - Template inheritance and composition
   - Filters for data transformation
   - Multiple template languages supported

5. **Deployment Simplicity**
   - Static files deploy anywhere
   - No server maintenance
   - CDN-friendly
   - Cheap hosting (or free)

### Weaknesses for Your Use Case

1. **Build-Time Complexity**
   - All logic runs during build, not request time
   - Debugging is harder (no stack traces in browser)
   - Async operations are awkward
   - State management across pages requires Maps/globals

2. **JavaScript Configuration**
   - eleventy.config.js can become large
   - No clear separation between content logic and build logic
   - Plugin interactions can be subtle

3. **Limited Ecosystem for Niche Needs**
   - No built-in margin notes solution (you built it yourself)
   - No built-in dual-output solution (you built it yourself)
   - Limited CJK typography resources (you researched it yourself)

4. **Developer Experience**
   - Hot reload can be slow with many posts
   - Error messages sometimes unclear
   - Template debugging is primitive

5. **No Built-In Admin Interface**
   - Must add separate CMS if you want visual editing
   - Git workflow requires technical comfort

---

## Alternative Approaches

Let me honestly evaluate alternatives for your specific needs.

### Option 1: Next.js (React-based)

**What It Is:** React framework with static site generation (SSG) support

**Pros:**
- Huge ecosystem and community
- Excellent developer experience
- Great documentation
- Can do static (SSG) or dynamic (SSR) or both
- Strong TypeScript support
- Built-in image optimization
- Incremental static regeneration

**Cons:**
- **MASSIVE COMPLEXITY** for a blog
- React component model doesn't fit markdown-centric content well
- MDX is powerful but has its own learning curve
- Much larger build output (React runtime)
- Overkill for static content
- Frequent breaking changes across major versions

**Verdict for Your Use Case:** ❌ **Overkill**

You're not building an interactive web app. You're building a content site. Next.js solves problems you don't have (client-side interactivity, complex routing, API routes) while adding complexity you don't want.

**Migration Effort:** 8-10 weeks (rewrite everything in React/MDX)

---

### Option 2: Astro

**What It Is:** Modern static site generator with "island architecture"

**Pros:**
- Markdown-first like Eleventy
- Better developer experience (better error messages, faster builds)
- Supports multiple UI frameworks (React, Vue, etc.) if needed
- Built-in image optimization
- Good documentation
- Active development
- Can ship zero JavaScript by default

**Cons:**
- Different templating approach (components vs templates)
- Smaller community than Next.js or Eleventy
- Your margin notes system would need complete rewrite
- Email transformation would need complete rewrite
- Less mature plugin ecosystem

**Verdict for Your Use Case:** 🟡 **Interesting but not worth switching now**

Astro is genuinely good and might be better for a greenfield project. But you've already solved the hard problems in Eleventy. Astro would give you better DX but require rebuilding your custom solutions.

**Migration Effort:** 6-8 weeks (rewrite templates and build logic)

---

### Option 3: Hugo

**What It Is:** Extremely fast static site generator written in Go

**Pros:**
- **Blazingly fast builds** (10-100x faster than Eleventy)
- Single binary (no node_modules)
- Mature and stable
- Good documentation
- Built-in image processing
- Strong template system (Go templates)

**Cons:**
- Go templates are verbose and less intuitive than Nunjucks
- No custom shortcode JavaScript (would need Go plugins)
- Harder to do complex transformations (margin notes → endnotes)
- Less flexible than Eleventy for weird requirements
- Ecosystem less JavaScript-friendly

**Verdict for Your Use Case:** 🟡 **Fast but inflexible**

Hugo would build faster, but you'd lose the JavaScript flexibility that let you build custom margin note logic, email transformations, and Bluesky integration. Your weird requirements benefit from JavaScript's expressiveness.

**Migration Effort:** 8-10 weeks (rewrite templates in Go, rebuild complex logic)

---

### Option 4: Jekyll

**What It Is:** Ruby-based static site generator (the original)

**Pros:**
- Mature and stable
- GitHub Pages native support (free hosting)
- Good plugin ecosystem
- Liquid templating (similar to Nunjucks)

**Cons:**
- Ruby ecosystem (different from your JavaScript experience)
- Slower than modern alternatives
- Less active development than competitors
- Custom logic requires Ruby
- Harder to do complex transformations

**Verdict for Your Use Case:** ❌ **Step backwards**

Jekyll is older and less flexible than Eleventy. You'd lose ground, not gain it.

**Migration Effort:** 6-8 weeks (learn Ruby, rewrite custom logic)

---

### Option 5: Custom Node.js Build Script

**What It Is:** Write your own build system with markdown-it, fs, etc.

**Pros:**
- Complete control
- No framework overhead
- Exactly what you need, nothing more
- Deep understanding of every piece

**Cons:**
- **YOU HAVE TO BUILD EVERYTHING**
- No ecosystem or plugins
- No best practices or conventions
- More work to maintain
- Harder for others to contribute
- Reinventing wheels

**Verdict for Your Use Case:** ❌ **Massive time sink**

You'd spend 6 months building what Eleventy gives you for free (template inheritance, dev server, watch mode, plugin system, etc.) and still need to solve the same hard problems (margin notes, email transformation).

**Migration Effort:** 6+ months

---

### Option 6: WordPress + Custom Theme

**What It Is:** Traditional CMS with database

**Pros:**
- Built-in admin interface
- Rich plugin ecosystem
- What most of the web uses
- Familiar to non-technical users
- Media management built-in

**Cons:**
- **LOSES CONTENT OWNERSHIP** (data in MySQL, not files)
- Security vulnerabilities require maintenance
- Server costs (can't host as static files)
- Slow page loads without caching
- Plugin hell
- Less control over output
- Git workflow becomes awkward

**Verdict for Your Use Case:** ❌ **Philosophically wrong**

You explicitly want to own your content in portable files. WordPress is the opposite of that. It's also overkill for a single-author blog.

**Migration Effort:** 4-6 weeks (but ongoing maintenance burden)

---

### Option 7: Notion + Super.so / Obsidian Publish

**What It Is:** Write in a note-taking app, publish via service

**Pros:**
- Easy writing experience
- No build system
- No code required
- Mobile editing

**Cons:**
- **VENDOR LOCK-IN**
- Can't do margin notes (interface doesn't support it)
- Can't do vertical Chinese typography
- Limited control over layout
- No dual output (web + email)
- Export is janky
- Costs money

**Verdict for Your Use Case:** ❌ **Doesn't meet requirements**

Your requirements are too specific for a generic publishing platform. You need custom HTML/CSS for margin notes and vertical typography.

**Migration Effort:** N/A (wouldn't work)

---

## The Real Question: What's Actually Hard?

Let's be honest about where the complexity lives in your codebase:

### Hard Because of Eleventy
1. ~~Build configuration in JavaScript~~ (medium complexity, manageable)
2. ~~Async filter quirks~~ (minor annoyance)
3. ~~Hot reload slowness~~ (annoying but not blocking)

### Hard Because of Your Requirements
1. **Margin notes system** (hard in ANY framework)
   - HTML nesting constraints
   - Responsive positioning
   - Mobile toggle behavior
   - Accessibility
   - Multi-paragraph support

2. **Dual output transformation** (hard in ANY framework)
   - Converting DOM structure from one format to another
   - Preserving semantics
   - Maintaining numbering

3. **Vertical Chinese typography** (hard in ANY framework)
   - CSS writing-mode complexities
   - Column layout decisions
   - Mixed horizontal/vertical content
   - Font rendering

4. **Email compatibility** (hard in ANY framework)
   - HTML email is a hellscape
   - Limited CSS support
   - Testing across clients

### Hard Because You're Learning
1. CSS Grid (but you've learned it)
2. Nunjucks syntax (but you've learned it)
3. Markdown-it configuration (but you've figured it out)

**Key Insight:** Items 1-4 in "Hard Because of Your Requirements" will be equally hard (or harder) in any other framework. You've already solved them in Eleventy.

---

## Migration Cost Analysis

If you switched to Astro (the most plausible alternative):

### What You'd Keep
- Content files (markdown)
- CSS (mostly)
- General approach

### What You'd Rebuild
- All templates (Nunjucks → Astro components)
- All shortcodes (Eleventy → Astro)
- Margin note system (HTML structure might need changes)
- Email transformation filter
- Build configuration
- Publishing scripts
- Asset pipeline

### Timeline Estimate
- Learning Astro: 1-2 weeks
- Porting templates: 2-3 weeks
- Rebuilding margin notes: 1-2 weeks (might hit same issues you already solved)
- Email transformation: 1 week
- Publishing workflow: 1 week
- Testing and debugging: 2-3 weeks
- **Total: 8-12 weeks**

### What You'd Gain
- Slightly better DX (error messages, build speed)
- More modern tooling
- Better TypeScript support (if you use it)

### What You'd Lose
- 3 months of development time
- Battle-tested solutions to complex problems
- Momentum toward launch

---

## The Sunk Cost Fallacy (Addressed)

You might worry: "Am I just defending Eleventy because I've invested time in it?"

**Legitimate Concern.** Let me address it directly.

**Sunk costs to ignore:**
- Time spent learning Eleventy specifically (those skills don't transfer)
- Time spent on dead-ends and debugging (that's learning, not value)

**Investments that DO transfer:**
- Understanding margin note HTML structure (framework-agnostic)
- CSS for vertical typography (framework-agnostic)
- Content files (framework-agnostic)
- Bluesky integration logic (framework-agnostic)
- Email transformation logic (framework-agnostic)

**The test:** If you started over in Astro today, would you build something significantly better?

**My assessment:** No. You'd build something *slightly* better in some ways (DX), but you'd hit the same hard problems (margin notes, email, typography) and solve them the same ways. The framework isn't the source of complexity—your requirements are.

---

## Recommendation: Stay with Eleventy

### Reasons

1. **You're 80% done.** The hardest problems are solved. Switching now is like rebuilding a house when you've already installed the plumbing.

2. **Your requirements are unusual enough that no framework solves them out-of-the-box.** You'll write custom code regardless of framework choice.

3. **Eleventy's flexibility is an asset for weird requirements.** The JavaScript escape hatches let you do exactly what you need.

4. **Static site generation is the right architecture.** You don't need server-side rendering or client-side hydration. Eleventy does SSG well.

5. **The complexity is essential, not accidental.** Your margin note system is complex because margin notes are complex. Switching frameworks won't change that.

6. **Content portability is preserved.** Your markdown files will outlive any framework. Eleventy doesn't lock you in.

### Conditions

Stay with Eleventy **IF:**
- You're okay with JavaScript configuration
- You're willing to build custom solutions for unusual needs
- You value content ownership over visual editing interface
- You're comfortable with git-based workflow

Consider switching **IF:**
- You discover Eleventy can't do something you need (unlikely given what you've already done)
- You find a framework with built-in margin notes support (doesn't exist)
- You decide visual editing is more important than markdown files (philosophical shift)
- Eleventy becomes unmaintained (not happening, it's actively developed)

---

## Concrete Next Steps with Eleventy

### Immediate (This Week)

1. **Complete the cleanup tasks**
   - Delete unused `processFootnotes` function
   - Remove or enable draft handling
   - Document disabled plugins

2. **Finish vertical typography**
   - Implement title/author column layout
   - Fine-tune spacing
   - Test with multiple poems

3. **Polish email template**
   - Review endnote formatting
   - Test in multiple email clients
   - Ensure proper accessibility

### Short-term (This Month)

4. **Add missing features**
   - Automated OG image generation
   - Dark mode refinements
   - Search improvements

5. **Launch the site**
   - Deploy to hosting
   - Set up domain
   - Test in production

### Medium-term (Next 3-6 Months)

6. **Content creation focus**
   - Write and publish posts
   - Build up archive
   - Engage with readers

7. **CMS evaluation**
   - Try PagesCMS or Decap CMS
   - Keep git workflow as fallback
   - Don't let CMS dictate content structure

8. **Performance optimization**
   - Profile build times if it gets slow
   - Consider pagination for archives
   - Optimize images

### Long-term (6-12 Months)

9. **Reassess if needed**
   - By then you'll have real usage data
   - Framework landscape will have evolved
   - Your needs may have clarified

---

## What Success Looks Like

In 6 months, you should have:
- 20-30 published posts
- Working margin notes on all posts
- Beautiful vertical Chinese typography
- Email newsletter with subscribers
- Bluesky discussion threads
- Fast, accessible, beautiful site
- Content you own in portable files

**Framework choice won't make or break this.** Your writing and curation will.

---

## Final Thoughts

The framework question is a distraction from the real work: publishing great content.

Eleventy is good enough. It's more than good enough—it's actually well-suited to your needs. The complexity you're experiencing is the complexity of your requirements, not the complexity of the tool.

**Ship with Eleventy. Write posts. Build an audience. Revisit in a year if you're still unhappy.**

The best blog platform is the one you actually publish on.

---

## Appendix: What If You Absolutely Must Switch?

If you read all this and still want to switch, here's the plan:

### Best Alternative: Astro

**Why Astro:**
- Modern, well-designed
- Markdown-first
- Good documentation
- Active community
- Can use JavaScript for custom logic

**Migration Plan:**
1. Week 1-2: Learn Astro, set up basic site
2. Week 3-4: Port templates to components
3. Week 5-6: Rebuild margin notes system
4. Week 7-8: Email transformation, publishing scripts
5. Week 9-10: Testing, debugging, polish

**Budget:** 10 weeks of focused work

**Risk:** You'll hit the same margin note complexity and might not solve it better

**Recommendation:** Only do this if you're genuinely excited about learning Astro for its own sake, not as a solution to current frustrations.

---

## Decision Framework

Ask yourself:

1. **Is Eleventy blocking me from shipping?** → No → Stay with Eleventy
2. **Do I enjoy working in Eleventy?** → Yes → Stay with Eleventy
3. **Have I found a framework that solves my specific problems better?** → No → Stay with Eleventy
4. **Am I just frustrated with debugging?** → Yes → Take a break, then stay with Eleventy
5. **Do I want to spend 3 months rebuilding instead of writing?** → No → Stay with Eleventy

If all answers point to "stay," then stay.

Only switch if you have a clear, specific reason that another framework solves a problem Eleventy genuinely can't handle.

I don't see that problem in your codebase.

**Verdict: Keep building in Eleventy. Ship the site. Write the posts. Delight the readers.**
