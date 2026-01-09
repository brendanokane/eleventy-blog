/**
 * Remark plugin to add sequential numbering to margin notes and footnotes.
 *
 * This plugin processes MDX at build time and injects a `number` prop into
 * both <MarginNote> and <Footnote> components, ensuring they share a unified
 * counter sequence (1, 2, 3...) per page.
 *
 * Usage in astro.config.mjs:
 *   import remarkNoteNumbers from './src/plugins/remark-note-numbers.mjs';
 *   export default defineConfig({
 *     markdown: {
 *       remarkPlugins: [remarkNoteNumbers],
 *     }
 *   });
 */

import { visit } from 'unist-util-visit';

export default function remarkNoteNumbers() {
  return (tree, file) => {
    // Counter resets for each page/file
    let noteCounter = 0;

    // Visit all MDX JSX elements (components used in MDX)
    visit(tree, 'mdxJsxFlowElement', (node) => {
      // Check if this is a MarginNote or Footnote component
      if (node.name === 'MarginNote' || node.name === 'Footnote') {
        noteCounter++;

        // Check if 'number' attribute already exists
        const hasNumber = node.attributes?.some(
          attr => attr.type === 'mdxJsxAttribute' && attr.name === 'number'
        );

        // Only add number if not already present (allows manual override)
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

    // Also visit inline elements (for notes within paragraphs)
    visit(tree, 'mdxJsxTextElement', (node) => {
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
  };
}
