# Unified Counter Implementation for Margin Notes and Footnotes

## Problem

The blog requires margin notes and footnotes to share a unified counter sequence per page. For example, if a page has:
- Margin note (should be numbered 1)
- Footnote (should be numbered 2)
- Margin note (should be numbered 3)

The numbers must be sequential across both component types, not separate counters.

## Solution: Remark Plugin

I implemented a **remark plugin** that processes MDX at build time to inject sequential numbers into both `<MarginNote>` and `<Footnote>` components.

### Why Remark Plugin?

1. **Build-time processing**: Runs during MDX compilation, guaranteeing correct order
2. **Framework-agnostic**: Works with Astro's content pipeline
3. **Zero runtime cost**: Numbers are injected during build, not calculated in browser
4. **Simple implementation**: ~60 lines of code

### How It Works

**File**: `src/plugins/remark-note-numbers.mjs`

The plugin:
1. Visits all MDX JSX elements in the AST (Abstract Syntax Tree)
2. Maintains a counter that resets per file/page
3. When it encounters `<MarginNote>` or `<Footnote>`, it increments the counter
4. Injects a `number` prop with the current count
5. Allows manual override if `number` prop already exists

```javascript
visit(tree, 'mdxJsxFlowElement', (node) => {
  if (node.name === 'MarginNote' || node.name === 'Footnote') {
    noteCounter++;
    
    const hasNumber = node.attributes?.some(
      attr => attr.type === 'mdxJsxAttribute' && attr.name === 'number'
    );
    
    if (!hasNumber) {
      node.attributes = node.attributes || [];
      node.attributes.push({
        type: 'mdxJsxAttribute',
        name: 'number',
        value: noteCounter,
      });
    }
  }
});
```

### Component Updates

**MarginNote.astro**:
- Accepts `number` prop (injected by plugin)
- Falls back to `*` if no number provided
- Uses number in aria-labels and display

**Footnote.astro**:
- Same pattern as MarginNote
- Uses superscript links with backref
- Shares the same counter sequence

### Configuration

**astro.config.mjs**:
```javascript
import remarkNoteNumbers from "./src/plugins/remark-note-numbers.mjs";

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkNoteNumbers],
  },
});
```

### Test Results

Created `src/content/blog/counter-test/index.mdx` with mixed margin notes and footnotes.

**Build output HTML** (verified in `dist/blog/counter-test/index.html`):
```html
<!-- Margin note 1 -->
<button ... aria-label="Show margin note 1">1</button>

<!-- Footnote 2 -->
<a ... aria-label="Footnote 2">2</a>

<!-- Margin note 3 with anchor -->
<button ... aria-label="Show margin note 3">3</button>

<!-- Footnote 4 -->
<a ... aria-label="Footnote 4">4</a>

<!-- Margin note 5 -->
<button ... aria-label="Show margin note 5">5</button>
```

✅ **Unified sequence confirmed**: 1, 2, 3, 4, 5 across both component types.

## Benefits Over Eleventy Approach

**Eleventy** used a Map to track counters per page:
```javascript
const pageCounters = new Map();
function getPageCounter(page) {
  const key = page?.inputPath || "unknown";
  if (!pageCounters.has(key)) {
    pageCounters.set(key, { mn: 0, fig: 0 });
  }
  return pageCounters.get(key);
}
```

**Astro remark plugin** advantages:
1. **Type-safe**: Number is injected during build, not runtime
2. **Simpler**: No global state management needed
3. **Verifiable**: Can inspect injected numbers in AST
4. **Composable**: Works with other remark plugins
5. **Debuggable**: Numbers visible in MDX source after transformation

## Next Steps

Now that unified numbering works, we can:
1. ✅ Create email layout that transforms margin notes → endnotes
2. ✅ Build RSS/Atom feeds (depends on email transformation)
3. Convert existing posts from Eleventy shortcodes to MDX components

## Files Changed

- `src/plugins/remark-note-numbers.mjs` (new)
- `src/components/MarginNote.astro` (updated to accept `number` prop)
- `src/components/Footnote.astro` (new component)
- `astro.config.mjs` (added remarkPlugins)
- `src/content/blog/counter-test/index.mdx` (test post)
