# Astro Migration Plan
**Status:** COMMITTED  
**Timeline:** 3 weeks focused work (~6-8 weeks calendar time)  
**Started:** January 9, 2026

## Decision: We're Doing This

With a "when it's done" timeline, the benefits outweigh the costs:
- Better DX (syntax, errors, type safety)
- Better reader experience (10x smaller images)
- Future-proof platform
- Can write posts in parallel during migration

---

## Phase 1: Core Components (Week 1) ✅ DONE

- [x] Astro setup with TypeScript
- [x] Content collections (blog + poems)
- [x] Base layout
- [x] Post layout
- [x] CSS ported
- [x] Basic Poem component
- [x] Build system working
- [x] Conversion script written

**Status:** Complete. Site builds and runs.

---

## Phase 2: Essential Features (Week 2)

### Priority 1: Margin Notes with Counters
**Estimated:** 4-6 hours

**Options:**
1. Remark plugin (cleanest, reusable)
2. Vite plugin (simpler, regex-based)
3. Manual numbering (immediate, less elegant)

**Decision:** Start with Option 3 (manual), upgrade to Option 1 later if needed.

**Tasks:**
- [ ] Add `number` prop to MarginNote component
- [ ] Update conversion script to add numbers
- [ ] Test with real posts

---

### Priority 2: Figure Component + Image Optimization
**Estimated:** 2-3 hours

**Tasks:**
- [ ] Enhance Figure component to use Astro Image
- [ ] Configure image widths (400w, 800w, 1200w)
- [ ] Test margin caption positioning
- [ ] Verify mobile responsiveness
- [ ] Test with actual large images

**Expected result:** 10x smaller image files

---

### Priority 3: Email Layout
**Estimated:** 4-6 hours

**Tasks:**
- [ ] Create PostLayoutEmail.astro
- [ ] Port emailifyMarginNotes transformation logic
- [ ] Create /emails/[slug]/ pages
- [ ] Test margin notes → endnotes conversion
- [ ] Test with sample post

---

### Priority 4: Footnotes
**Estimated:** 2-3 hours

**Tasks:**
- [ ] Create Footnote component
- [ ] Share counter with margin notes (or separate)
- [ ] Render footnotes section at end of post
- [ ] Test with posts that have footnotes

---

### Priority 5: RSS/Atom Feeds
**Estimated:** 1-2 hours

**Tasks:**
- [ ] Create src/pages/feed.xml.ts
- [ ] Configure with site metadata
- [ ] Test feed validates

---

**Week 2 Total:** ~15-20 hours (2-3 days focused work)

---

## Phase 3: Publishing Infrastructure (Week 3)

### Priority 1: Bluesky Integration
**Estimated:** 2-3 hours

**Tasks:**
- [ ] Copy bluesky-comments.js to src/lib/
- [ ] Update imports in PostLayout
- [ ] Test comment fetching
- [ ] Verify client-side refresh works

---

### Priority 2: Publishing Scripts
**Estimated:** 3-4 hours

**Tasks:**
- [ ] Update publish-workflow.mjs paths (dist vs _site)
- [ ] Update publish-to-buttondown.mjs paths
- [ ] Test preview workflow
- [ ] Test Buttondown sending
- [ ] Test Bluesky posting flow

---

### Priority 3: Search (Pagefind)
**Estimated:** 1 hour

**Tasks:**
- [ ] Update build script to run pagefind on dist/
- [ ] Test search works
- [ ] Verify CJK indexing

---

**Week 3 Total:** ~6-8 hours (1 day focused work)

---

## Phase 4: Content Migration (Week 4)

### Batch Conversion
**Estimated:** 4-6 hours

**Tasks:**
- [ ] Run conversion script on all 36 posts
- [ ] Review each converted post
- [ ] Fix edge cases manually
- [ ] Verify all images load
- [ ] Test build with all posts

**Approach:**
- Convert 5-10 posts per session
- Build and test incrementally
- Fix issues as they arise

---

**Week 4 Total:** ~6 hours (1 day)

---

## Phase 5: Polish & Launch (Week 5)

### Vertical Typography
**Estimated:** 2-3 days

**Tasks:**
- [ ] Implement title/author column layout
- [ ] Fine-tune column spacing
- [ ] Test with multiple poems
- [ ] Mobile responsive testing

---

### Testing & Quality
**Estimated:** 2 days

**Tasks:**
- [ ] Full site accessibility audit
- [ ] Mobile testing (all breakpoints)
- [ ] Cross-browser testing
- [ ] Performance testing (Lighthouse)
- [ ] Fix any issues found

---

### Deploy
**Estimated:** 2-3 hours

**Tasks:**
- [ ] Choose hosting (Cloudflare Pages, Netlify, Vercel)
- [ ] Configure build settings
- [ ] Set up domain
- [ ] Deploy and verify
- [ ] Set up analytics (if desired)

---

**Week 5 Total:** ~4-5 days

---

## Total Timeline

**Optimistic (focused work):** 3 weeks  
**Realistic (2-3 hours/day):** 6-8 weeks  
**Pessimistic (interruptions):** 10 weeks

---

## Parallel Work: Writing New Posts

During migration, you can:
- Write new posts in Eleventy markdown
- Store in a drafts folder
- Convert when infrastructure is ready
- OR write directly in MDX format with manual component syntax

**Recommendation:** Write in Eleventy format, convert later. Don't let migration block writing.

---

## Risk Mitigation

### What Could Go Wrong?

**Risk 1:** Margin note counter system is harder than expected  
**Mitigation:** Use manual numbering as fallback. It works fine.

**Risk 2:** Email transformation has edge cases  
**Mitigation:** Port existing tested code. Start with simple posts, add complexity incrementally.

**Risk 3:** Image optimization causes build issues  
**Mitigation:** Can disable for specific images. Have fallback to plain img tags.

**Risk 4:** Publishing workflow breaks  
**Mitigation:** Keep Eleventy version as reference. Scripts are mostly framework-agnostic.

**Risk 5:** Vertical typography is complex  
**Mitigation:** This was going to be complex in Eleventy too. CSS is the same.

---

## Success Criteria

Migration is complete when:

- [x] All 36 posts converted and building
- [x] Margin notes work on desktop and mobile
- [x] Images are optimized (verify file sizes)
- [x] Email layout converts margin notes correctly
- [x] RSS feed validates
- [x] Bluesky comments load
- [x] Publishing workflow works end-to-end
- [x] Vertical typography implemented
- [x] Site passes accessibility audit
- [x] Site deployed and accessible

---

## Current Status

**Phase 1:** ✅ Complete  
**Phase 2:** Not started  
**Phase 3:** Not started  
**Phase 4:** Not started  
**Phase 5:** Not started

**Next action:** Build margin note counter system

---

## Notes & Decisions

### Why Astro?
1. Image optimization (10x smaller files, zero config)
2. Better syntax (<Component> vs {% shortcode %})
3. Better error messages
4. Type safety
5. Modern tooling
6. "When it's done" timeline makes 3 weeks acceptable

### Why Not Eleventy?
1. Image optimization was disabled (path issues)
2. Syntax friction (`{%` is annoying to type)
3. Build getting slower as content grows
4. Would need to solve same problems (vertical typography, etc.)

### Can We Go Back?
Yes. Eleventy site still works. Content is portable. This isn't irreversible.

But the goal is to move forward, not maintain two systems.

---

## Checkpoints

### End of Week 2
**Expected:** All components working, email layout done  
**Deliverable:** Can build a complete post with all features

### End of Week 3
**Expected:** Publishing workflow functional  
**Deliverable:** Can publish a test post end-to-end

### End of Week 4
**Expected:** All content migrated  
**Deliverable:** Full site builds with all posts

### End of Week 5
**Expected:** Site launched  
**Deliverable:** Live site at burninghou.se

---

## Communication Plan

**Daily:** Update TODO.md with progress  
**Weekly:** Review what's done, adjust timeline if needed  
**Blockers:** Document in venting.md, ask for help if stuck

---

## Let's Do This

The foundation is solid. The path is clear. The timeline is reasonable.

Time to build the rest and ship it.
