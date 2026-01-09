#!/usr/bin/env node
/**
 * MDX to Buttondown Markdown Converter
 *
 * Converts blog posts with MarginNote/Footnote components to plain markdown
 * with standard footnote syntax that Buttondown can process.
 *
 * Transformation:
 *   <MarginNote>text</MarginNote> → [^1] ... [^1]: text
 *   <Footnote>text</Footnote> → [^2] ... [^2]: text
 *   <MarginNote anchor="word">text</MarginNote> → word[^3] ... [^3]: text
 *
 * Usage:
 *   ./mdx-to-buttondown.mjs path/to/post.mdx
 *   ./mdx-to-buttondown.mjs path/to/post.mdx --output email.md
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Extract text content from a component tag
 */
function extractContent(match) {
  // Remove component opening/closing tags
  const content = match
    .replace(/<\/?MarginNote[^>]*>/g, '')
    .replace(/<\/?Footnote[^>]*>/g, '')
    .trim();
  return content;
}

/**
 * Extract anchor text from component
 */
function extractAnchor(componentTag) {
  const anchorMatch = componentTag.match(/anchor=["']([^"']+)["']/);
  return anchorMatch ? anchorMatch[1] : null;
}

/**
 * Convert MDX with components to Buttondown markdown
 */
async function convertMDXToButtondown(mdxContent) {
  let markdown = mdxContent;
  let footnotes = [];
  let footnoteCounter = 0;

  // Remove import statements (not needed in markdown)
  markdown = markdown.replace(/^import\s+.*from\s+['"].*['"];?\s*$/gm, '');

  // Process MarginNote and Footnote components
  // Pattern: <MarginNote anchor="text">content</MarginNote> or <MarginNote>content</MarginNote>
  const componentPattern = /<(MarginNote|Footnote)([^>]*)>([\s\S]*?)<\/\1>/g;

  markdown = markdown.replace(componentPattern, (match, componentType, attributes, content) => {
    footnoteCounter++;
    const anchor = extractAnchor(attributes);
    const noteContent = content.trim();

    // Store footnote for later
    footnotes.push({ number: footnoteCounter, content: noteContent });

    // Return inline reference
    if (anchor) {
      // Anchor version: anchor text followed by reference
      return `${anchor}[^${footnoteCounter}]`;
    } else {
      // Plain reference
      return `[^${footnoteCounter}]`;
    }
  });

  // Process Figure components - convert to standard markdown images
  // <Figure src={import} alt="text">Caption</Figure>
  markdown = markdown.replace(
    /<Figure\s+src=\{([^}]+)\}\s+alt=["']([^"']+)["'][^>]*>([\s\S]*?)<\/Figure>/g,
    (match, srcImport, alt, caption) => {
      // For email, we'd need actual image URLs, not imports
      // This is a placeholder - you'd need to handle image URLs properly
      return `\n![${alt}](IMAGE_URL_HERE)\n\n*${caption.trim()}*\n`;
    }
  );

  // Process Poem components - convert to blockquote
  markdown = markdown.replace(
    /<Poem\s+id=["']([^"']+)["']\s*\/>/g,
    (match, poemId) => {
      return `\n> [Poem: ${poemId}]\n`;
    }
  );

  // Clean up any remaining JSX/component syntax
  markdown = markdown.replace(/<\/?[A-Z][^>]*>/g, '');

  // Add footnotes section at the end
  if (footnotes.length > 0) {
    markdown += '\n\n---\n\n';
    for (const note of footnotes) {
      markdown += `[^${note.number}]: ${note.content}\n\n`;
    }
  }

  // Clean up excessive whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n');

  return {
    markdown: markdown.trim(),
    footnoteCount: footnotes.length,
  };
}

/**
 * Extract frontmatter and content
 */
function splitFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: '', content };
  }
  return {
    frontmatter: match[1],
    content: match[2],
  };
}

/**
 * Main conversion function
 */
async function convertFile(inputPath, outputPath) {
  try {
    // Read MDX file
    const mdxContent = await fs.readFile(inputPath, 'utf-8');

    // Split frontmatter and content
    const { frontmatter, content } = splitFrontmatter(mdxContent);

    // Convert content
    const { markdown, footnoteCount } = await convertMDXToButtondown(content);

    // Reassemble with frontmatter
    const output = frontmatter
      ? `---\n${frontmatter}\n---\n\n${markdown}`
      : markdown;

    // Write output
    if (outputPath) {
      await fs.writeFile(outputPath, output, 'utf-8');
      console.log(`✓ Converted to ${outputPath}`);
    } else {
      console.log(output);
    }

    console.log(`\n📝 Converted ${footnoteCount} notes to markdown footnote syntax`);

  } catch (error) {
    console.error('Error converting file:', error.message);
    process.exit(1);
  }
}

// CLI usage
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: ./mdx-to-buttondown.mjs <input.mdx> [--output <output.md>]');
  console.log('');
  console.log('Converts MDX with MarginNote/Footnote components to Buttondown markdown');
  process.exit(1);
}

const inputPath = args[0];
const outputIndex = args.indexOf('--output');
const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : null;

convertFile(inputPath, outputPath);
