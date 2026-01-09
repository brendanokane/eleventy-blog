# MDX Conversion Example: What Actually Changes

Here's a real post showing the conversion from Eleventy to Astro MDX.

## Original Eleventy Version

```markdown
---
title: "Fishing for Snow, and the Heart of the Lake"
date: 2025-12-15
draft: false
bluesky_thread: "https://bsky.app/profile/burninghou.se/post/3ma2dmjbzss2n"
---

# Fishing for Snow, and the Heart of the Lake

{% figure "/fishing-for-snow.../assets/image.jpg", "alt text", "center" %}
Caption with *markdown*
{% endfigure %}

Regular paragraph with a margin note{% mn %}
This is the note content.
{% endmn %} and more text.

Here's a poem:
{% poem "liu_zongyuan_river_snow" %}

More content here.
```

## Converted Astro MDX Version

```mdx
---
title: "Fishing for Snow, and the Heart of the Lake"
date: 2025-12-15T00:00:00.000Z
draft: false
bluesky_thread: "https://bsky.app/profile/burninghou.se/post/3ma2dmjbzss2n"
---

import Figure from '../../components/Figure.astro';
import MarginNote from '../../components/MarginNote.astro';
import Poem from '../../components/Poem.astro';

# Fishing for Snow, and the Heart of the Lake

<Figure 
  src="/fishing-for-snow.../assets/image.jpg" 
  alt="alt text" 
  style="center"
>
Caption with *markdown*
</Figure>

Regular paragraph with a margin note<MarginNote>
This is the note content.
</MarginNote> and more text.

Here's a poem:
<Poem id="liu_zongyuan_river_snow" />

More content here.
```

## What Changed?

### 1. Frontmatter (MINIMAL)
```diff
  ---
  title: "Fishing for Snow, and the Heart of the Lake"
- date: 2025-12-15
+ date: 2025-12-15T00:00:00.000Z
  draft: false
  bluesky_thread: "https://bsky.app/profile/burninghou.se/post/3ma2dmjbzss2n"
  ---
```

**Change:** Date needs to be full ISO timestamp  
**Effort:** Find & replace, or automated script

---

### 2. Import Statements (NEW)
```diff
  ---
  title: "Fishing for Snow, and the Heart of the Lake"
  date: 2025-12-15T00:00:00.000Z
  ---
  
+ import Figure from '../../components/Figure.astro';
+ import MarginNote from '../../components/MarginNote.astro';
+ import Poem from '../../components/Poem.astro';
```

**Change:** Add imports for each component type used in post  
**Effort:** Annoying but scriptable - scan for `{%`, add corresponding imports

---

### 3. Shortcodes → Components (STRAIGHTFORWARD)
```diff
- {% figure "path", "alt", "center" %}Caption{% endfigure %}
+ <Figure src="path" alt="alt" style="center">Caption</Figure>

- {% mn %}Note content{% endmn %}
+ <MarginNote>Note content</MarginNote>

- {% mn "anchor" %}Note{% endmn %}
+ <MarginNote anchor="anchor">Note</MarginNote>

- {% poem "id" %}
+ <Poem id="id" />
```

**Change:** Syntax swap, named props instead of positional args  
**Effort:** Find & replace with regex (90% automated)

---

### 4. Markdown Content (UNCHANGED)
```markdown
Regular paragraph text stays exactly the same.

**Bold** and *italic* work identically.

Links work: [text](url)

Images work: ![alt](path)

> Blockquotes work

- Lists work
- No changes needed

Headers work:
## Like this
### And this
```

**Change:** NONE  
**Effort:** 0

---

## Conversion Script Pseudocode

This could be 90% automated:

```javascript
function convertToMDX(eleventy11tyFile) {
  let content = readFile(eleventy11tyFile);
  
  // 1. Fix date in frontmatter
  content = content.replace(
    /date: (\d{4}-\d{2}-\d{2})/,
    'date: $1T00:00:00.000Z'
  );
  
  // 2. Detect which components are used
  const usesMarginNote = content.includes('{% mn');
  const usesFigure = content.includes('{% figure');
  const usesPoem = content.includes('{% poem');
  
  // 3. Add import statements
  let imports = [];
  if (usesFigure) imports.push("import Figure from '../../components/Figure.astro';");
  if (usesMarginNote) imports.push("import MarginNote from '../../components/MarginNote.astro';");
  if (usesPoem) imports.push("import Poem from '../../components/Poem.astro';");
  
  content = content.replace(
    /---\n([\s\S]*?)\n---/,
    `---\n$1\n---\n\n${imports.join('\n')}`
  );
  
  // 4. Convert shortcodes
  
  // Margin notes without anchor
  content = content.replace(
    /{% mn %}([\s\S]*?){% endmn %}/g,
    '<MarginNote>$1</MarginNote>'
  );
  
  // Margin notes with anchor
  content = content.replace(
    /{% mn "(.*?)" %}([\s\S]*?){% endmn %}/g,
    '<MarginNote anchor="$1">$2</MarginNote>'
  );
  
  // Figures
  content = content.replace(
    /{% figure "(.*?)", "(.*?)", "(.*?)" %}([\s\S]*?){% endfigure %}/g,
    '<Figure src="$1" alt="$2" style="$3">$4</Figure>'
  );
  
  // Poems
  content = content.replace(
    /{% poem "(.*?)" %}/g,
    '<Poem id="$1" />'
  );
  
  return content;
}
```

**Effort:** Write script once, run on all 36 posts  
**Time:** 2-3 hours to write script, 10 minutes to run it, 2-3 hours to manually review and fix edge cases

---

## Edge Cases That Need Manual Review

### 1. Nested Components
```markdown
{% mn %}
Note with a {% figure %} inside it
{% endfigure %}
{% endmn %}
```

**Solution:** MDX handles this fine, but verify it looks right

---

### 2. Shortcodes in Headers
```markdown
## My Header {% mn %}note{% endmn %}
```

**Solution:** Still works in MDX, but test it

---

### 3. Multi-paragraph Margin Notes
```markdown
{% mn %}
First paragraph.

Second paragraph with **bold**.

> A blockquote
{% endmn %}
```

**Solution:** Should work identically in MDX

---

### 4. Special Characters
```markdown
{% mn "anchor with "quotes" in it" %}
```

**Solution:** Escape them: `anchor="anchor with \"quotes\" in it"`

---

## Realistic Time Estimate Per Post

For a typical post with 3-5 components:

1. Run conversion script: **30 seconds**
2. Check imports are correct: **30 seconds**
3. Verify frontmatter: **30 seconds**
4. Skim through for edge cases: **2 minutes**
5. Test in browser: **1 minute**
6. Fix any issues: **2-5 minutes** (varies)

**Total per post:** 7-10 minutes average

**For 36 posts:** 4-6 hours of focused work

---

## What's Actually Hard About Conversion?

### Not Hard:
- ✓ Frontmatter (mostly automated)
- ✓ Import statements (automated detection)
- ✓ Simple shortcodes (regex replacement)
- ✓ Markdown content (unchanged)

### Slightly Tricky:
- ⚠️ Edge cases (nested components, special chars)
- ⚠️ Testing each post manually
- ⚠️ Fixing build errors

### Actually Hard:
- ❌ Nothing! The conversion is straightforward.

The hard part isn't the conversion—it's building the NEW features:
- Margin note counter logic
- Email transformation
- Publishing workflow
- RSS feeds

---

## Bottom Line

**Conversion is 90% automated, 10% manual review.**

For 36 posts:
- Script writing: **2-3 hours**
- Script running: **10 minutes**
- Manual review: **4-6 hours**
- **Total: ~1 day of work**

This is NOT the blocker. The blocker is rebuilding the infrastructure (email, publishing, etc.).

---

## The Real Question

Not "How hard is conversion?" (Easy)

But "How hard is rebuilding everything else?" (4-5 weeks)

- Week 1: Foundation ✓ (done in prototype)
- Week 2: Components & features
- Week 3: Publishing infrastructure
- Week 4: Content migration ← This is the easy part
- Week 5: Testing & polish

**Content conversion is maybe 10% of the total migration effort.**
