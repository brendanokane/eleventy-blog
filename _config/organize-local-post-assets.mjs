#!/usr/bin/env node
/**
 * organize-local-post-assets.mjs
 *
 * Copy referenced local images into per-post assets, convert HEIC to JPEG/PNG, and
 * rewrite markdown to blog-less asset URLs:
 *
 *   Source markdown: content/blog/<slug>/index.md
 *   Source images:   usually BHArchive/images/<slug>/<file> (or other relative paths)
 *   Dest assets:     content/blog/<slug>/assets/<file.{jpg|png|orig}>
 *   Rewritten URLs:  /<slug>/assets/<file.jpg>
 *
 * This is designed for the observed Eleventy/Substack import pattern where markdown references
 * local images using paths like:
 *   images/<post-slug>/<uuid>.heic
 * but the actual image files live under:
 *   BHArchive/images/<post-slug>/<uuid>.heic
 *
 * It also supports:
 * - plain markdown images: ![alt](path)
 * - linked images: [![alt](path)](path)
 * - html images: <img src="path">
 *
 * It will:
 * - copy or convert only local (non-http) paths
 * - leave remote URLs alone
 * - be idempotent (doesn’t redo work unless --force)
 *
 * macOS note:
 * - HEIC conversion uses `sips` (built-in on macOS). If `sips` isn’t available, HEIC conversion
 *   will fail for those files.
 *
 * Usage examples:
 *   node _config/organize-local-post-assets.mjs --dry-run
 *   node _config/organize-local-post-assets.mjs --dry-run --verbose
 *   node _config/organize-local-post-assets.mjs --convert heic --heic-format jpeg
 *   node _config/organize-local-post-assets.mjs --force
 *
 * Options:
 *   --root <path>            Project root (default: cwd)
 *   --content <path>         Content blog root (default: <root>/content/blog)
 *   --archive <path>         Archive root for images (default: <root>/BHArchive)
 *   --assets-dir <name>      Per-post assets dir name (default: assets)
 *   --convert <mode>         "heic" (default) or "none"
 *   --heic-format <fmt>      "jpeg" (default) or "png"
 *   --force                  Overwrite/recreate outputs even if present
 *   --dry-run                Print planned operations only
 *   --verbose                Extra logging
 *   --yes                    Non-interactive (don’t prompt)
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import readline from "node:readline";

const execFileAsync = promisify(execFile);

function parseArgs(argv) {
  const out = {
    root: process.cwd(),
    content: null,
    archive: null,
    assetsDir: "assets",
    convert: "heic", // "heic" | "none"
    heicFormat: "jpeg", // "jpeg" | "png"
    force: false,
    dryRun: false,
    verbose: false,
    yes: false,
    help: false,
  };

  const args = [...argv];
  while (args.length) {
    const a = args.shift();
    if (!a) break;

    if (a === "--root") out.root = String(args.shift() ?? out.root);
    else if (a === "--content") out.content = String(args.shift() ?? "");
    else if (a === "--archive") out.archive = String(args.shift() ?? "");
    else if (a === "--assets-dir")
      out.assetsDir = String(args.shift() ?? out.assetsDir);
    else if (a === "--convert")
      out.convert = String(args.shift() ?? out.convert);
    else if (a === "--heic-format")
      out.heicFormat = String(args.shift() ?? out.heicFormat);
    else if (a === "--force") out.force = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--verbose") out.verbose = true;
    else if (a === "--yes") out.yes = true;
    else if (a === "--help" || a === "-h") out.help = true;
  }

  out.content = out.content
    ? path.resolve(out.root, out.content)
    : path.resolve(out.root, "content", "blog");

  out.archive = out.archive
    ? path.resolve(out.root, out.archive)
    : path.resolve(out.root, "BHArchive");

  // Normalize
  out.convert = (out.convert || "heic").toLowerCase();
  out.heicFormat = (out.heicFormat || "jpeg").toLowerCase();

  if (!["heic", "none"].includes(out.convert)) out.convert = "heic";
  if (!["jpeg", "png"].includes(out.heicFormat)) out.heicFormat = "jpeg";

  return out;
}

function printHelp() {
  console.log(
    `
organize-local-post-assets.mjs

Copy referenced local images into per-post assets, convert HEIC to JPEG/PNG, and rewrite markdown
to blog-less asset URLs: /<slug>/assets/<file>.

Usage:
  node _config/organize-local-post-assets.mjs [options]

Options:
  --root <path>            Project root (default: cwd)
  --content <path>         Content blog root (default: <root>/content/blog)
  --archive <path>         Archive root (default: <root>/BHArchive)
  --assets-dir <name>      Per-post assets dir (default: assets)
  --convert <mode>         heic | none (default: heic)
  --heic-format <fmt>      jpeg | png (default: jpeg)
  --force                  Overwrite outputs even if present
  --dry-run                Print planned operations only
  --verbose                Extra logging
  --yes                    Non-interactive (assume yes)
`.trim(),
  );
}

function isHttpUrl(u) {
  return typeof u === "string" && /^https?:\/\//i.test(u);
}

function sha1Hex(input) {
  return crypto.createHash("sha1").update(input).digest("hex");
}

function decodeHtmlEntitiesMinimal(s) {
  return s
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

async function pathExists(p) {
  try {
    await fsp.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function isDirectory(p) {
  try {
    const st = await fsp.stat(p);
    return st.isDirectory();
  } catch {
    return false;
  }
}

async function isFile(p) {
  try {
    const st = await fsp.stat(p);
    return st.isFile();
  } catch {
    return false;
  }
}

async function ensureDir(p, dryRun) {
  if (dryRun) return;
  await fsp.mkdir(p, { recursive: true });
}

async function promptYesNo(question, defaultYes = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const suffix = defaultYes ? " [Y/n] " : " [y/N] ";
  const q = question + suffix;
  const answer = await new Promise((resolve) => rl.question(q, resolve));
  rl.close();
  const s = String(answer || "")
    .trim()
    .toLowerCase();
  if (!s) return defaultYes;
  if (s === "y" || s === "yes") return true;
  if (s === "n" || s === "no") return false;
  return defaultYes;
}

function stripMdAngleBrackets(pth) {
  const s = String(pth || "").trim();
  if (s.startsWith("<") && s.endsWith(">")) return s.slice(1, -1);
  return s;
}

function normalizePathish(pth) {
  // Decode minimal HTML entities and strip surrounding angle brackets.
  return stripMdAngleBrackets(
    decodeHtmlEntitiesMinimal(String(pth || "").trim()),
  );
}

function isProbablyLocalPath(pth) {
  if (!pth) return false;
  if (isHttpUrl(pth)) return false;
  if (pth.startsWith("data:")) return false;
  if (pth.startsWith("mailto:") || pth.startsWith("tel:")) return false;
  return true;
}

function removeQueryAndHash(pth) {
  const iQ = pth.indexOf("?");
  const iH = pth.indexOf("#");
  const cut = Math.min(iQ === -1 ? Infinity : iQ, iH === -1 ? Infinity : iH);
  if (cut === Infinity) return pth;
  return pth.slice(0, cut);
}

function getExtLower(pth) {
  return path.extname(pth).toLowerCase();
}

/**
 * Extract image references from Markdown and HTML within a content string.
 * Returns objects with:
 * - kind: "md" | "html"
 * - fullMatch: the exact matched substring (for stable replacement)
 * - url: the extracted URL/path
 * - index: start index
 */
function extractImageRefs(content) {
  const refs = [];

  // Markdown images: ![alt](URL "title")
  const mdImageRe =
    /!\[[^\]]*\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g;
  for (const m of content.matchAll(mdImageRe)) {
    const raw = m[1] || "";
    const url = normalizePathish(raw);
    refs.push({ kind: "md", fullMatch: m[0], url, index: m.index ?? 0 });
  }

  // HTML img src="..."
  const htmlImgRe =
    /<img\b[^>]*?\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^>\s]+))[^>]*?>/gi;
  for (const m of content.matchAll(htmlImgRe)) {
    const raw = m[1] ?? m[2] ?? m[3] ?? "";
    const url = normalizePathish(raw);
    refs.push({ kind: "html", fullMatch: m[0], url, index: m.index ?? 0 });
  }

  // Dedupe by url+index+kind
  const seen = new Set();
  const out = [];
  for (const r of refs) {
    const key = `${r.kind}@@${r.index}@@${r.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

/**
 * Also extract linked-image patterns:
 *   [![alt](img)](link)
 * Often, link == img, and both are local. We want to rewrite both when local.
 */
function extractLinkedImagePairs(content) {
  const pairs = [];
  const re =
    /\[\s*!\[[^\]]*\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+["'][^"']*["'])?\s*\)\s*\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g;
  for (const m of content.matchAll(re)) {
    const img = normalizePathish(m[1] || "");
    const link = normalizePathish(m[2] || "");
    pairs.push({ fullMatch: m[0], img, link, index: m.index ?? 0 });
  }

  const seen = new Set();
  const out = [];
  for (const p of pairs) {
    const key = `${p.index}@@${p.img}@@${p.link}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

function rewriteMarkdownImage(match, oldUrl, newUrl) {
  let out = match;
  if (out.includes(`<${oldUrl}>`))
    out = out.replace(`<${oldUrl}>`, `<${newUrl}>`);
  else out = out.replace(oldUrl, newUrl);
  return out;
}

function rewriteHtmlImgSrc(match, oldUrl, newUrl) {
  return match.replace(oldUrl, newUrl);
}

function rewriteLinkedImage(match, oldImg, newImg, oldLink, newLink) {
  let out = match;
  if (oldImg) {
    if (out.includes(`<${oldImg}>`))
      out = out.replace(`<${oldImg}>`, `<${newImg}>`);
    else out = out.replace(oldImg, newImg);
  }
  if (oldLink) {
    if (out.includes(`<${oldLink}>`))
      out = out.replace(`<${oldLink}>`, `<${newLink}>`);
    else out = out.replace(oldLink, newLink);
  }
  return out;
}

/**
 * Resolve a referenced local path to an on-disk file.
 *
 * For observed imports:
 * - Markdown uses "images/<slug>/<file>" (relative-like but without "./")
 * - Actual file lives at "<root>/BHArchive/images/<slug>/<file>"
 *
 * Also supports:
 * - relative to the post directory (./foo.png or foo.png)
 * - absolute-from-root-like (starting with /) resolved from project root
 */
async function resolveSourceFile({ root, archiveRoot, postDir, refPath }) {
  const raw = normalizePathish(refPath);
  const noQ = removeQueryAndHash(raw);

  // Reject obvious non-file URLs
  if (!isProbablyLocalPath(noQ)) return null;

  // Skip empty/malformed refs like "()" (from ![]())
  if (!noQ || noQ === "()" || noQ === "#") return null;

  // If it already points to assets, treat as already organized.
  // Handles:
  // - "assets/foo.jpg"
  // - "/<slug>/assets/foo.jpg"
  // - ".../<slug>/assets/foo.jpg" (defensive)
  if (
    noQ.startsWith("assets/") ||
    /^\/[^/]+\/assets\//.test(noQ) ||
    noQ.includes(`/${path.basename(postDir)}/assets/`)
  ) {
    return null;
  }

  // 1) Try path relative to postDir (covers ./possum.png)
  const relToPost = path.resolve(postDir, noQ);
  if (await isFile(relToPost)) return relToPost;

  // 2) If it starts with "images/", map to BHArchive/images/...
  if (noQ.startsWith("images/")) {
    const rel = noQ.slice("images/".length);
    const inArchive = path.resolve(archiveRoot, "images", rel);
    if (await isFile(inArchive)) return inArchive;
  }

  // 3) If it contains "/images/", map the tail after that into BHArchive/images/...
  const marker = "/images/";
  const idx = noQ.indexOf(marker);
  if (idx !== -1) {
    const tail = noQ.slice(idx + marker.length);
    const inArchive = path.resolve(archiveRoot, "images", tail);
    if (await isFile(inArchive)) return inArchive;
  }

  // 4) If path starts with "/", treat it as project-root relative file path
  // (This is LAST because "/<slug>/assets/..." is handled above.)
  if (noQ.startsWith("/")) {
    const relToRoot = path.resolve(root, "." + noQ);
    if (await isFile(relToRoot)) return relToRoot;
  }

  return null;
}

/**
 * Convert HEIC to JPEG/PNG using macOS `sips`.
 * Returns the output path (which may be same as target if no conversion happened).
 */
async function convertHeicIfNeeded({
  srcFs,
  dstFs,
  heicFormat,
  dryRun,
  force,
  verbose,
}) {
  const ext = getExtLower(srcFs);
  if (ext !== ".heic") return { converted: false, outputFs: dstFs };

  const outExt = heicFormat === "png" ? ".png" : ".jpg";
  const baseNoExt = dstFs.slice(0, -path.extname(dstFs).length);
  const outFs = baseNoExt + outExt;

  if (!force && (await isFile(outFs))) {
    if (verbose) console.log(`  - exists (converted): ${outFs}`);
    return { converted: true, outputFs: outFs };
  }

  if (dryRun) return { converted: true, outputFs: outFs };

  // Ensure parent dir
  await ensureDir(path.dirname(outFs), dryRun);

  // Use sips
  const fmt = heicFormat === "png" ? "png" : "jpeg";
  if (verbose) console.log(`  - sips convert ${srcFs} -> ${outFs} (${fmt})`);
  await execFileAsync("sips", ["-s", "format", fmt, srcFs, "--out", outFs], {
    maxBuffer: 1024 * 1024 * 10,
  });

  return { converted: true, outputFs: outFs };
}

async function copyFile(src, dst, dryRun, force, verbose) {
  if (!force && (await isFile(dst))) {
    if (verbose) console.log(`  - exists: ${dst}`);
    return { copied: false };
  }
  if (verbose) console.log(`  - copy ${src} -> ${dst}`);
  if (dryRun) return { copied: true };
  await ensureDir(path.dirname(dst), dryRun);
  await fsp.copyFile(src, dst);
  return { copied: true };
}

async function listPostFiles(contentBlogRoot) {
  const out = [];
  const entries = await fsp
    .readdir(contentBlogRoot, { withFileTypes: true })
    .catch(() => []);
  for (const ent of entries) {
    const full = path.join(contentBlogRoot, ent.name);
    if (ent.isDirectory()) {
      const idx = path.join(full, "index.md");
      if (await isFile(idx)) out.push(idx);
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".md")) {
      // legacy single-file posts
      out.push(full);
    }
  }
  return out.sort();
}

function slugFromPostFile(postFile) {
  const dir = path.dirname(postFile);
  const isFolderPost = path.basename(postFile).toLowerCase() === "index.md";
  return isFolderPost ? path.basename(dir) : path.basename(postFile, ".md");
}

function postDirFromPostFile(postFile) {
  return path.dirname(postFile);
}

function guessDestBaseName(srcFs, originalRefPath) {
  // Prefer the original referenced filename to preserve stable URLs across conversions,
  // but sanitize and ensure uniqueness via hash if necessary.
  const orig = removeQueryAndHash(String(originalRefPath || "").trim());
  const baseRef = path.basename(orig);
  const baseSrc = path.basename(srcFs);

  const chosen =
    baseRef && baseRef !== "." && baseRef !== ".." ? baseRef : baseSrc;
  // Basic sanitize (avoid path separators)
  const safe = chosen.replaceAll("/", "_").replaceAll("\\", "_").trim();

  if (!safe) return `image-${sha1Hex(srcFs).slice(0, 10)}`;
  // If basename is enormous, shorten.
  if (safe.length > 140)
    return `image-${sha1Hex(srcFs).slice(0, 12)}${path.extname(safe) || ""}`;
  return safe;
}

async function processOnePost(postFile, opts) {
  const slug = slugFromPostFile(postFile);
  const postDir = postDirFromPostFile(postFile);
  const assetsDirFs = path.join(postDir, opts.assetsDir);

  const original = await fsp.readFile(postFile, "utf8");
  const refs = extractImageRefs(original);
  const linkedPairs = extractLinkedImagePairs(original);

  // Build a set of candidates: local paths referenced either in images or linked-image constructs.
  // We will rewrite based on exact substring replacement to be safe.
  const planned = [];

  // Simple refs
  for (const r of refs) {
    if (!isProbablyLocalPath(r.url)) continue;
    // Skip empty URLs
    if (!r.url || r.url === "" || r.url === "()") continue;
    planned.push({
      kind: r.kind,
      fullMatch: r.fullMatch,
      url: r.url,
      index: r.index,
    });
  }

  // Linked-image pairs (rewrite both img and link if local and point to same file or local file)
  const plannedPairs = [];
  for (const p of linkedPairs) {
    const imgLocal = isProbablyLocalPath(p.img) && p.img.length > 0;
    const linkLocal = isProbablyLocalPath(p.link) && p.link.length > 0;
    if (!imgLocal && !linkLocal) continue;
    plannedPairs.push(p);
  }

  if (!planned.length && !plannedPairs.length) {
    return {
      postFile,
      slug,
      changed: false,
      rewrites: 0,
      copied: 0,
      converted: 0,
      missing: 0,
      skipped: true,
    };
  }

  // Ensure assets dir exists
  await ensureDir(assetsDirFs, opts.dryRun);

  // Map from (post, refPath) -> new URL
  const rewriteMap = new Map(); // key: oldRefPath string => { newUrl, srcFs, outFs, action }
  let missingCount = 0;
  let copiedCount = 0;
  let convertedCount = 0;

  async function ensureAssetForRef(refPath) {
    const key = refPath;
    if (rewriteMap.has(key)) return rewriteMap.get(key);

    const srcFs = await resolveSourceFile({
      root: opts.root,
      archiveRoot: opts.archive,
      postDir,
      refPath,
    });

    if (!srcFs) {
      // If it already points at blog-less assets, treat as OK/no-op (don’t count missing).
      if (
        /^\/[^/]+\/assets\//.test(removeQueryAndHash(normalizePathish(refPath)))
      ) {
        rewriteMap.set(key, {
          ok: false,
          reason: "already_organized",
          old: refPath,
        });
        return rewriteMap.get(key);
      }

      rewriteMap.set(key, { ok: false, reason: "unresolved", old: refPath });
      missingCount++;
      if (opts.verbose) {
        console.log(
          `  - unresolved in ${path.relative(opts.root, postFile)}: ${refPath}`,
        );
      }
      return rewriteMap.get(key);
    }

    const destBase = guessDestBaseName(srcFs, refPath);
    const destFsOriginal = path.join(assetsDirFs, destBase);

    // If HEIC and conversion enabled, we will convert directly to outFs (jpg/png),
    // but still also copy the original HEIC optionally? For now: we do NOT copy the HEIC unless --force-copy-heic is added.
    // We will keep source in BHArchive and produce only the converted output in assets.
    const srcExt = getExtLower(srcFs);

    let outFs = destFsOriginal;
    let didConvert = false;

    if (opts.convert === "heic" && srcExt === ".heic") {
      // Convert using sips into assets directory
      const conv = await convertHeicIfNeeded({
        srcFs,
        dstFs: destFsOriginal,
        heicFormat: opts.heicFormat,
        dryRun: opts.dryRun,
        force: opts.force,
        verbose: opts.verbose,
      });
      didConvert = conv.converted;
      outFs = conv.outputFs;

      if (didConvert) {
        convertedCount++;
      }
    } else {
      // Plain copy
      const res = await copyFile(
        srcFs,
        destFsOriginal,
        opts.dryRun,
        opts.force,
        opts.verbose,
      );
      if (res.copied) copiedCount++;
    }

    const outFileName = path.basename(outFs);
    const newUrl = `/${slug}/${opts.assetsDir}/${outFileName}`;

    const entry = {
      ok: true,
      old: refPath,
      newUrl,
      srcFs,
      outFs,
      converted: didConvert,
      slug,
    };
    rewriteMap.set(key, entry);
    return entry;
  }

  // Generate assets for all unique refs (from refs and pairs)
  // Note: for pairs, include both img and link.
  const uniqueRefPaths = new Set();
  for (const r of planned) uniqueRefPaths.add(r.url);
  for (const p of plannedPairs) {
    if (p.img) uniqueRefPaths.add(p.img);
    if (p.link) uniqueRefPaths.add(p.link);
  }

  for (const refPath of uniqueRefPaths) {
    await ensureAssetForRef(refPath);
  }

  // Now rewrite the markdown content
  let updated = original;
  let rewriteCount = 0;

  // Rewrite linked pairs first (more specific)
  for (const p of plannedPairs) {
    if (!updated.includes(p.fullMatch)) continue;

    const imgEntry = p.img ? rewriteMap.get(p.img) : null;
    const linkEntry = p.link ? rewriteMap.get(p.link) : null;

    const newImg = imgEntry && imgEntry.ok ? imgEntry.newUrl : p.img;
    const newLink = linkEntry && linkEntry.ok ? linkEntry.newUrl : p.link;

    const rewritten = rewriteLinkedImage(
      p.fullMatch,
      p.img,
      newImg,
      p.link,
      newLink,
    );
    if (rewritten !== p.fullMatch) {
      updated = updated.replace(p.fullMatch, rewritten);
      rewriteCount++;
    }
  }

  // Rewrite simple refs
  for (const r of planned) {
    if (!updated.includes(r.fullMatch)) continue;
    const entry = rewriteMap.get(r.url);
    if (!entry || !entry.ok) continue;

    let rewritten = r.fullMatch;
    if (r.kind === "md")
      rewritten = rewriteMarkdownImage(r.fullMatch, r.url, entry.newUrl);
    else rewritten = rewriteHtmlImgSrc(r.fullMatch, r.url, entry.newUrl);

    if (rewritten !== r.fullMatch) {
      updated = updated.replace(r.fullMatch, rewritten);
      rewriteCount++;
    }
  }

  const changed = updated !== original;

  if (changed && !opts.dryRun) {
    await fsp.writeFile(postFile, updated, "utf8");
  }

  return {
    postFile,
    slug,
    changed,
    rewrites: rewriteCount,
    copied: copiedCount,
    converted: convertedCount,
    missing: missingCount,
    skipped: false,
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  if (!(await isDirectory(opts.content))) {
    console.error(`Content blog root not found: ${opts.content}`);
    process.exit(1);
  }

  if (!(await isDirectory(opts.archive))) {
    console.error(`Archive root not found: ${opts.archive}`);
    console.error(`Expected BHArchive at: ${opts.archive}`);
    process.exit(1);
  }

  const postFiles = await listPostFiles(opts.content);
  if (!postFiles.length) {
    console.log("No posts found.");
    process.exit(0);
  }

  console.log(`Content root: ${path.relative(opts.root, opts.content)}`);
  console.log(`Archive root: ${path.relative(opts.root, opts.archive)}`);
  console.log(`Assets dir: ${opts.assetsDir}`);
  console.log(
    `Convert: ${opts.convert}${opts.convert === "heic" ? ` (${opts.heicFormat})` : ""}`,
  );
  console.log(`Dry run: ${opts.dryRun ? "yes" : "no"}`);
  console.log(`Force: ${opts.force ? "yes" : "no"}`);

  if (!opts.yes && !opts.dryRun) {
    const ok = await promptYesNo(
      "Proceed with copying/converting images and rewriting markdown?",
      true,
    );
    if (!ok) {
      console.log("Cancelled.");
      process.exit(0);
    }
  }

  let changedPosts = 0;
  let totalRewrites = 0;
  let totalCopied = 0;
  let totalConverted = 0;
  let totalMissing = 0;
  let skippedPosts = 0;

  const changedList = [];

  for (const postFile of postFiles) {
    const r = await processOnePost(postFile, opts);
    if (r.skipped) {
      skippedPosts++;
      continue;
    }
    if (r.changed) {
      changedPosts++;
      changedList.push({
        postFile: r.postFile,
        rewrites: r.rewrites,
        missing: r.missing,
      });
    }
    totalRewrites += r.rewrites;
    totalCopied += r.copied;
    totalConverted += r.converted;
    totalMissing += r.missing;
  }

  console.log("\nSummary");
  console.log(`- Posts scanned: ${postFiles.length}`);
  console.log(`- Posts skipped (no local image refs found): ${skippedPosts}`);
  console.log(`- Posts changed: ${changedPosts}`);
  console.log(`- Total rewrites: ${totalRewrites}`);
  console.log(`- Files copied: ${totalCopied}`);
  console.log(`- Files converted (HEIC): ${totalConverted}`);
  console.log(`- Missing/unresolved refs: ${totalMissing}`);

  if (changedList.length) {
    console.log("\nChanged posts:");
    for (const item of changedList) {
      console.log(
        `- ${path.relative(opts.root, item.postFile)} (${item.rewrites} rewrites, ${item.missing} missing)`,
      );
    }
  }

  console.log("\nNotes:");
  console.log(
    "- This script rewrites image URLs to blog-less absolute paths: /<slug>/assets/<file>.",
  );
  console.log(
    "- Ensure your build-time mirroring step publishes content/blog/<slug>/assets to /<slug>/assets.",
  );
  console.log(
    "- HEIC conversion uses macOS `sips`. If conversion fails, rerun with --verbose to see details.",
  );
}

main().catch((err) => {
  console.error(err?.stack || err);
  process.exit(1);
});
