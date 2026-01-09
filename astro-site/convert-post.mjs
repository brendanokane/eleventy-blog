#!/usr/bin/env node
/**
 * Convert Eleventy markdown posts to Astro MDX
 *
 * Usage: node convert-post.mjs <path-to-eleventy-post>
 */

import fs from 'fs/promises';
import path from 'path';

async function convertPost(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');

  // Track which components are used
  const components = new Set();

  // 1. Fix date format in frontmatter (YYYY-MM-DD → ISO)
  content = content.replace(
    /^date: (\d{4}-\d{2}-\d{2})$/m,
    'date: $1T00:00:00.000Z'
  );

  // 2. Detect and convert margin notes
  if (content.includes('{% mn')) {
    components.add('MarginNote');

    // With anchor
    content = content.replace(
      /{%\s*mn\s+"([^"]+)"\s*%}([\s\S]*?){%\s*endmn\s*%}/g,
      '<MarginNote anchor="$1">$2</MarginNote>'
    );

    // Without anchor
    content = content.replace(
      /{%\s*mn\s*%}([\s\S]*?){%\s*endmn\s*%}/g,
      '<MarginNote>$1</MarginNote>'
    );
  }

  // 3. Convert figures
  if (content.includes('{% figure')) {
    components.add('Figure');

    content = content.replace(
      /{%\s*figure\s+"([^"]+)",\s*"([^"]*)",\s*"([^"]*)"\s*%}([\s\S]*?){%\s*endfigure\s*%}/g,
      '<Figure src="$1" alt="$2" style="$3">$4</Figure>'
    );

    // Two-argument version (no style)
    content = content.replace(
      /{%\s*figure\s+"([^"]+)",\s*"([^"]*)"\s*%}([\s\S]*?){%\s*endfigure\s*%}/g,
      '<Figure src="$1" alt="$2">$3</Figure>'
    );
  }

  // 4. Convert poems
  if (content.includes('{% poem')) {
    components.add('Poem');

    content = content.replace(
      /{%\s*poem\s+"([^"]+)"\s*%}/g,
      '<Poem id="$1" />'
    );
  }

  // 5. Convert footnotes
  if (content.includes('{% fn')) {
    components.add('Footnote');

    // With anchor
    content = content.replace(
      /{%\s*fn\s+"([^"]+)"\s*%}([\s\S]*?){%\s*endfn\s*%}/g,
      '<Footnote anchor="$1">$2</Footnote>'
    );

    // Without anchor
    content = content.replace(
      /{%\s*fn\s*%}([\s\S]*?){%\s*endfn\s*%}/g,
      '<Footnote>$1</Footnote>'
    );
  }

  // 6. Add import statements after frontmatter
  if (components.size > 0) {
    const imports = Array.from(components).map(comp =>
      `import ${comp} from '../../components/${comp}.astro';`
    ).join('\n');

    content = content.replace(
      /^(---[\s\S]*?---)/,
      `$1\n\n${imports}`
    );
  }

  return {
    content,
    components: Array.from(components)
  };
}

// CLI usage
if (process.argv.length < 3) {
  console.error('Usage: node convert-post.mjs <path-to-post>');
  process.exit(1);
}

const inputPath = process.argv[2];
const result = await convertPost(inputPath);

console.log('Converted content:');
console.log('─'.repeat(80));
console.log(result.content);
console.log('─'.repeat(80));
console.log(`\nComponents used: ${result.components.join(', ') || 'none'}`);
