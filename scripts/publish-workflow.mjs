#!/usr/bin/env node
/**
 * Publishing Workflow for Burning House
 * 
 * Multi-step workflow with preview and confirmation at each stage:
 * 1. Preview web version
 * 2. Preview email version
 * 3. Preview Bluesky post (with OG card)
 * 4. Final confirmation
 * 5. Publish everything
 * 
 * Usage (from Front Matter CMS):
 *   node scripts/publish-workflow.mjs --post <slug>
 * 
 * Or run interactively:
 *   node scripts/publish-workflow.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(PROJECT_ROOT, 'content/blog');
const SITE_DIR = path.join(PROJECT_ROOT, '_site');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createReadline() {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

async function prompt(question) {
  const rl = createReadline();
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${question}${colors.reset} `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function confirm(question) {
  const answer = await prompt(`${question} (y/n)`);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

// Parse frontmatter from markdown file
async function parseFrontmatter(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let multilineValue = [];

  for (const line of lines) {
    if (line.match(/^\w+:/)) {
      // Save previous multiline value if exists
      if (currentKey && multilineValue.length) {
        frontmatter[currentKey] = multilineValue.join('\n');
        multilineValue = [];
      }

      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      currentKey = key.trim();
      
      if (value) {
        frontmatter[currentKey] = value;
      }
    } else if (currentKey) {
      multilineValue.push(line);
    }
  }

  // Save final multiline value
  if (currentKey && multilineValue.length) {
    frontmatter[currentKey] = multilineValue.join('\n');
  }

  return frontmatter;
}

// Update frontmatter in markdown file
async function updateFrontmatter(filePath, updates) {
  const content = await fs.readFile(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('No frontmatter found');

  const [, frontmatterText, bodyText] = match;
  let newFrontmatter = frontmatterText;

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}:.*$`, 'm');
    if (regex.test(newFrontmatter)) {
      // Update existing field
      newFrontmatter = newFrontmatter.replace(regex, `${key}: ${value}`);
    } else {
      // Add new field at the end
      newFrontmatter += `\n${key}: ${value}`;
    }
  }

  await fs.writeFile(filePath, `---\n${newFrontmatter}\n---\n${bodyText}`, 'utf-8');
}

// Get post slug from user or command line
async function getPostSlug(args) {
  if (args.post) return args.post;

  log('\nAvailable drafts:', 'bright');
  
  const posts = await fs.readdir(CONTENT_DIR);
  const drafts = [];

  for (const post of posts) {
    const postDir = path.join(CONTENT_DIR, post);
    const stats = await fs.stat(postDir);
    if (!stats.isDirectory()) continue;

    const indexPath = path.join(postDir, 'index.md');
    try {
      const fm = await parseFrontmatter(indexPath);
      if (fm && (fm.draft === 'true' || fm.publish === 'false')) {
        drafts.push({ slug: post, title: fm.title || post });
      }
    } catch (err) {
      // Skip posts without valid frontmatter
    }
  }

  if (drafts.length === 0) {
    log('\nNo drafts found. All posts are already published!', 'yellow');
    process.exit(0);
  }

  drafts.forEach((draft, i) => {
    console.log(`  ${i + 1}. ${draft.title} (${draft.slug})`);
  });

  const answer = await prompt('\nEnter post number or slug:');
  const num = parseInt(answer, 10);
  
  if (num && num > 0 && num <= drafts.length) {
    return drafts[num - 1].slug;
  }
  
  return answer;
}

// Main workflow
async function runWorkflow() {
  log('\n╔══════════════════════════════════════╗', 'bright');
  log('║  Burning House Publishing Workflow  ║', 'bright');
  log('╚══════════════════════════════════════╝\n', 'bright');

  const args = parseArgs(process.argv.slice(2));
  const slug = await getPostSlug(args);

  const postDir = path.join(CONTENT_DIR, slug);
  const indexPath = path.join(postDir, 'index.md');

  // Check if post exists
  try {
    await fs.access(indexPath);
  } catch {
    log(`\n❌ Post not found: ${slug}`, 'red');
    process.exit(1);
  }

  const fm = await parseFrontmatter(indexPath);
  if (!fm) {
    log('\n❌ Could not parse frontmatter', 'red');
    process.exit(1);
  }

  log(`\n📝 Post: ${fm.title || slug}`, 'bright');
  log(`   Slug: ${slug}`, 'cyan');
  log(`   Date: ${fm.date || 'not set'}`, 'cyan');
  log(`   Draft: ${fm.draft || fm.publish}`, 'cyan');

  // Step 1: Preview Web Version
  log('\n' + '─'.repeat(50), 'blue');
  log('STEP 1: Web Preview', 'bright');
  log('─'.repeat(50) + '\n', 'blue');

  log(`🌐 Web version: http://localhost:8080/${slug}/`, 'green');
  const webOk = await confirm('Does the web version look good?');
  if (!webOk) {
    log('\n👋 Go back and edit. Run this script again when ready.', 'yellow');
    process.exit(0);
  }

  // Step 2: Preview Email Version
  log('\n' + '─'.repeat(50), 'blue');
  log('STEP 2: Email Preview', 'bright');
  log('─'.repeat(50) + '\n', 'blue');

  log(`📧 Email version: http://localhost:8080/emails/${slug}/`, 'green');
  const emailOk = await confirm('Does the email version look good?');
  if (!emailOk) {
    log('\n👋 Go back and edit. Run this script again when ready.', 'yellow');
    process.exit(0);
  }

  // Step 3: Bluesky Preview
  log('\n' + '─'.repeat(50), 'blue');
  log('STEP 3: Bluesky Post Preview', 'bright');
  log('─'.repeat(50) + '\n', 'blue');

  const postUrl = `https://burninghou.se/${slug}/`;
  log(`\nPost URL: ${postUrl}`, 'cyan');
  log(`\nSuggested Bluesky post:`, 'bright');
  log(`─────────────────────────────────────`, 'blue');
  
  const blueskyText = fm.og_description || fm.description || fm.title;
  console.log(`\n${blueskyText}\n\n${postUrl}\n`);
  log(`─────────────────────────────────────`, 'blue');

  log('\n📱 When you post to Bluesky, the URL will show an OG card with:', 'cyan');
  log(`   • Title: ${fm.title}`, 'cyan');
  log(`   • Description: ${fm.og_description || fm.description || '(none)'}`, 'cyan');
  log(`   • Image: ${fm.post_image || '(default)'}`, 'cyan');

  const blueskyOk = await confirm('\nReady to post to Bluesky?');
  if (!blueskyOk) {
    log('\n👋 Come back when ready.', 'yellow');
    process.exit(0);
  }

  // Step 4: Final Confirmation
  log('\n' + '='.repeat(50), 'red');
  log('STEP 4: FINAL CONFIRMATION', 'bright');
  log('='.repeat(50) + '\n', 'red');

  log('This will:', 'bright');
  log('  ✓ Set draft: false in frontmatter', 'green');
  log('  ✓ Rebuild the site', 'green');
  log('  ✓ Prompt you to post to Bluesky', 'green');
  log('  ✓ Ask if you want to send email to Buttondown', 'green');

  const finalConfirm = await confirm('\n🚀 PUBLISH EVERYTHING?');
  if (!finalConfirm) {
    log('\n👋 Cancelled. No changes made.', 'yellow');
    process.exit(0);
  }

  // Do the publish!
  log('\n' + '█'.repeat(50), 'green');
  log('PUBLISHING...', 'bright');
  log('█'.repeat(50) + '\n', 'green');

  // Update frontmatter
  log('📝 Updating frontmatter...', 'cyan');
  await updateFrontmatter(indexPath, {
    draft: 'false',
    publish: 'true',
  });
  log('   ✓ Set draft: false', 'green');

  // Rebuild
  log('\n🔨 Rebuilding site...', 'cyan');
  const { spawn } = await import('node:child_process');
  await new Promise((resolve, reject) => {
    const build = spawn('npm', ['run', 'build'], { cwd: PROJECT_ROOT, stdio: 'inherit' });
    build.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Build failed with code ${code}`));
    });
  });
  log('   ✓ Site rebuilt', 'green');

  // Bluesky posting
  log('\n📱 Post to Bluesky now:', 'cyan');
  log(`\n${blueskyText}\n\n${postUrl}\n`);
  await prompt('Press Enter when you\'ve posted to Bluesky...');

  const blueskyUrl = await prompt('Paste the Bluesky thread URL:');
  if (blueskyUrl && blueskyUrl.includes('bsky.app')) {
    await updateFrontmatter(indexPath, {
      bluesky_thread: blueskyUrl,
    });
    log('   ✓ Bluesky URL saved to frontmatter', 'green');
  }

  // Buttondown
  const sendEmail = await confirm('\n📧 Send email to Buttondown subscribers?');
  if (sendEmail) {
    log('\n📬 Sending to Buttondown...', 'cyan');
    const send = spawn('node', ['scripts/publish-to-buttondown.mjs', '--post', slug], {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    await new Promise((resolve) => send.on('close', resolve));
  } else {
    log('   ⊘ Skipped email send', 'yellow');
  }

  // Success!
  log('\n' + '█'.repeat(50), 'green');
  log('🎉 PUBLISHED SUCCESSFULLY!', 'bright');
  log('█'.repeat(50) + '\n', 'green');

  log(`View your post at: ${postUrl}`, 'cyan');
  if (blueskyUrl) {
    log(`Bluesky thread: ${blueskyUrl}`, 'cyan');
  }
}

function parseArgs(argv) {
  const args = { post: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--post' && argv[i + 1]) {
      args.post = argv[++i];
    }
  }
  return args;
}

// Run it!
runWorkflow().catch((err) => {
  log(`\n❌ Error: ${err.message}`, 'red');
  process.exit(1);
});
