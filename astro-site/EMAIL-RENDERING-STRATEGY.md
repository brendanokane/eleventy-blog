# Email Rendering Strategy

## Challenge

We need margin notes and footnotes to render differently depending on output format:
- **Web**: Margin notes in right column, footnotes at bottom
- **Email/RSS**: Both become simple numbered references with endnotes at bottom

The unified counter system works (1, 2, 3...), but we need different HTML output per context.

## Attempted Approach 1: HTML Transformation (Eleventy-style)

Eleventy used `emailifyMarginNotes` filter to transform HTML:
```javascript
<span class="mn-ref">...</span> → <sup><a href="#fn-1">1</a></sup>
```

**Problem**: Astro components render to HTML at build time. We can't easily post-process component output.

## Better Approach: Render-time Context

Instead of transforming HTML, we should **render components differently based on layout context**.

### Option A: Component Props
Pass `renderMode="email"` prop to components:

```astro
<!-- Web layout -->
<MarginNote>Content</MarginNote>  <!-- renders as sidenote -->

<!-- Email layout -->
<MarginNote renderMode="email">Content</MarginNote>  <!-- renders as endnote ref -->
```

**Problem**: Requires manually editing every post for email vs web.

### Option B: Astro Context/Slots
Use Astro's `Astro.slots` or context API to detect layout:

```astro
<!-- In EmailLayout -->
<slot name="content" renderMode="email" />
```

**Problem**: Astro doesn't support passing context to nested components this way.

### Option C: Separate Email-Specific MDX Files
Create `.email.mdx` variants:

```
- fishing-for-snow/index.mdx (web version with MarginNote)
- fishing-for-snow/email.mdx (email version with EmailNote)
```

**Problem**: DRY violation, maintenance burden for 36+ posts.

### Option D: Remark Plugin with Output Format Detection ✅

Create a remark plugin that:
1. Detects output format from frontmatter or filename
2. Transforms MDX AST to use appropriate components
3. For email: extracts note content, injects into layout

```javascript
// remark-email-notes.mjs
export default function remarkEmailNotes(options = {}) {
  return (tree, file) => {
    const isEmail = file.data.astro?.frontmatter?.outputFormat === 'email';
    
    if (isEmail) {
      const endnotes = [];
      
      visit(tree, 'mdxJsxFlowElement', (node) => {
        if (node.name === 'MarginNote' || node.name === 'Footnote') {
          // Extract note content
          const content = extractContent(node);
          const number = getNumberProp(node);
          
          endnotes.push({ number, content });
          
          // Replace with simple reference
          Object.assign(node, createReferenceNode(number));
        }
      });
      
      // Inject endnotes into tree
      file.data.endnotes = endnotes;
    }
  };
}
```

**Benefit**: Single source of truth (one MDX file), format-aware rendering.

## Recommended Implementation

**Phase 1**: Manual endnotes (MVP for testing)
- EmailLayout with manually specified endnotes in slot
- Proves CSS/design works for Buttondown

**Phase 2**: Automated transformation (production)
- Remark plugin for email-specific rendering
- Frontmatter flag: `outputFormat: email`
- Build process generates both web + email versions

**Phase 3**: Buttondown integration
- Script to push email HTML to Buttondown API
- Handles CSS inline embedding
- Scheduling/automation

## Current Status

✅ EmailLayout.astro created with email-safe CSS
✅ Design system variables match site
✅ Endnotes section structure ready
⏳ Need: Plugin or process to populate endnotes automatically

## Next Step

Build manual email MDX version of a real post to validate the design, then decide on automation approach based on complexity.
