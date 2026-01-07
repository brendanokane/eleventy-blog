# Accessibility Refactor Plan
**Date**: 2026-01-07  
**Status**: ✅ COMPLETE - All Three Phases Implemented and Tested

## Context

After successfully fixing mobile margin note layout issues, we conducted an accessibility audit to identify WCAG 2.1 compliance gaps before beginning broader site testing.

### Current Shortcode Usage

**Posts using new `{% mn %}` and `{% fn %}` shortcodes (7):**
- a-failure-as-a-mouser-a-failure-as-a-cat
- fishing-for-snow-and-the-heart-of-the-lake
- in-defense-of-the-relatively-low-quality
- li-bai-to-du-fu-wish-you-were-here
- qiao-ji-explains-himself
- susu-does-the-dozens
- whats-good

**Posts still using old `<aside>` HTML (9):**
- tao-yuanming-home-again
- tao-yuanming-reads-on-a-summer-evening
- the-emperor-s-so-called-cats-and-the-manjurist-bat-signal
- the-five-virtues-of-the-cat
- the-naming-of-cats-and-an-offering
- too-much-party
- two-poems-for-a-rainy-sunday
- unidentified-flying-object-seen-over-yangzhou
- yo-man-mo-yan

**IMPORTANT**: This refactor targets ONLY the shortcode-generated HTML. The 9 posts with old HTML will need separate migration (not part of this refactor).

---

## Current Shortcode Implementation Analysis

### What We Have Now

**Margin Note Shortcode** (`eleventy.config.js:293-329`):
```javascript
eleventyConfig.addPairedShortcode("mn", function (content, anchor) {
  const counters = getPageCounter(this.page);
  counters.mn++;
  const noteId = `mn-${counters.mn}`;
  
  const renderedContent = md.render(content.trim());
  let noteHtml = renderedContent
    .trim()
    .replace(/<p>/g, '<span class="mn-p">')
    .replace(/<\/p>/g, "</span>")
    .replace(/<blockquote>/g, '<span class="mn-blockquote">')
    .replace(/<\/blockquote>/g, "</span>")
    .replace(/\n+/g, "");
  
  if (anchor) {
    return `<span class="mn-ref" data-mn-id="${noteId}"><span class="mn-anchor" role="button" tabindex="0" aria-expanded="false" aria-controls="${noteId}">${anchor}</span><sup class="mn-anchor-num">${counters.mn}</sup><span class="mn-note" id="${noteId}" role="note"><span class="mn-note-number" aria-hidden="true">${counters.mn}.</span>${noteHtml}</span></span>`;
  } else {
    return `<span class="mn-ref" data-mn-id="${noteId}"><sup class="mn-marker" role="button" tabindex="0" aria-expanded="false" aria-controls="${noteId}">${counters.mn}</sup><span class="mn-note" id="${noteId}" role="note"><span class="mn-note-number" aria-hidden="true">${counters.mn}.</span>${noteHtml}</span></span>`;
  }
});
```

**Current HTML Output (marker version):**
```html
<span class="mn-ref" data-mn-id="mn-1">
  <sup class="mn-marker" role="button" tabindex="0" aria-expanded="false" aria-controls="mn-1">1</sup>
  <span class="mn-note" id="mn-1" role="note">
    <span class="mn-note-number" aria-hidden="true">1.</span>
    <span class="mn-p">Note content here.</span>
  </span>
</span>
```

**Current HTML Output (anchor version):**
```html
<span class="mn-ref" data-mn-id="mn-2">
  <span class="mn-anchor" role="button" tabindex="0" aria-expanded="false" aria-controls="mn-2">anchor text</span>
  <sup class="mn-anchor-num">2</sup>
  <span class="mn-note" id="mn-2" role="note">
    <span class="mn-note-number" aria-hidden="true">2.</span>
    <span class="mn-p">Note content.</span>
  </span>
</span>
```

### What Works Well

1. ✅ **Per-page counter system** - Clean Map-based approach prevents number collision
2. ✅ **Multi-paragraph support** - The span-based approach successfully handles complex content
3. ✅ **Markdown processing** - Content renders correctly through MarkdownIt
4. ✅ **Mobile/desktop CSS** - Layout system works on both breakpoints
5. ✅ **Semantic intentions** - Use of `role="note"`, ARIA attributes shows good understanding

### What Needs Refactoring

#### 1. **Invalid HTML Structure** (CRITICAL)
- **Problem**: Using `role="button"` on `<span>` and `<sup>` elements
- **Why invalid**: These aren't real buttons, creating confusing semantics
- **Impact**: Screen readers announce incorrectly, keyboard navigation broken

#### 2. **No Keyboard Support** (CRITICAL)
- **Problem**: JavaScript only handles `click` events (base.njk:127-142)
- **Why broken**: Users can't activate with Enter/Space keys
- **Impact**: Keyboard-only users cannot access margin notes on mobile

#### 3. **Missing Focus Management** (CRITICAL)
- **Problem**: When notes toggle on mobile, focus stays on button
- **Why problematic**: Screen reader users don't know content appeared
- **Impact**: Disorienting, unclear relationship between trigger and content

#### 4. **Inconsistent ARIA Usage** (HIGH)
- **Problem**: `aria-expanded` and `aria-controls` present on desktop where they're non-functional
- **Why confusing**: Desktop notes are always visible, disclosure pattern doesn't apply
- **Impact**: Screen readers announce incorrect state information

#### 5. **Non-Descriptive Labels** (HIGH)
- **Problem**: Buttons only announce as "Button 1", "Button 2"
- **Why inadequate**: No context about what the button does
- **Impact**: Screen reader users can't understand purpose

#### 6. **Missing `.visually-hidden` Class** (CRITICAL)
- **Problem**: Skip link exists in base.njk:77 but class isn't defined in CSS
- **Why broken**: Skip link neither visible nor accessible
- **Impact**: Fails WCAG 2.4.1 Bypass Blocks

#### 7. **Global Smooth Scroll Without Preference Check** (HIGH)
- **Problem**: `scroll-behavior: smooth` applied unconditionally (index.css:50)
- **Why problematic**: Ignores user's motion preferences
- **Impact**: Can cause disorientation for users with vestibular disorders

---

## Refactor Strategy

### Core Principle

**Use real semantic HTML where possible, with minimal ARIA to fill gaps.**

The current implementation tries to make `<span>` and `<sup>` elements behave like buttons through ARIA. Instead, we should:
1. Use actual `<button>` elements for interactive triggers
2. Style buttons to look inline (not block-level)
3. Add ARIA only where HTML semantics don't suffice
4. Make ARIA attributes responsive to viewport (add/remove based on mobile/desktop)

### Why This Works

**HTML parsing happens before CSS:** We can't nest `<aside>` in `<p>`, but we CAN nest `<button>` in `<p>`. Buttons are "phrasing content" (inline-level), so they're valid anywhere text is valid.

**CSS can make anything look like anything:** We can style `<button>` to display inline with `all: unset` then reapply only the styles we want.

**Progressive enhancement:** On desktop, buttons can be styled to look exactly like the current design. On mobile, the same buttons gain interactive behavior through JavaScript.

---

## Refactor Implementation Plan

### Phase 1: Update Shortcode HTML Structure

**File**: `eleventy.config.js`

#### 1.1 Margin Note Shortcode - Marker Version

**Current output:**
```html
<sup class="mn-marker" role="button" tabindex="0" aria-expanded="false" aria-controls="mn-1">1</sup>
```

**New output:**
```html
<button type="button" class="mn-marker" aria-expanded="false" aria-controls="mn-1" aria-label="Show margin note 1">1</button>
```

**Changes:**
- Replace `<sup role="button" tabindex="0">` with `<button type="button">`
- Add `aria-label` with descriptive text
- Remove `tabindex` (buttons are focusable by default)
- Keep `aria-expanded` and `aria-controls` (will be removed on desktop via JS)

#### 1.2 Margin Note Shortcode - Anchor Version

**Current output:**
```html
<span class="mn-anchor" role="button" tabindex="0" aria-expanded="false" aria-controls="mn-2">anchor text</span>
<sup class="mn-anchor-num">2</sup>
```

**New output:**
```html
<button type="button" class="mn-anchor" aria-expanded="false" aria-controls="mn-2" aria-label="Show margin note 2: anchor text">
  anchor text<sup class="mn-anchor-num" aria-hidden="true">2</sup>
</button>
```

**Changes:**
- Replace `<span role="button" tabindex="0">` with `<button type="button">`
- Move `<sup class="mn-anchor-num">` INSIDE button for semantic grouping
- Add `aria-hidden="true"` to the number (already in aria-label)
- Add descriptive `aria-label` including anchor text
- Strip HTML tags from anchor text before using in aria-label

#### 1.3 Note Container Enhancement

**Current output:**
```html
<span class="mn-note" id="mn-1" role="note">
  <span class="mn-note-number" aria-hidden="true">1.</span>
  <span class="mn-p">Content...</span>
</span>
```

**New output:**
```html
<span class="mn-note" id="mn-1" role="note" aria-label="Margin note 1">
  <span class="mn-note-number" aria-hidden="true">1.</span>
  <span class="mn-p">Content...</span>
</span>
```

**Changes:**
- Add `aria-label` to note container for better screen reader announcement

#### 1.4 Footnote Backref Enhancement

**Current** (post.njk:46):
```html
<a href="#{{ note.refId }}" class="footnote-backref" aria-label="Back to content">↩</a>
```

**New**:
```html
<a href="#{{ note.refId }}" class="footnote-backref" aria-label="Return to note {{ note.num }} reference in text">↩</a>
```

**Changes:**
- Make each backref label unique with note number

### Phase 2: Update CSS for Button Styling

**File**: `css/index.css`

#### 2.1 Reset Button Styles to Inline

**Location**: After `.mn-ref` definition (around line 120)

```css
/* ===== BUTTON RESET FOR INLINE DISPLAY ===== */

.mn-anchor,
.mn-marker {
  /* Reset ALL button defaults */
  all: unset;
  
  /* Restore focusability */
  cursor: pointer;
  
  /* Reapply custom styles */
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--vermillion);
  text-decoration: none;
  font-style: normal;
  
  /* Ensure inline display */
  display: inline;
}

/* Marker-specific styling */
.mn-marker {
  font-size: 0.75em;
  vertical-align: super;
  line-height: 1;
}

/* Anchor-specific styling */
.mn-anchor {
  text-decoration: underline;
  text-decoration-color: var(--vermillion);
  text-decoration-style: dotted;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.15em;
}

/* Anchor number inside button */
.mn-anchor .mn-anchor-num {
  font-size: 0.75em;
  vertical-align: super;
  line-height: 1;
  margin-left: 0.1em;
}

/* Hover states */
.mn-anchor:hover,
.mn-marker:hover {
  color: var(--ink);
}

/* Focus states - high contrast */
.mn-anchor:focus,
.mn-marker:focus {
  outline: 2px solid var(--vermillion);
  outline-offset: 2px;
  border-radius: 2px;
  background-color: var(--vermillion);
  color: var(--paper);
  padding: 0 0.2em;
}
```

**Why `all: unset`?** This removes ALL default button styling (border, background, padding, etc.) and lets us start fresh with inline-appropriate styles.

#### 2.2 Add Visually Hidden Utility Class

**Location**: After base element styles (around line 80)

```css
/* ===== ACCESSIBILITY UTILITIES ===== */

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.visually-hidden:focus {
  position: static;
  width: auto;
  height: auto;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
  padding: 0.5em 1em;
  background: var(--vermillion);
  color: var(--paper);
  text-decoration: none;
  z-index: 9999;
}
```

#### 2.3 Fix Smooth Scroll Motion Preference

**Location**: Replace existing `html` rule (around line 50)

**Current:**
```css
html {
  font-size: 100%;
  scroll-behavior: smooth;
}
```

**New:**
```css
html {
  font-size: 100%;
}

@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```

#### 2.4 Fix Mobile Margin Note Contrast

**Location**: Mobile breakpoint section (around line 415)

**Current:**
```css
@media (max-width: 1023px) {
  .mn-note.is-visible {
    display: block !important;
    /* ... */
    color: var(--ink-2); /* May fail contrast on --paper-2 background */
  }
}
```

**New:**
```css
@media (max-width: 1023px) {
  .mn-note.is-visible {
    display: block !important;
    /* ... */
  }
  
  .mn-note.is-visible .mn-p,
  .mn-note.is-visible .mn-blockquote {
    color: var(--ink); /* Use highest contrast color */
  }
}
```

### Phase 3: Update JavaScript for Accessibility

**File**: `_includes/layouts/base.njk` (lines 124-197)

#### 3.1 Add Keyboard Event Handling

**Current**: Only handles `click` events

**New**: Handle both `click` and `keydown` events

```javascript
// Handle both click and keyboard activation
function handleTriggerActivation(e) {
  // For keyboard events, only respond to Enter or Space
  if (e.type === 'keydown' && !(e.key === 'Enter' || e.key === ' ')) {
    return;
  }
  
  if (e.type === 'keydown') {
    e.preventDefault(); // Prevent space from scrolling page
  }
  
  var trigger = e.target.closest('.mn-anchor, .mn-marker');
  if (!trigger) return;
  
  // Only toggle on mobile
  if (window.innerWidth >= MOBILE_BREAKPOINT) return;
  
  var ref = trigger.closest('.mn-ref');
  if (!ref) return;
  
  var note = ref.querySelector('.mn-note');
  if (!note) return;
  
  e.preventDefault();
  
  // Toggle visibility
  var isExpanded = !note.classList.contains('is-visible');
  note.classList.toggle('is-visible');
  trigger.setAttribute('aria-expanded', isExpanded);
  
  // Focus management (see 3.2)
  if (isExpanded) {
    manageFocusForExpandedNote(note, trigger);
  }
}
```

#### 3.2 Add Focus Management

**New function**: Move focus to note content when expanded

```javascript
function manageFocusForExpandedNote(note, trigger) {
  // Make note temporarily focusable
  note.setAttribute('tabindex', '-1');
  note.focus();
  
  // Remove tabindex on blur so it doesn't stay in tab order
  note.addEventListener('blur', function removeTempTabindex() {
    note.removeAttribute('tabindex');
    note.removeEventListener('blur', removeTempTabindex);
  }, { once: true });
  
  // Announce expansion to screen readers
  var announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'visually-hidden';
  announcement.textContent = 'Note ' + trigger.textContent.trim() + ' expanded';
  document.body.appendChild(announcement);
  
  // Remove announcement after it's been read
  setTimeout(function() {
    if (announcement.parentNode) {
      announcement.remove();
    }
  }, 1000);
}
```

#### 3.3 Update ARIA Attributes Based on Viewport

**New function**: Add/remove ARIA attributes when switching between mobile/desktop

```javascript
function updateAriaAttributes() {
  var isMobile = window.innerWidth < MOBILE_BREAKPOINT;
  
  document.querySelectorAll('.mn-ref').forEach(function(ref) {
    var trigger = ref.querySelector('.mn-anchor, .mn-marker');
    var note = ref.querySelector('.mn-note');
    
    if (!trigger || !note) return;
    
    if (isMobile) {
      // Mobile: enable disclosure widget pattern
      var isVisible = note.classList.contains('is-visible');
      trigger.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
      trigger.setAttribute('aria-controls', note.id);
    } else {
      // Desktop: notes always visible, remove disclosure pattern
      trigger.removeAttribute('aria-expanded');
      trigger.removeAttribute('aria-controls');
      // Note: Keep aria-label for context
    }
  });
}
```

#### 3.4 Clean Up Mobile State on Resize to Desktop

**Enhanced function**:

```javascript
function clearMobileState() {
  document.querySelectorAll('.mn-note.is-visible').forEach(function(note) {
    note.classList.remove('is-visible');
    note.removeAttribute('tabindex'); // Clean up focus management
  });
  
  document.querySelectorAll('[aria-expanded="true"]').forEach(function(el) {
    el.setAttribute('aria-expanded', 'false');
  });
}
```

#### 3.5 Update Layout Handler

**Enhanced function** to coordinate all updates:

```javascript
function handleLayout() {
  var isMobile = window.innerWidth < MOBILE_BREAKPOINT;
  
  // Clean up state when transitioning from mobile to desktop
  if (wasMobile && !isMobile) {
    clearMobileState();
  }
  
  // Update ARIA attributes based on viewport
  updateAriaAttributes();
  
  // Position notes on desktop
  if (!isMobile) {
    positionNotes();
  }
  
  wasMobile = isMobile;
}
```

#### 3.6 Register Event Listeners

**Update initialization**:

```javascript
function init() {
  handleLayout();
  
  // Event listeners
  document.addEventListener('click', handleTriggerActivation);
  document.addEventListener('keydown', handleTriggerActivation);
  
  // Debounced resize handler
  var resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleLayout, 100);
  });
  
  // Re-run after fonts load
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(handleLayout);
  }
  
  // Re-run on window load as fallback
  window.addEventListener('load', handleLayout);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

---

## Implementation Sequence

### Step 1: Implement CSS Changes (Safest First)
1. Add `.visually-hidden` class
2. Fix smooth scroll with motion preference
3. Add button reset styles
4. Fix mobile margin note contrast

**Why first?** CSS changes are non-breaking and can be tested immediately.

### Step 2: Update Shortcode HTML Output
1. Modify `mn` shortcode to output `<button>` elements
2. Add `aria-label` attributes with descriptive text
3. Update note containers with `aria-label`
4. Update footnote backref labels in template

**Why second?** HTML changes affect 7 posts. Test builds to ensure no breakage.

### Step 3: Update JavaScript Behavior
1. Add keyboard event handling
2. Add focus management
3. Add ARIA attribute management based on viewport
4. Update layout handler to coordinate all functions

**Why last?** JavaScript enhancement builds on correct HTML/CSS foundation.

### Step 4: Test Thoroughly
1. Manual keyboard navigation testing
2. Screen reader testing (VoiceOver minimum)
3. Visual regression testing (compare before/after screenshots)
4. Test all 7 shortcode-using posts
5. Test mobile/desktop transitions

---

## Testing Checklist

### Manual Testing

#### Keyboard Navigation
- [ ] Tab to margin note trigger
- [ ] Activate with Enter key (on mobile viewport)
- [ ] Activate with Space key (on mobile viewport)
- [ ] Focus moves to note content when expanded
- [ ] Focus visible at all times
- [ ] Can tab away from expanded note
- [ ] Skip link appears on Tab and works

#### Screen Reader (VoiceOver/NVDA/JAWS)
- [ ] Buttons announce with descriptive label ("Show margin note 1")
- [ ] Expanded state announced when triggered
- [ ] Note content reads correctly
- [ ] Footnote backrefs announce uniquely
- [ ] No confusion between mobile/desktop states

#### Visual Regression
- [ ] Buttons look identical to current design
- [ ] Focus indicators clearly visible
- [ ] Mobile margin notes display correctly
- [ ] Desktop margin notes position correctly
- [ ] No layout shifts or jumps

#### Responsive Behavior
- [ ] Resize from desktop to mobile: ARIA attributes update
- [ ] Resize from mobile to desktop: expanded notes close, ARIA removed
- [ ] No JavaScript errors in console
- [ ] Smooth transitions between breakpoints

### Automated Testing
- [ ] Run `npm run build` - no errors
- [ ] HTML validation (if available)
- [ ] Lighthouse accessibility score
- [ ] axe DevTools browser extension
- [ ] WAVE WebAIM evaluation

---

## Rollback Plan

If issues arise during implementation, rollback is straightforward:

1. **CSS changes**: Comment out new rules, uncomment old ones
2. **Shortcode changes**: Use git to revert `eleventy.config.js` to previous commit
3. **JavaScript changes**: Use git to revert base.njk to previous commit
4. **Rebuild**: `npm run build` regenerates all HTML

Each phase can be rolled back independently since they're modular.

---

## Success Criteria

This refactor is successful when:

1. ✅ All 7 shortcode-using posts build without errors
2. ✅ Keyboard users can fully navigate and interact with margin notes on mobile
3. ✅ Screen readers announce descriptive, contextual information
4. ✅ Focus indicators meet WCAG 2.1 contrast requirements
5. ✅ ARIA attributes correctly reflect state on mobile and desktop
6. ✅ Visual design unchanged from current implementation
7. ✅ No JavaScript console errors
8. ✅ Skip link functional and styled
9. ✅ Smooth scroll respects motion preferences
10. ✅ All critical and high-priority accessibility issues resolved

---

## Post-Refactor: Next Steps

After this refactor is complete and tested:

1. **Migrate remaining 9 posts** from old `<aside>` HTML to new shortcodes
2. **Consider figure shortcode enhancements** (alt text validation, aria-describedby)
3. **Consider poem shortcode enhancements** (configurable heading levels, explicit lang attributes)
4. **Real device testing** when ready to deploy publicly
5. **Final accessibility audit** to verify all WCAG 2.1 Level AA compliance

---

## Notes for Future Agents

**If this session is interrupted**, the next agent should:

1. Read this document completely
2. Check git status to see which phase was in progress
3. Review `venting.md` for any additional context from this session
4. Continue from the last completed step in the Implementation Sequence
5. Run `npm run build` after each change to verify no breakage
6. Update this document with any discoveries or changes to the plan

**Key files to modify:**
- `eleventy.config.js` (shortcodes)
- `css/index.css` (button styles, utilities)
- `_includes/layouts/base.njk` (JavaScript in `<script>` tag around line 124)
- `_includes/layouts/post.njk` (footnote backref template around line 46)

**DO NOT modify posts with old HTML** - that's a separate migration task.

---

*Last updated: 2026-01-07*
