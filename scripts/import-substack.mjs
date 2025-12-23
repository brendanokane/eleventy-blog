import fs from "node:fs/promises";
import path from "node:path";

const REPO_ROOT = process.cwd();
const ARCHIVE_DIR = path.join(REPO_ROOT, "BHArchive");
const BLOG_DIR = path.join(REPO_ROOT, "content", "blog");

function slugify(str) {
  return String(str)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractTitle(md) {
  // Substack export typically starts with `# Title`
  const m = md.match(/^#\s+(.+)\s*$/m);
  return m ? m[1].trim() : null;
}

function extractPublishedDateFromIndex(indexMd, filename) {
  // Match blocks like:
  // ## [What's Good?](20220803_193945_whats-good.md)
  // **Published:** August 3, 2022 | **Downloaded:** ...
  const esc = filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `##\\s+\\[[^\\]]+\\]\\(${esc}\\)\\s*[\\s\\S]*?\\*\\*Published:\\*\\*\\s+([^|\n]+)`,
    "m"
  );
  const m = indexMd.match(re);
  if (!m) return null;
  const dateStr = m[1].trim();
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function parseFootnotes(md) {
  // Substack export uses:
  // [1](#footnote-anchor-1)
  // <blank>
  // footnote text...
  // Next footnote marker...
  //
  // We'll parse from the first `\n[1](#footnote-anchor-1)` near the end.
  const start = md.search(/\n\[1\]\(#footnote-anchor-1\)\s*\n/);
  if (start === -1) {
    return { body: md, notesByNumber: {} };
  }

  const body = md.slice(0, start).trimEnd();
  const notesBlock = md.slice(start).trim();

  // Split into note entries by blank lines + `[n](#footnote-anchor-n)` markers.
  const noteRegex = /^\[(\d+)\]\(#footnote-anchor-\d+\)\s*$/gm;

  const positions = [];
  let match;
  while ((match = noteRegex.exec(notesBlock)) !== null) {
    positions.push({
      num: Number(match[1]),
      idx: match.index,
      len: match[0].length,
    });
  }

  if (positions.length === 0) {
    return { body, notesByNumber: {} };
  }

  const notesByNumber = {};
  for (let i = 0; i < positions.length; i++) {
    const cur = positions[i];
    const next = positions[i + 1];
    const contentStart = cur.idx + cur.len;
    const contentEnd = next ? next.idx : notesBlock.length;
    const raw = notesBlock.slice(contentStart, contentEnd).trim();
    if (raw) notesByNumber[cur.num] = raw;
  }

  return { body, notesByNumber };
}

function injectMarginNotes(bodyMd, notesByNumber) {
  // Replace inline refs like `[1](#footnote-1)` with `※` marker and attach aside blocks.
  // Since we need the note block *after the paragraph*, we do a simple heuristic:
  // 1) Find the paragraph containing the ref (from previous blank line to next blank line)
  // 2) Replace the ref with a marker sup
  // 3) Insert an HTML <aside> right after that paragraph.

  let out = bodyMd;
  const used = new Set();

  const refRe = /\[(\d+)\]\(#footnote-(\d+)\)/g;

  // Collect all matches first (so indices don't drift while we edit)
  const matches = [];
  let m;
  while ((m = refRe.exec(bodyMd)) !== null) {
    matches.push({ num: Number(m[1]), idx: m.index, len: m[0].length });
  }

  // Process from last to first to keep indices stable.
  for (let i = matches.length - 1; i >= 0; i--) {
    const { num, idx, len } = matches[i];
    const note = notesByNumber[num];
    if (!note) continue;

    const id = `mn-${num}`;

    // Find paragraph boundaries around the reference.
    const before = out.slice(0, idx);
    const after = out.slice(idx + len);

    const paraStart = before.lastIndexOf("\n\n");
    const start = paraStart === -1 ? 0 : paraStart + 2;

    const paraEndRel = after.indexOf("\n\n");
    const end = paraEndRel === -1 ? out.length : idx + len + paraEndRel;

    const para = out.slice(start, end);

    // Replace only this occurrence within the paragraph
    const replacedPara =
      para.slice(0, idx - start) +
      `<sup class="mn-marker" data-mn-id="${id}" aria-controls="${id}" aria-expanded="false" title="Toggle note">※</sup>` +
      para.slice(idx - start + len);

    // Build aside HTML. We allow Markdown inside; markdown-it will render it.
    const aside = `\n<aside class="mn-note" id="${id}" data-mn-id="${id}" hidden>\n\n${note}\n\n</aside>\n`;

    out = out.slice(0, start) + replacedPara + aside + out.slice(end);
    used.add(num);
  }

  return out;
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function main() {
  const indexPath = path.join(ARCHIVE_DIR, "index.md");
  const indexMd = await fs.readFile(indexPath, "utf8");

  const entries = await fs.readdir(ARCHIVE_DIR);
  const mdFiles = entries.filter(
    (f) => f.endsWith(".md") && f !== "index.md"
  );

  const created = [];

  for (const filename of mdFiles) {
    const srcPath = path.join(ARCHIVE_DIR, filename);
    const raw = await fs.readFile(srcPath, "utf8");

    const title = extractTitle(raw) ?? filename;
    const date = extractPublishedDateFromIndex(indexMd, filename);

    const { body, notesByNumber } = parseFootnotes(raw);
    const withNotes = injectMarginNotes(body, notesByNumber);

    const slug = slugify(title);
    const outDir = path.join(BLOG_DIR, slug);
    const outPath = path.join(outDir, "index.md");

    const frontmatter = [
      "---",
      `title: ${JSON.stringify(title)}`,
      ...(date ? [`date: ${date}`] : []),
      "draft: true",
      "publish: false",
      "bluesky_thread:",
      "---",
      "",
    ].join("\n");

    await ensureDir(outDir);
    await fs.writeFile(outPath, frontmatter + withNotes.trimStart() + "\n", "utf8");

    created.push({ title, slug, outPath: path.relative(REPO_ROOT, outPath) });
  }

  // Write a small report
  const reportPath = path.join(REPO_ROOT, "content", "blog", "_import-report.json");
  await fs.writeFile(reportPath, JSON.stringify(created, null, 2) + "\n", "utf8");

  console.log(`Imported ${created.length} posts.`);
  console.log(`Report: ${path.relative(REPO_ROOT, reportPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
