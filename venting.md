# Venting

## 2026-01-05 Evening Session (Previous)

Okay. That was a ride. But it's working. The combination of fixes did the trick.

-   CSS grid for the main layout.
-   Corrected positioning context for the margin notes (`.mn-ref` static).
-   Restored the original, correct JS logic for vertical positioning.
-   Added the `window.load` listener to make sure the JS runs after layout shifts.

Each piece was necessary. Removing the JS was the wrong move, but it led to understanding *why* it was there. It's not about just one piece of code, but how they all interact. The house of cards is stable again. That's a good feeling.

---

## 2026-01-05 Night Session

The previous session left things in a partially broken state - the session notes claimed a "critical bug" where margin notes were rendering as endnotes, but looking at the actual code, that had already been fixed. The `emailifyMarginNotes` filter was correctly only processing footnotes.

The *actual* remaining issue was subtler: footnotes were being renumbered starting from 1 by the filter, breaking the shared counter with margin notes. The fix was embarrassingly simple - the codebase already had a `collectFootnotes` filter that preserves original numbering. The web template (`post.njk`) was just using the wrong filter.

**What the previous agent got right:**
- Per-page counter Map (good fix, works perfectly)
- Identifying that the unified regex approach was wrong
- Good documentation of the problem in session notes

**What was left unclear:**
- The "critical bug" was already fixed in the code I inherited
- Two filters exist: `emailifyMarginNotes` (for email, renumbers) and `collectFootnotes` (for web, preserves numbers)
- The template was simply using the wrong one

**Lesson learned:** When you have two filters that do similar things, make sure you understand which one is for what context. `emailifyMarginNotes` is for email/RSS where you want all notes as endnotes. `collectFootnotes` is for web where margin notes stay in margin and only footnotes go to endnotes.

One-line fix: `| emailifyMarginNotes` → `| collectFootnotes` in post.njk.

Now margin note 1, margin note 2, footnote 3. As it should be.

---

## 2026-01-05 Afternoon Session

Picked up from the previous session. Reviewed the codebase - everything is actually working correctly now:

- Build passes cleanly (82 files)
- Margin notes render in the margin with proper numbering
- Footnotes render at the bottom with shared sequential numbering (mn-1, mn-2, fn-3)
- CSS grid layout works on desktop
- Mobile toggle works
- JS positioning aligns notes with their anchors

---

## 2026-01-07 Multi-Paragraph Margin Notes: A Journey Through HTML Hell

### The Problem

User reported that multi-paragraph margin notes weren't rendering correctly in the qiao-ji-explains-himself post. First margin note (with blockquotes) wasn't displaying at all, second was inheriting italic formatting.

Diagnosis revealed a catastrophic regression: Commit eb80d27 ("Simplify codebase: consolidate docs, fix margin notes, clean templates") had changed margin notes from `<aside>` elements to `<span>` elements. The commit comment literally said "Block elements inside inline elements is invalid HTML and breaks layout" AND THEN PROCEEDED TO CREATE THAT EXACT SITUATION.

The old manual HTML format used:
```html
<aside class="mn-note">
  <p>Multiple paragraphs</p>
  <blockquote>Quotes</blockquote>
  <p>More content</p>
</aside>
```

The broken shortcode format used:
```html
<span class="mn-note">
  <p>Multiple paragraphs</p>  <!-- INVALID: block inside inline -->
  <blockquote>Quotes</blockquote>
  <p>More content</p>
</span>
```

When browsers encounter block elements inside inline elements, they "fix" the HTML by closing the inline element early, which scattered margin note content across the page.

### The Solution Journey

**First attempt**: Change `<span class="mn-note">` to `<aside class="mn-note">`.
- **Result**: FAILED. Margin notes can be called from within `<p>` tags in blockquotes, and `<aside>` (block element) can't be inside `<p>` (which only allows inline content).

**Second attempt**: Keep `<span>` but add `display: block` in CSS.
- **Theory**: CSS can make spans display as blocks, allowing block children.
- **Result**: FAILED. HTML parsers validate nesting BEFORE CSS is applied. Invalid HTML gets "fixed" before CSS can help.

**Third attempt**: Convert ALL block elements to styled inline elements.
- Strategy: Replace `<p>` → `<span class="mn-p">`, `<blockquote>` → `<span class="mn-blockquote">`
- Add CSS to make these spans display as blocks with appropriate styling
- **Result**: ALMOST WORKED, but stray `<br>` tags appeared between elements

**Final fix**: Remove newlines from shortcode output.
- **Root cause**: Markdown-it's `breaks: true` setting converts newlines to `<br>` tags
- Our replacements left newlines between the spans: `</span>\n<span>`
- Markdown-it converted those newlines to `<br>` tags: `</span><br>\n<span>`
- **Solution**: Add `.replace(/\n+/g, '')` to remove ALL newlines
- **Result**: SUCCESS! 🎉

### What We Built

```javascript
// eleventy.config.js
let noteHtml = renderedContent
  .trim()
  .replace(/<p>/g, '<span class="mn-p">')
  .replace(/<\/p>/g, "</span>")
  .replace(/<blockquote>/g, '<span class="mn-blockquote">')
  .replace(/<\/blockquote>/g, "</span>")
  .replace(/\n+/g, ""); // Critical: prevents markdown-it from adding <br> tags
```

```css
/* css/index.css */
.mn-note {
  display: block; /* Allow block-like behavior */
}
.mn-p {
  display: block;
  margin: 0.35em 0;
}
.mn-blockquote {
  display: block;
  margin: 0.5em 0;
  padding-left: 0.75em;
  border-left: 2px solid var(--ink-2);
}
```

Updated emailifyMarginNotes filter to convert spans back to proper block elements for email output.

### The Celebration

IT WORKS! Margin notes now support:
- Multiple paragraphs
- Blockquotes
- Lists
- Nested formatting
- ALL THE THINGS THAT SHOULD HAVE WORKED FROM THE START

The entire purpose of this project was to have working margin notes. After this session, we finally have them. Really have them. Multi-paragraph, blockquote-containing, properly-rendering margin notes.

### The Curse

BUT OF COURSE THERE'S MORE.

Mobile layout is completely broken. Responsive Design Mode below iPad Mini width shows:
- Main text clipped on screen
- Margin notes expand on tap but display nothing (blank)
- Everything is wrong

Nothing with margin notes is ever easy. The uncaring void of the DOM laughs at our suffering. HTML was a mistake. CSS was a mistake. Web development was a mistake. The very concept of "margin notes on the web" offends the natural order.

And yet here we are, about to dive back in, because apparently we haven't learned our lesson.

**Status**: Desktop perfect. Mobile broken. Planning phase for mobile fixes begins now.

**Moral**: Every time you think margin notes are fixed, check mobile. They're not fixed.

---

## 2026-01-07 Evening: Mobile Layout Victory (Finally!)

### The Mobile Catastrophe

After fixing multi-paragraph margin notes on desktop, we discovered mobile was completely broken:
1. Main text clipped/shifted left off-screen
2. Horizontal scrolling on narrow viewports
3. Margin notes expanded but showed blank content

### Root Causes Identified

Used Explore agent to do deep investigation. Found **three critical issues**:

**1. CSS Cascade Conflict**
- Added `display: block` to base `.mn-note` selector for desktop multi-paragraph support
- This overrode mobile `display: none` because specificity was equal and source order mattered
- Mobile notes never actually hid, causing layout chaos

**2. Absolute Positioning Persisting on Mobile**
- Desktop CSS: `.mn-note { position: absolute; left: calc(100% + var(--margin-gap)); }`
- This was never reset on mobile, pushing notes outside viewport when toggled visible
- Notes were rendering but positioned off-screen to the right

**3. Character-Based Measure Too Wide**
- Desktop used `max-width: 67ch` for optimal reading
- On narrow screens (< 1024px), 67 characters exceeded viewport width
- Combined with grid layout, caused horizontal overflow and text clipping

### The Fixes

**Round 1: CSS Cascade & Positioning**
```css
@media (max-width: 1023px) {
  .mn-note {
    display: none !important;  /* Force hide */
    position: static;           /* Reset absolute positioning */
  }
  .mn-note.is-visible {
    display: block !important;
    position: static;
    left: auto;
    top: auto;
  }
}
@media (min-width: 1024px) {
  .mn-note {
    display: block;  /* Only set on desktop */
    position: absolute;
    /* ... */
  }
}
```

**Round 2: Remove Character Measure on Mobile**
```css
@media (max-width: 1023px) {
  .post {
    max-width: none;  /* Remove 67ch limit */
    width: 100%;
  }
}
```

**Round 3: Aggressive Overflow Prevention**
```css
@media (max-width: 1023px) {
  body { overflow-x: hidden; }
  .layout-container { overflow-x: hidden; }
  .post { overflow-x: hidden; }
  .post-body { overflow-x: hidden; }
  .post-body * { max-width: 100%; }
}
```

**Round 4: Visual Cleanup**
- Removed left border from mobile margin notes (overlapped with note number)
- Changed to `border-radius: 4px` on all sides (cleaner look)
- Removed left border from blockquotes in margin notes (indentation sufficient)
- Increased padding to `2.5em` for note number clearance

### The Victory

**IT ALL WORKS NOW!**

✅ Desktop: Multi-paragraph margin notes with blockquotes in right margin
✅ Mobile: No horizontal scrolling, text fits viewport perfectly
✅ Mobile: Margin notes toggle inline with full readable content
✅ Mobile: Clean visual hierarchy without distracting borders

### Known Issues for Future

1. **Poems with preformatted text may scroll on mobile**
   - Will fix with font-size adjustments in final polish
   - Not critical - affects specific content type, not core functionality

2. **Mobile font sizes could be optimized**
   - Current sizes work but could be refined
   - Save for final details phase

### Lessons Learned

1. **Media query order and specificity matter for cascade**
   - Don't set base `display` if you need different values per breakpoint
   - Use `!important` judiciously when cascade conflicts arise

2. **Always reset desktop positioning on mobile**
   - Absolute positioning that makes sense on desktop breaks mobile
   - Must explicitly set `position: static`, `left: auto`, etc.

3. **Character-based measures don't work on narrow viewports**
   - 67ch is great for desktop readability
   - On mobile, use `max-width: none` and let content reflow naturally

4. **Overflow requires multiple layers of defense**
   - One `overflow-x: hidden` isn't enough
   - Apply to body, containers, and constrain all children

5. **Visual hierarchy doesn't always need borders**
   - Background color + indentation + typography = sufficient
   - Borders can create visual clutter, especially on small screens

### Commits

- `0dc52e6` Fix multi-paragraph margin notes (desktop)
- `ea2d209` Document the saga
- `7820b35` Fix mobile layout for margin notes
- `6ee800f` Remove character measure on mobile
- `1861d2a` Fix horizontal scrolling and styling cleanup

### Celebration

🎉 **MARGIN NOTES WORK ON DESKTOP AND MOBILE!** 🎉

Multi-paragraph. With blockquotes. With lists. Properly positioned. No scrolling. No clipping. No blank content.

After two years of this project existing, margin notes finally work the way they were always supposed to.

### What's Next (Notes for Tomorrow's Agent)

**High Priority:**
1. ~~Mobile layout fixes~~ ✅ DONE!
2. Test on actual mobile devices (not just responsive mode)
3. Review all posts with margin notes to ensure compatibility

**Medium Priority:**
1. Font size optimization for mobile (especially for poems with preformatted text)
2. Dark mode testing for margin notes
3. Email variant testing (ensure emailifyMarginNotes handles new span structure)

**Polish Phase:**
1. Margin note animation/transition on mobile toggle
2. Accessibility audit (ARIA labels, keyboard navigation)
3. Performance audit (CSS specificity, unnecessary rules)
4. Browser compatibility testing

**Future Features:**
1. Consider adding "expand all notes" button on mobile
2. Explore sidenote positioning improvements (better alignment with anchor text)
3. Consider citation/bibliography system that integrates with margin notes

**Documentation:**
- ✅ SHORTCODES.md updated with multi-paragraph support
- ✅ venting.md thoroughly documented
- TODO: Update WORKFLOW.md if any process changes needed
- TODO: Create MOBILE.md with mobile-specific considerations

**The Sacred Rule:**
Always test desktop AND mobile. Always. Every single time. No exceptions. Margin notes are never "fixed" until they work on both.

The previous session's "critical bug" notes were stale - the fix was already in place. Just cleaned up the documentation to reflect reality.

Now moving on to implementing the poem shortcode. Finally, new features instead of bug fixes!

---

## 2026-01-06 Morning Session (Current)

**Victory lap time!** Fixed a cluster of margin note and footnote display issues that had been lurking:

1. **First margin note not displaying**: The culprit was a blank line within the note content creating multiple `<p>` tags inside an inline `<span>` - invalid HTML that broke browser rendering. Fixed by removing the blank line and also removing markdown italics from the anchor parameter (Nunjucks can't handle markdown in parameters).

2. **Inherited italic formatting**: Margin notes inside italicized paragraphs were inheriting the italic styling. Added explicit `font-style: normal` to `.mn-note`, `.mn-anchor`, and `.mn-anchor-num` to prevent inheritance.

3. **Endnotes font mismatch**: Footnotes were using default body font. Updated `.footnotes-list` to use `var(--font-mn)` and adjusted size from 0.9rem to 0.85rem to match margin notes.

4. **Number positioning**: Implemented hanging indent style - numbers now project left into the gutter with text starting at a clean left edge. Applied to both margin notes and footnotes for consistency.

5. **Nested lists in footnotes**: Custom CSS counters were numbering nested list items. Fixed with child selector (`>`) so only direct children get custom numbering. Nested lists display with standard bullets/numbers.

6. **Back-reference positioning**: The ↩ link was appearing on its own line. Created `insertBackref` filter to inject it before the last closing HTML tag in footnote content, so it appears inline at the end.

**Key takeaway:** The shortcode architecture is solid. The issues were all about CSS specificity, HTML structure validity, and careful handling of nested content. Now everything works beautifully - margin notes in the margin with clean hanging indents, footnotes at the bottom with matching styling, and all content properly formatted regardless of nesting complexity.

Time to commit and move forward!
