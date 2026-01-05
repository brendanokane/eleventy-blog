# Eleventy Shortcodes Reference

This document lists all custom shortcodes defined for this Eleventy blog.

**⚠️ IMPORTANT NOTE FOR FUTURE AGENTS:**
This file must be kept up to date whenever shortcodes are added, modified, or removed in `eleventy.config.js`. Always update this documentation when making changes to shortcode definitions.

---

## Quick Reference

| Shortcode | Syntax | Purpose |
|-----------|--------|---------|
| `mn` | `{% mn %}note{% endmn %}` | Margin note (appears in right margin) |
| `mn` | `{% mn "anchor" %}note{% endmn %}` | Margin note with anchor text |
| `fn` | `{% fn %}note{% endfn %}` | Footnote (appears at bottom) |
| `fn` | `{% fn "anchor" %}note{% endfn %}` | Footnote with anchor text |
| `figure` | `{% figure "src", "alt" %}caption{% endfigure %}` | Image with margin caption |
| `figure` | `{% figure "src", "alt", "center" %}caption{% endfigure %}` | Image with centered caption |
| `poem` | `{% poem "poem_id" %}` | Bilingual poem display |
| `currentBuildDate` | `{% currentBuildDate %}` | ISO timestamp of build |

---

## Escaping & Special Characters

**Nunjucks processes before Markdown.** This means `{% %}` and `{{ }}` are always interpreted as template syntax, even inside backticks or code blocks.

### What needs escaping

| Content | Problem | Solution |
|---------|---------|----------|
| `{% anything %}` | Executed as shortcode | Wrap in `{% raw %}...{% endraw %}` |
| `{{ variable }}` | Executed as variable | Wrap in `{% raw %}...{% endraw %}` |
| `{# comment #}` | Treated as Nunjucks comment | Wrap in `{% raw %}...{% endraw %}` |

### What doesn't need escaping

- Regular prose, Chinese characters, punctuation
- HTML tags (we have `html: true` in Markdown config)
- Markdown formatting (`*italic*`, `**bold**`, `[links](url)`)
- Code in fenced blocks (` ``` `) — **but** Nunjucks syntax inside still executes!

### Examples

**Writing about shortcodes in prose:**
```markdown
Use `{% raw %}{% mn %}{% endraw %}` for margin notes.
```

**Code blocks with Nunjucks syntax:**
````markdown
```liquid
{% raw %}
{% mn "example" %}This is a margin note.{% endmn %}
{% endraw %}
```
````

**Safe content (no escaping needed):**
```markdown
The poet 李白 wrote: "花間一壺酒，獨酌無相親。"

This has *emphasis* and **strong** text with a [link](/about/).
```

---

## Margin Note (`mn`)

A paired shortcode for creating Tufte-style margin notes that appear in the right margin on desktop and toggle on mobile.

### Syntax

```liquid
{% mn %}Note content here{% endmn %}
{% mn "anchor text" %}Note content here{% endmn %}
```

### Parameters

- `anchor` (optional): Text to display with a dotted underline in the main content. If omitted, a numbered superscript marker appears instead.
- `content`: The note content (supports Markdown)

### Examples

**Without anchor text (numbered marker):**
```liquid
This is some text{% mn %}This appears in the margin.{% endmn %} with a margin note.
```

**With anchor text:**
```liquid
This is {% mn "important text" %}A note explaining why this is important.{% endmn %} in the article.
```

**With Markdown in note:**
```liquid
{% mn "API endpoint" %}
See the [documentation](https://example.com) for details.

- Point 1
- Point 2
{% endmn %}
```

### Output

The shortcode generates a `<span class="mn-ref">` wrapper containing:
- The anchor text (with dotted underline) or a superscript marker
- A superscript number
- The note content in a `<span class="mn-note">`

On desktop, CSS positions the note in the right margin. On mobile, notes are hidden by default and toggle on tap.

---

## Footnote (`fn`)

A paired shortcode for creating footnotes that appear at the bottom of the article. Footnotes share the same numbering sequence as margin notes, so all notes are numbered consecutively regardless of type.

### Syntax

```liquid
{% fn %}Long note content{% endfn %}
{% fn "anchor text" %}Long note content{% endfn %}
```

### Parameters

- `anchor` (optional): Text to display with a link in the main content. If omitted, only a numbered superscript marker appears.
- `content`: The note content (supports Markdown, including block-level elements like paragraphs and lists)

### Examples

**Without anchor text (numbered marker):**
```liquid
This is some text{% fn %}This is a lengthy note that would be too large for the margin.{% endfn %} with a footnote.
```

**With anchor text:**
```liquid
This {% fn "research methodology" %}The study employed a mixed-methods approach.{% endfn %} was carefully designed.
```

**Mixed with margin notes:**
```liquid
First observation{% mn %}Quick margin note.{% endmn %} and second observation{% fn %}Longer footnote with detailed explanation.{% endfn %} continuing the text.
```

### Output

The shortcode generates:
- A superscript link in the text pointing to the footnote
- The footnote content is stored in `page._footnotes` and rendered by the template at the bottom of the article

### Numbering

Footnotes share the counter with margin notes, so if you have:
- Margin note 1
- Margin note 2
- Footnote (becomes #3)
- Margin note (becomes #4)

The numbering stays sequential throughout the document.

---

## Figure (`figure`)

A paired shortcode for images with Tufte-style margin captions or centered captions.

### Syntax

```liquid
{% figure "image.jpg", "alt text" %}Caption text{% endfigure %}
{% figure "image.jpg", "alt text", "center" %}Caption text{% endfigure %}
```

### Parameters

- `src` (required): Image source path
- `alt` (required): Alt text for accessibility
- `style` (optional): Set to `"center"` for centered caption below image. Omit for margin caption (Tufte-style).
- `content`: Caption text (supports Markdown)

### Examples

**Margin caption (default):**
```liquid
{% figure "/assets/photo.jpg", "A beautiful sunset" %}
A sunset over the mountains, photographed in *autumn 2024*.
{% endfigure %}
```

**Centered caption:**
```liquid
{% figure "/assets/diagram.png", "System architecture diagram", "center" %}
**Figure 1**: The complete system architecture showing all components.
{% endfigure %}
```

### Output

Creates a `<figure>` element with appropriate classes for styling. Margin captions appear in the right margin on desktop, while centered captions appear below the image.

---

## Poem (`poem`)

A shortcode for displaying bilingual poems with structured formatting. Supports both inline (frontmatter) and external (file-based) poem definitions.

### Syntax

```liquid
{% poem "poem_id" %}
```

### Parameters

- `poem_id` (required): The unique identifier for the poem

### Poem Data Sources

The shortcode looks for poem data in two places (in order):

1. **Frontmatter:** A `poems` array in the current page's frontmatter
2. **External file:** `content/poems/{poem_id}.yaml` or `content/poems/{poem_id}.yml`

### Data Structure

```yaml
# In frontmatter or external YAML file
poems:
  - id: drinking_alone
    poet:
      en: "Li Bai"
      zh: "李白"
    title:
      en: "Drinking Alone by Moonlight"
      zh: "月下獨酌"
    text:
      en: |
        From a pot of wine among the flowers
        I drink alone...
      zh: |
        花間一壺酒，
        獨酌無相親...
```

For external files, the structure is the same but without the `poems:` wrapper and `- id:` prefix:

```yaml
# content/poems/drinking_alone.yaml
id: drinking_alone
poet:
  en: "Li Bai"
  zh: "李白"
title:
  en: "Drinking Alone by Moonlight"
  zh: "月下獨酌"
text:
  en: |
    From a pot of wine among the flowers
    I drink alone...
  zh: |
    花間一壺酒，
    獨酌無相親...
```

### Examples

**Using frontmatter-defined poem:**
```markdown
---
poems:
  - id: spring_view
    poet:
      en: "Du Fu"
      zh: "杜甫"
    title:
      en: "Spring View"
      zh: "春望"
    text:
      en: |
        The nation is shattered, mountains and rivers remain;
        The city in spring, grass and trees grow deep.
      zh: |
        國破山河在，
        城春草木深。
---

{% poem "spring_view" %}
```

**Using external file:**
```liquid
{% poem "drinking_alone" %}
```
(Looks for `content/poems/drinking_alone.yaml`)

### Output

```html
<div class="poem-container" data-poem-id="drinking_alone">
  <div class="poem-header">
    <h3 class="poem-title-zh" lang="zh">月下獨酌</h3>
    <p class="poem-poet-zh" lang="zh">李白</p>
    <h4 class="poem-title-en">Drinking Alone by Moonlight</h4>
    <p class="poem-poet-en">Li Bai</p>
  </div>
  <div class="poem-body">
    <div class="poem-text-zh" lang="zh">花間一壺酒，<br>獨酌無相親...</div>
    <div class="poem-text-en">From a pot of wine among the flowers<br>I drink alone...</div>
  </div>
</div>
```

### Error Handling

If the poem is not found in either frontmatter or external files, an error message is displayed:

```html
<div class="poem-error">
  ⚠️ Poem not found: poem_id
  Check frontmatter or content/poems/poem_id.yaml
</div>
```

### Styling

- On mobile: Chinese and English text stack vertically
- On desktop (≥1024px): Side-by-side layout with Chinese on left, English on right
- Chinese titles use serif fonts; English titles are italic
- Poem text preserves line breaks

---

## Current Build Date (`currentBuildDate`)

A simple shortcode that outputs the current build timestamp in ISO format.

### Syntax

```liquid
{% currentBuildDate %}
```

### Parameters

None

### Example

```liquid
<p>Last built: {% currentBuildDate %}</p>
```

### Output

```html
<p>Last built: 2026-01-05T12:34:56.789Z</p>
```

---

## Implementation Details

### Per-Page Counters

All note shortcodes (mn, fn) and figure shortcodes share a per-page counter system:

```javascript
const pageCounters = new Map();

function getPageCounter(page) {
    const key = page?.inputPath || 'unknown';
    if (!pageCounters.has(key)) {
        pageCounters.set(key, { mn: 0, fig: 0 });
    }
    return pageCounters.get(key);
}
```

This ensures each page starts numbering at 1, regardless of build order.

### Markdown Processing

All shortcode content is processed through MarkdownIt with:
- `html: true` - Allows HTML in content
- `breaks: true` - Converts line breaks to `<br>` tags

---

*Last updated: 2026-01-05*
