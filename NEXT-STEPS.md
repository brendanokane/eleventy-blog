# Next Steps for Vertical Chinese Poetry Typography

## Current Status (2026-01-08 Late Evening)

### What Works
- ✅ Vertical RTL Chinese text on desktop (>= 1024px)
- ✅ `writing-mode: vertical-rl` with `text-orientation: upright`
- ✅ English text in horizontal layout with proper line breaks via `<br>` tags
- ✅ 90ch width for English text (fits longest Tao Yuanming lines)
- ✅ Mobile degradation to horizontal stacked layout (Chinese horizontal, then English horizontal)
- ✅ Graceful handling of missing YAML fields (all fields optional)
- ✅ Chinese text extends slightly into left margin, creating nice visual balance with right-margin notes
- ✅ No italics on English poem text

### Test File
`test-typography/site-template-test.html` - loads at `file:///Users/bokane/Code/eleventy-blog/test-typography/site-template-test.html`

Contains three test cases:
1. Spring Dawning (Meng Haoran) - short 5-character quatrain, bilingual
2. Reading The Book of Mountains and Seas (Tao Yuanming) - English only, long lines with indentation
3. Same poem - bilingual version

### CSS Location
`/css/index.css` lines 766-858
- Base poem styles (mobile-first)
- Desktop media query at line 834 adds vertical layout

### Poem Shortcode
`eleventy.config.js` lines 396-482
- Processes YAML files from `content/poems/*.yaml`
- Converts line breaks to `<br>` tags for display
- Only renders fields that exist (all optional)

## What Still Needs Work

### 1. Chinese Title/Author Positioning
**Current**: Title and author appear centered above the poem (header block)
**Desired**: Title and author in their own vertical column to the right of the poem text (traditional style)

This matches what we did in `test-typography/vertical-manual-columns.html`:
- Rightmost column: title + author (in same column, separated by spacing)
- Middle columns: poem text

**Challenge**: The poem shortcode currently generates a separate `.poem-header` div. We'll need to restructure the HTML output to put Chinese title/author as a column within `.poem-body` instead.

**Approach**:
1. Modify shortcode to detect if Chinese text exists
2. If yes, create column structure:
   - Column 1 (rightmost): `titleZh` + `poetZh`
   - Column 2+: Split `textZh` into appropriate columns
3. Keep English title/author in header or create separate structure

**Reference**: See `test-typography/vertical-manual-columns.html` for working example of this layout.

### 2. Column Structure for Chinese Text
**Current**: Single vertical column for all Chinese text
**Better**: Multiple columns for readability

For pentametric quatrains (4 lines × 5 characters = 20 chars):
- Column 1 (rightmost): Title + author
- Column 2: Lines 1-2 (10 characters)
- Column 3 (leftmost): Lines 3-4 (10 characters)

For longer poems like Tao Yuanming (64 characters):
- Column 1: Title + author
- Columns 2-5: Split text into ~16 chars each, or adjust based on natural line breaks

**Challenge**: Need to decide if we:
- Auto-split at character counts (requires JS or complex CSS)
- Manually mark column breaks in YAML (simpler, more control)
- Use CSS `column-count` (automatic but less control over breaks)

**User preference**: TBD - need to experiment with different approaches

### 3. Column Spacing and Gutter
**Current**: 2em gap between Chinese and English, 1.5em padding on each side
**User feedback**: "Can decrease the gutter between lines still more"

Need to fine-tune:
- Gap between Chinese vertical columns
- Spacing between title/author in rightmost column
- Distance from Chinese text to vertical divider
- Distance from divider to English text

Reference the tighter spacing (0.5rem) we used in `vertical-manual-columns.html`.

### 4. Special Cases

#### River Snow Spacing
The River Snow poem has intentional spacing in the English translation:
```
a thousand hills     and not one bird in flight
a million trails and     not so much as a footprint
```

This uses multiple spaces that need to be preserved. Currently handled by `white-space: pre-wrap` in manual test file, but removed from production CSS.

**Decision needed**: 
- Add `white-space: pre-wrap` back to `.poem-text-en` (risks indentation issues)
- Use `&nbsp;` entities in YAML for special spacing
- Accept that special spacing won't render

#### Tao Yuanming's Indented Lines
His translations have indented alternating lines:
```
The first month of summer: everything is growing,
   and the trees around my cottage have all filled in.
```

Currently preserved via leading spaces in YAML + `<br>` tags. Seems to work fine.

### 5. Integration with Actual Shortcode
**Current**: CSS is updated, test HTML file works
**Remaining**: The actual poem shortcode output needs to match the structure we're using in the test file

The shortcode currently generates:
```html
<div class="poem-container">
  <div class="poem-header">
    <!-- titles and poets -->
  </div>
  <div class="poem-body">
    <div class="poem-text-zh">...</div>
    <div class="poem-text-en">...</div>
  </div>
</div>
```

This works for the current CSS, but if we want Chinese title/author as a column, we'll need to restructure the shortcode output.

## Known Issues

### Eleventy Build Errors
Multiple blog post files have syntax errors with margin note shortcodes:
- `tao-yuanming-reads-on-a-summer-evening/index.md` - curly quotes in `{% mn %}` anchor parameter
- `the-emperor-s-so-called-cats-and-the-manjurist-bat-signal/index.md` - `{% endmn %}` tag issue

These were temporarily moved aside but should be fixed eventually. See venting.md for details.

### Edit Tool Reliability
The Edit tool repeatedly failed during this session when trying to modify the test HTML file. Root cause unknown - possibly encoding issues, possibly file locking, possibly just cursed.

**Workaround**: Use Write tool to recreate files instead of Edit tool for complex changes.

## Decisions to Make Tomorrow

1. **Column structure**: Auto-split vs manual breaks vs CSS columns?
2. **Title/author placement**: Separate column (traditional) vs header block (current)?
3. **Special spacing**: Preserve via `pre-wrap` or other method?
4. **Column height**: Fixed height vs auto-height based on content?
5. **Mobile behavior**: Current horizontal stack is fine or needs adjustment?

## Testing Checklist

Before considering this feature "done":
- [ ] Test with all 31 extracted poems
- [ ] Test with English-only poems
- [ ] Test with Chinese-only poems
- [ ] Test with poems with no titles
- [ ] Test on actual mobile device (not just responsive mode)
- [ ] Test with River Snow's special spacing
- [ ] Verify Tao Yuanming's long lines don't wrap
- [ ] Check that Chinese text balance with margin notes looks good
- [ ] Verify accessibility (screen readers, keyboard navigation)

## Files to Review

- `css/index.css` (lines 766-858) - poem styles
- `eleventy.config.js` (lines 396-482) - poem shortcode
- `content/poems/*.yaml` (31 files) - poem data
- `test-typography/site-template-test.html` - current test file
- `test-typography/vertical-manual-columns.html` - original working prototype with manual columns
- `venting.md` - for emotional context (private to agents)

## The Big Picture

We're trying to honor the traditional vertical reading direction of classical Chinese poetry while making it accessible in a modern web context. The desktop layout should feel like reading a traditional Chinese text - columns flowing right to left, elegant spacing, balanced composition. The mobile layout should gracefully degrade to a simple, readable horizontal presentation.

This is about respecting the source material while acknowledging the constraints of the medium. Some compromises are inevitable (not everyone views on desktop, vertical text has browser support limitations), but the goal is to get as close as possible to the authentic reading experience for those who can appreciate it.

## For Tomorrow's Agent

Take your time. Read through this document. Look at the test files. Understand what works and what doesn't before making changes.

The CSS is solid. The structure is sound. What remains is refinement - column layout, spacing, title positioning. These are design decisions that require experimentation and user feedback.

Don't try to do everything at once. Pick one issue (probably the Chinese title/author column positioning), implement it, test it, get feedback. Then move to the next.

And if the Edit tool fails you, don't fight it. Use Write. Life is too short to debug tools that should just work.

Good luck. May the typography gods smile upon you.
