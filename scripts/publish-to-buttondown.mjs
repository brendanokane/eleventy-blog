#!/usr/bin/env node
/**
 * Publish posts to Buttondown email service
 *
 * This script sends posts to Buttondown subscribers via their API.
 * It tracks which posts have been sent via frontmatter to prevent duplicate sends.
 *
 * Usage:
 *   node scripts/publish-to-buttondown.mjs --post <slug>
 *   node scripts/publish-to-buttondown.mjs --post <slug> --dry-run
 *   node scripts/publish-to-buttondown.mjs --list-pending
 *
 * Requirements:
 *   - Post must have `publish: true` in frontmatter
 *   - Post must NOT have `buttondown_sent: true` (or field must be false)
 *   - BUTTONDOWN_API_KEY environment variable must be set
 *   - Email variant must be built (run `npm run build` first)
 *
 * After successful send, updates frontmatter to add:
 *   buttondown_sent: true
 *   buttondown_sent_date: <ISO timestamp>
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(PROJECT_ROOT, 'content/blog');
const SITE_DIR = path.join(PROJECT_ROOT, '_site');
const BUTTONDOWN_API = 'https://api.buttondown.com/v1/emails';

// Parse command line arguments
function parseArgs(argv) {
  const args = {
    post: null,
    dryRun: false,
    listPending: false,
    force: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--post' && argv[i + 1]) {
      args.post = argv[++i];
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--list-pending') {
      args.listPending = true;
    } else if (arg === '--force') {
      args.force = true;
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    }
  }

  return args;
}

function showHelp() {
  console.log(`
Publish posts to Buttondown

Usage:
  node scripts/publish-to-buttondown.mjs --post <slug> [options]
  node scripts/publish-to-buttondown.mjs --list-pending

Options:
  --post <slug>     Slug of the post to publish (e.g., "the-naming-of-cats")
  --dry-run         Show what would be sent without actually sending
  --force           Send even if buttondown_sent is true (BE CAREFUL!)
  --list-pending    List all posts ready to be sent to Buttondown
  --help, -h        Show this help message

Environment:
  BUTTONDOWN_API_KEY    Your Buttondown API key (required)
                        Get it from: https://buttondown.com/settings/api

Examples:
  # List posts ready to send
  node scripts/publish-to-buttondown.mjs --list-pending

  # Preview what would be sent
  node scripts/publish-to-buttondown.mjs --post my-post-slug --dry-run

  # Actually send the email
  node scripts/publish-to-buttondown.mjs --post my-post-slug

Notes:
  - Post must have 'publish: true' in frontmatter
  - Post must not have 'buttondown_sent: true' (unless using --force)
  - Run 'npm run build' first to generate email HTML
  - After successful send, frontmatter is updated with buttondown_sent: true
`.trim());
}

// Parse frontmatter from markdown file
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fm = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // Parse boolean values
    if (value === 'true') value = true;
    if (value === 'false') value = false;

    // Remove quotes from strings
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (typeof value === 'string' && value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }

    fm[key] = value;
  }

  return fm;
}

// Update frontmatter in markdown file
async function updateFrontmatter(filePath, updates) {
  const content = await fs.readFile(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);

  if (!match) {
    throw new Error('No frontmatter found in file');
  }

  let fmContent = match[1];

  // Add or update fields
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}:.*$`, 'm');
    const newLine = `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`;

    if (regex.test(fmContent)) {
      fmContent = fmContent.replace(regex, newLine);
    } else {
      fmContent += `\n${newLine}`;
    }
  }

  const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${fmContent}\n---`);
  await fs.writeFile(filePath, newContent, 'utf-8');
}

// Find all posts in content/blog
async function findAllPosts() {
  const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
  const posts = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const slug = entry.name;
    const indexPath = path.join(CONTENT_DIR, slug, 'index.md');

    try {
      await fs.access(indexPath);
      posts.push({ slug, path: indexPath });
    } catch {
      // No index.md, skip
    }
  }

  return posts;
}

// Get posts that are ready to be sent to Buttondown
async function getPendingPosts() {
  const allPosts = await findAllPosts();
  const pending = [];

  for (const post of allPosts) {
    const content = await fs.readFile(post.path, 'utf-8');
    const fm = parseFrontmatter(content);

    if (!fm) continue;
    if (fm.publish !== true) continue;
    if (fm.buttondown_sent === true) continue;

    pending.push({
      slug: post.slug,
      path: post.path,
      title: fm.title || 'Untitled',
      date: fm.date || 'No date',
    });
  }

  return pending;
}

// Get HTML content for email from built site
async function getEmailHTML(slug) {
  const emailPath = path.join(SITE_DIR, 'emails', slug, 'index.html');

  try {
    const html = await fs.readFile(emailPath, 'utf-8');
    return html;
  } catch (err) {
    throw new Error(
      `Email HTML not found at ${emailPath}\n` +
      `Did you run 'npm run build' first?`
    );
  }
}

// Send email to Buttondown API
async function sendToButtondown(subject, body, slug, dryRun = false) {
  const apiKey = process.env.BUTTONDOWN_API_KEY;

  if (!apiKey) {
    throw new Error(
      'BUTTONDOWN_API_KEY environment variable not set.\n' +
      'Get your API key from: https://buttondown.com/settings/api'
    );
  }

  const payload = {
    subject: subject,
    body: body,
    email_type: 'public',
    metadata: {
      eleventy_slug: slug,
      sent_via: 'eleventy-publish-script',
      sent_at: new Date().toISOString(),
    },
  };

  if (dryRun) {
    console.log('\n📧 Would send to Buttondown:');
    console.log('Subject:', subject);
    console.log('Body length:', body.length, 'characters');
    console.log('Metadata:', JSON.stringify(payload.metadata, null, 2));
    return { dryRun: true };
  }

  console.log('\n📧 Sending to Buttondown...');

  const response = await fetch(BUTTONDOWN_API, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Buttondown API error (${response.status}):\n${errorText}`
    );
  }

  const result = await response.json();
  console.log('✅ Sent successfully!');
  console.log('   Email ID:', result.id);
  console.log('   Status:', result.status);
  console.log('   View at:', result.absolute_url);

  return result;
}

// Main function
async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    return;
  }

  // List pending posts
  if (args.listPending) {
    console.log('📋 Posts ready to send to Buttondown:\n');
    const pending = await getPendingPosts();

    if (pending.length === 0) {
      console.log('   No posts are ready to send.');
      console.log('   (Posts must have publish: true and no buttondown_sent: true)');
      return;
    }

    for (const post of pending) {
      console.log(`   • ${post.slug}`);
      console.log(`     Title: ${post.title}`);
      console.log(`     Date: ${post.date}`);
      console.log();
    }

    console.log(`Total: ${pending.length} post(s)`);
    console.log('\nTo send a post:');
    console.log('  node scripts/publish-to-buttondown.mjs --post <slug>');
    return;
  }

  // Publish a specific post
  if (!args.post) {
    console.error('❌ Error: --post <slug> is required');
    console.error('Run with --help for usage information');
    process.exit(1);
  }

  const slug = args.post;
  const postPath = path.join(CONTENT_DIR, slug, 'index.md');

  // Check if post exists
  try {
    await fs.access(postPath);
  } catch {
    console.error(`❌ Error: Post not found at ${postPath}`);
    process.exit(1);
  }

  // Read and parse frontmatter
  const content = await fs.readFile(postPath, 'utf-8');
  const fm = parseFrontmatter(content);

  if (!fm) {
    console.error('❌ Error: No frontmatter found in post');
    process.exit(1);
  }

  // Check if post is published
  if (fm.publish !== true) {
    console.error('❌ Error: Post is not published (publish: true required)');
    process.exit(1);
  }

  // Check if already sent (unless --force)
  if (fm.buttondown_sent === true && !args.force) {
    console.error('❌ Error: Post has already been sent to Buttondown');
    console.error('   Use --force to send again (this will send duplicate emails!)');
    process.exit(1);
  }

  if (args.force && fm.buttondown_sent === true) {
    console.warn('⚠️  WARNING: Using --force to resend an already-sent post!');
    console.warn('   This will send duplicate emails to subscribers.');
    console.warn('   Press Ctrl+C to cancel...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Get email HTML
  const emailHTML = await getEmailHTML(slug);
  const subject = fm.title || 'Untitled';

  console.log('\n📝 Post details:');
  console.log('   Slug:', slug);
  console.log('   Title:', subject);
  console.log('   Date:', fm.date || 'No date');
  console.log('   Email HTML size:', emailHTML.length, 'characters');

  if (args.dryRun) {
    console.log('\n🔍 DRY RUN MODE - no changes will be made');
  }

  // Send to Buttondown
  try {
    const result = await sendToButtondown(subject, emailHTML, slug, args.dryRun);

    // Update frontmatter (unless dry run)
    if (!args.dryRun) {
      await updateFrontmatter(postPath, {
        buttondown_sent: true,
        buttondown_sent_date: new Date().toISOString(),
        buttondown_email_id: result.id,
      });

      console.log('\n✏️  Updated frontmatter:');
      console.log('   buttondown_sent: true');
      console.log('   buttondown_sent_date:', new Date().toISOString());
      console.log('   buttondown_email_id:', result.id);
    }

    console.log('\n✅ Done!');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

// Run main function
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
