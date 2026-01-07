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
