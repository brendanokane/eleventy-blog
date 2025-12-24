#!/usr/bin/env node
/**
 * Localize remote images (e.g. Substack CDN) into per-post asset folders and rewrite references.
 *
 * Goals:
 * - For each post at `content/blog/<slug>/index.md` (and also supports legacy `content/blog/*.md`):
 *   - Find remote image URLs in Markdown images and HTML <img src="..."> tags
 * - Download them into `content/blog/<slug>/assets/`
 * - Rewrite the content to use a local, site-rooted path like `/<slug>/assets/<file>`
 *
 * Notes / Assumptions:
 * - This is a pragmatic "best effort" migration tool. It will not perfectly parse every HTML edge case.
 * - It avoids rewriting non-image remote URLs.
 * - It tries to be idempotent: re-running should not re-download existing files (unless --redownload).
 *
 * Usage:
 *   node _config/localize-substack-images.mjs --dry-run
 *   node _config/localize-substack-images.mjs
 *
 * Options:
 *   --root <path>            Project root (defaults to process.cwd()).
 *   --content <path>         Content root (defaults to "<root>/content/blog").
 *   --assets-dir <name>      Assets directory name inside each post folder (default: "assets").
 *   --match <pattern>        Repeatable. Substring or regex-like /.../ flags to match image URLs (default: substackcdn).
 *   --include-remote         Also localize ALL remote images (not just matching patterns).
 *   --dry-run                No files are written and nothing is downloaded; prints planned changes.
 *   --redownload             Download again even if file exists.
 *   --concurrency <n>        Parallel downloads (default: 6).
 *   --timeout-ms <n>         Fetch timeout per request (default: 20000).
 *   --user-agent <ua>        User-Agent header for requests.
 *   --verbose                Extra logging.
 *   --yes                    Don’t prompt (non-interactive).
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import process from "node:process";
import readline from "node:readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_MATCHERS = ["substackcdn"];

function parseArgs(argv) {
	/** @type {Record<string, any>} */
	const out = {
		root: process.cwd(),
		content: null,
		assetsDir: "assets",
		matchers: [...DEFAULT_MATCHERS],
		includeRemote: false,
		dryRun: false,
		redownload: false,
		concurrency: 6,
		timeoutMs: 20_000,
		userAgent:
			"burninghou.se localize-substack-images/1.0 (+https://burninghou.se)",
		verbose: false,
		yes: false,
	};

	const args = [...argv];
	while (args.length) {
		const a = args.shift();
		if (!a) break;

		if (a === "--root") out.root = String(args.shift() ?? out.root);
		else if (a === "--content") out.content = String(args.shift() ?? "");
		else if (a === "--assets-dir")
			out.assetsDir = String(args.shift() ?? "assets");
		else if (a === "--match") out.matchers.push(String(args.shift() ?? ""));
		else if (a === "--include-remote") out.includeRemote = true;
		else if (a === "--dry-run") out.dryRun = true;
		else if (a === "--redownload") out.redownload = true;
		else if (a === "--concurrency")
			out.concurrency = Number(args.shift() ?? out.concurrency);
		else if (a === "--timeout-ms")
			out.timeoutMs = Number(args.shift() ?? out.timeoutMs);
		else if (a === "--user-agent")
			out.userAgent = String(args.shift() ?? out.userAgent);
		else if (a === "--verbose") out.verbose = true;
		else if (a === "--yes") out.yes = true;
		else if (a === "-h" || a === "--help") out.help = true;
		else {
			// ignore unknown flags, but store for debugging
			(out._unknown ??= []).push(a);
		}
	}

	out.content = out.content
		? path.resolve(out.root, out.content)
		: path.resolve(out.root, "content", "blog");

	// Filter empty matchers
	out.matchers = out.matchers.filter(Boolean);

	return out;
}

function printHelp() {
	const txt = `
localize-substack-images.mjs

Localize remote images into per-post asset folders and rewrite references.

Usage:
  node _config/localize-substack-images.mjs [options]

Options:
  --root <path>            Project root (default: cwd)
  --content <path>         Content directory (default: <root>/content/blog)
  --assets-dir <name>      Per-post assets dir name (default: assets)
  --match <pattern>        Repeatable matcher (substring or /regex/flags). Default: substackcdn
  --include-remote         Localize ALL remote images (not just matches)
  --dry-run                Do not download or write files
  --redownload             Download even if file exists
  --concurrency <n>        Parallel downloads (default: 6)
  --timeout-ms <n>         Fetch timeout per request (default: 20000)
  --user-agent <ua>        User-Agent header
  --verbose                Extra logging
  --yes                    Non-interactive mode (assume yes)
`.trim();
	console.log(txt);
}

function isHttpUrl(u) {
	return typeof u === "string" && /^https?:\/\//i.test(u);
}

function tryParseRegexLike(s) {
	// Allow /pattern/flags
	if (typeof s !== "string") return null;
	if (s.length < 2) return null;
	if (s[0] !== "/") return null;
	const lastSlash = s.lastIndexOf("/");
	if (lastSlash <= 0) return null;
	const body = s.slice(1, lastSlash);
	const flags = s.slice(lastSlash + 1);
	try {
		return new RegExp(body, flags || undefined);
	} catch {
		return null;
	}
}

function shouldLocalizeUrl(url, matchers, includeRemote) {
	if (!isHttpUrl(url)) return false;
	if (includeRemote) return true;

	for (const m of matchers) {
		const rx = tryParseRegexLike(m);
		if (rx) {
			if (rx.test(url)) return true;
		} else {
			if (url.includes(m)) return true;
		}
	}
	return false;
}

function decodeHtmlEntitiesMinimal(s) {
	// Minimal decoding needed for common cases inside attributes.
	return s
		.replaceAll("&amp;", "&")
		.replaceAll("&quot;", '"')
		.replaceAll("&#39;", "'")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">");
}

function safeSlugFromPostDir(postDir) {
	return path.basename(postDir);
}

function sha1Hex(input) {
	return crypto.createHash("sha1").update(input).digest("hex");
}

function sanitizeFilename(name) {
	// Keep fairly permissive but avoid path separators and control chars.
	// Also avoid Windows reserved characters.
	return name
		.replaceAll("\\", "_")
		.replaceAll("/", "_")
		.replaceAll(":", "_")
		.replaceAll("*", "_")
		.replaceAll("?", "_")
		.replaceAll('"', "_")
		.replaceAll("<", "_")
		.replaceAll(">", "_")
		.replaceAll("|", "_")
		.replace(/\s+/g, " ")
		.trim();
}

function extFromContentType(contentType) {
	if (!contentType) return null;
	const ct = contentType.split(";")[0].trim().toLowerCase();
	if (ct === "image/jpeg") return ".jpg";
	if (ct === "image/jpg") return ".jpg";
	if (ct === "image/png") return ".png";
	if (ct === "image/webp") return ".webp";
	if (ct === "image/avif") return ".avif";
	if (ct === "image/gif") return ".gif";
	if (ct === "image/svg+xml") return ".svg";
	return null;
}

function extFromUrl(url) {
	try {
		const u = new URL(url);
		const p = u.pathname;
		const ext = path.extname(p);
		if (!ext) return null;
		// basic sanity
		if (ext.length > 6) return null;
		return ext.toLowerCase();
	} catch {
		return null;
	}
}

function guessBaseNameFromUrl(url) {
	try {
		const u = new URL(url);
		const base = path.basename(u.pathname);
		if (!base || base === "/" || base === "." || base === "..") return null;
		return base;
	} catch {
		return null;
	}
}

function makeLocalAssetTarget({ postDir, assetsDirName, url, contentType }) {
	const assetsDirFs = path.join(postDir, assetsDirName);

	// Prefer the URL's last path segment if it looks reasonable.
	const rawBase = guessBaseNameFromUrl(url);
	const cleanedBase = rawBase ? sanitizeFilename(rawBase) : null;

	// Compute extension (prefer URL ext, otherwise from content-type).
	const extUrl = extFromUrl(url);
	const extCT = extFromContentType(contentType);
	const ext = extUrl || extCT || ".bin";

	// If the base has no extension, add one.
	let baseNoQuery = cleanedBase || `image-${sha1Hex(url).slice(0, 10)}${ext}`;
	if (cleanedBase) {
		const hasExt = Boolean(path.extname(cleanedBase));
		if (!hasExt) baseNoQuery = `${cleanedBase}${ext}`;
	} else {
		baseNoQuery = `image-${sha1Hex(url).slice(0, 10)}${ext}`;
	}

	// Avoid super long filenames.
	if (baseNoQuery.length > 120) {
		const shortHash = sha1Hex(url).slice(0, 12);
		baseNoQuery = `image-${shortHash}${ext}`;
	}

	const targetFs = path.join(assetsDirFs, baseNoQuery);
	return { assetsDirFs, targetFs, fileName: baseNoQuery };
}

async function listMarkdownPostFiles(contentRoot) {
	// Supports:
	// - `content/blog/<slug>/index.md` (preferred)
	// - legacy: `content/blog/*.md`
	/** @type {string[]} */
	const out = [];

	const entries = await fsp
		.readdir(contentRoot, { withFileTypes: true })
		.catch(() => []);
	for (const ent of entries) {
		const full = path.join(contentRoot, ent.name);
		if (ent.isDirectory()) {
			const indexMd = path.join(full, "index.md");
			try {
				const st = await fsp.stat(indexMd);
				if (st.isFile()) out.push(indexMd);
			} catch {
				// ignore
			}
		} else if (ent.isFile() && ent.name.toLowerCase().endsWith(".md")) {
			out.push(full);
		}
	}

	return out.sort();
}

/**
 * Extract remote image URLs from Markdown and HTML.
 *
 * Returns array of objects with:
 * - url
 * - type: "md" | "html"
 * - match: the exact matched substring (for later targeted rewrite)
 * - index: start index in content
 */
function extractImageRefs(content) {
	/** @type {{url: string, type: "md"|"html", match: string, index: number}[]} */
	const refs = [];

	// Markdown images: ![alt](URL "title")
	// Keep it conservative: match URL until whitespace or ')', allowing angle brackets.
	const mdRe = /!\[[^\]]*\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g;
	for (const m of content.matchAll(mdRe)) {
		const raw = m[1] || "";
		const url =
			raw.startsWith("<") && raw.endsWith(">") ? raw.slice(1, -1) : raw;
		refs.push({ url, type: "md", match: m[0], index: m.index ?? 0 });
	}

	// HTML img src: <img ... src="URL" ...>
	// Note: not a full HTML parser; good enough for typical Substack exports.
	const htmlRe =
		/<img\b[^>]*?\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^>\s]+))[^>]*?>/gi;
	for (const m of content.matchAll(htmlRe)) {
		const raw = m[1] ?? m[2] ?? m[3] ?? "";
		const url = decodeHtmlEntitiesMinimal(raw);
		refs.push({ url, type: "html", match: m[0], index: m.index ?? 0 });
	}

	// Dedupe by URL+match start (so we can rewrite precisely even if same URL appears multiple times)
	const seen = new Set();
	const deduped = [];
	for (const r of refs) {
		const key = `${r.url}@@${r.index}@@${r.type}`;
		if (seen.has(key)) continue;
		seen.add(key);
		deduped.push(r);
	}
	return deduped;
}

function rewriteMarkdownImage(match, oldUrl, newUrl) {
	// Replace only within this matched substring.
	// Handles both <url> and url forms.
	let out = match;

	// Escape for literal replace. We avoid regex to preserve weird chars.
	// Prefer replacing exact URL, but also handle <URL>.
	if (out.includes(`<${oldUrl}>`))
		out = out.replace(`<${oldUrl}>`, `<${newUrl}>`);
	else out = out.replace(oldUrl, newUrl);

	return out;
}

function rewriteHtmlImgSrc(match, oldUrl, newUrl) {
	// Replace src attribute value within <img ...>.
	// Conservative: replace the first occurrence of oldUrl.
	return match.replace(oldUrl, newUrl);
}

async function ensureDir(dir, dryRun) {
	if (dryRun) return;
	await fsp.mkdir(dir, { recursive: true });
}

async function fileExists(p) {
	try {
		const st = await fsp.stat(p);
		return st.isFile();
	} catch {
		return false;
	}
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

async function fetchWithTimeout(url, { timeoutMs, headers }) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			headers,
			signal: ctrl.signal,
			redirect: "follow",
		});
		return res;
	} finally {
		clearTimeout(timer);
	}
}

function isImageContentType(contentType) {
	if (!contentType) return false;
	return contentType.toLowerCase().startsWith("image/");
}

async function downloadImage(
	url,
	targetFs,
	{ timeoutMs, userAgent, dryRun, redownload, verbose },
) {
	if (!redownload) {
		const exists = await fileExists(targetFs);
		if (exists) {
			if (verbose) console.log(`  - exists: ${targetFs}`);
			return { status: "skipped_exists", contentType: null, bytes: 0 };
		}
	}

	if (dryRun) return { status: "dry_run", contentType: null, bytes: 0 };

	const headers = {
		"User-Agent": userAgent,
		Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
	};

	const res = await fetchWithTimeout(url, { timeoutMs, headers });

	if (!res.ok) {
		return {
			status: `http_${res.status}`,
			contentType: res.headers.get("content-type"),
			bytes: 0,
		};
	}

	const contentType = res.headers.get("content-type");
	if (contentType && !isImageContentType(contentType)) {
		// Some CDNs might return HTML (blocked) — avoid saving garbage.
		const text = await res.text().catch(() => "");
		return { status: "not_image", contentType, bytes: text.length };
	}

	const buf = Buffer.from(await res.arrayBuffer());
	await fsp.writeFile(targetFs, buf);
	return { status: "downloaded", contentType, bytes: buf.length };
}

/**
 * Very small concurrency limiter.
 * @template T
 * @param {number} concurrency
 * @param {(() => Promise<T>)[]} tasks
 */
async function runConcurrent(concurrency, tasks) {
	const results = [];
	let i = 0;
	const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
		while (true) {
			const idx = i++;
			if (idx >= tasks.length) break;
			results[idx] = await tasks[idx]();
		}
	});
	await Promise.all(workers);
	return results;
}

async function processPostFile(postFile, opts) {
	const content = await fsp.readFile(postFile, "utf8");
	const refs = extractImageRefs(content);

	const postDir = path.dirname(postFile);
	const isFolderPost = path.basename(postFile).toLowerCase() === "index.md";
	const slug = isFolderPost
		? safeSlugFromPostDir(postDir)
		: path.basename(postFile, ".md");

	/** @type {{oldUrl: string, newUrl: string, type: "md"|"html", match: string}[]} */
	const plannedRewrites = [];

	// Decide which URLs to localize
	const candidates = refs.filter((r) =>
		shouldLocalizeUrl(r.url, opts.matchers, opts.includeRemote),
	);

	if (!candidates.length) {
		return {
			postFile,
			slug,
			changed: false,
			downloads: [],
			plannedRewrites,
			skipped: true,
		};
	}

	if (opts.verbose) {
		console.log(`\nPost: ${path.relative(opts.root, postFile)}`);
		console.log(`  slug: ${slug}`);
		console.log(`  refs: ${refs.length}, candidates: ${candidates.length}`);
	}

	// For each candidate URL, decide target filename. We first HEAD/GET to get content-type? We can GET directly.
	// But we want to decide filename (ext) *before* download. We'll:
	// - use URL ext if present; otherwise download to temp name and rename if needed.
	// To keep it simple and robust, we will:
	// - compute target based on URL ext; if none, default .bin for now
	// - after download, if content-type suggests a better ext and filename currently ends with .bin, rename.
	/** @type {{url: string, type: "md"|"html", match: string, targetFs: string, assetsDirFs: string, fileName: string}[]} */
	const downloadsPlan = candidates.map((c) => {
		const { assetsDirFs, targetFs, fileName } = makeLocalAssetTarget({
			postDir,
			assetsDirName: opts.assetsDir,
			url: c.url,
			contentType: null,
		});

		// Output URL should be rooted to the web path. Given this project’s Eleventy input dir is `content`,
		// a file at `content/blog/<slug>/assets/x.jpg` will generally be served at `/blog/<slug>/assets/x.jpg`
		// if it is copied/passthrough or otherwise included. You may be doing passthrough of content assets already.
		// If not, you’ll need to add passthrough copy for these assets.
		const webPath = isFolderPost
			? `/${slug}/${opts.assetsDir}/${fileName}`
			: `/${opts.assetsDir}/${fileName}`; // legacy single-file posts are ambiguous; best-effort

		plannedRewrites.push({
			oldUrl: c.url,
			newUrl: webPath,
			type: c.type,
			match: c.match,
		});

		return {
			url: c.url,
			type: c.type,
			match: c.match,
			targetFs,
			assetsDirFs,
			fileName,
		};
	});

	// Ensure assets directory exists
	const assetsDirFs = downloadsPlan[0]?.assetsDirFs;
	if (assetsDirFs) await ensureDir(assetsDirFs, opts.dryRun);

	// Download all (dedupe by targetFs or url)
	const uniqueByTarget = new Map();
	for (const d of downloadsPlan) {
		uniqueByTarget.set(d.targetFs, d);
	}
	const uniqueDownloads = [...uniqueByTarget.values()];

	const downloadTasks = uniqueDownloads.map((d) => async () => {
		if (opts.verbose)
			console.log(
				`  - download: ${d.url} -> ${path.relative(opts.root, d.targetFs)}`,
			);
		const res = await downloadImage(d.url, d.targetFs, opts);

		// If we used .bin and content-type indicates a better ext, rename.
		let finalTargetFs = d.targetFs;
		const currentExt = path.extname(d.targetFs).toLowerCase();
		if (currentExt === ".bin") {
			const ext = extFromContentType(res.contentType);
			if (ext) {
				const renamed = d.targetFs.slice(0, -currentExt.length) + ext;
				if (!opts.dryRun) {
					// Only rename if the downloaded file exists and the new target doesn't already exist
					const existsOld = await fileExists(d.targetFs);
					const existsNew = await fileExists(renamed);
					if (existsOld && !existsNew) {
						await fsp.rename(d.targetFs, renamed);
						finalTargetFs = renamed;
					} else if (existsNew) {
						// If renamed already exists, remove .bin duplicate
						if (existsOld) await fsp.unlink(d.targetFs);
						finalTargetFs = renamed;
					}
				} else {
					finalTargetFs = renamed;
				}
			}
		}

		return { ...d, result: res, finalTargetFs };
	});

	const downloads = await runConcurrent(opts.concurrency, downloadTasks);

	// If any files were renamed, fix plannedRewrites to match new filenames
	// by mapping original targetFs to finalTargetFs.
	const renameMap = new Map();
	for (const d of downloads) {
		if (d.finalTargetFs && d.finalTargetFs !== d.targetFs) {
			renameMap.set(d.targetFs, d.finalTargetFs);
		}
	}

	if (renameMap.size) {
		for (const pr of plannedRewrites) {
			// Find a download that corresponds to this rewrite by URL and precomputed fileName; easiest is to match on old URL.
			const original = downloadsPlan.find((x) => x.url === pr.oldUrl);
			if (!original) continue;
			const finalFs = renameMap.get(original.targetFs);
			if (!finalFs) continue;

			const finalName = path.basename(finalFs);
			// Update newUrl to use final file name.
			// Keep the same base path, replace last segment.
			const parts = pr.newUrl.split("/");
			parts[parts.length - 1] = finalName;
			pr.newUrl = parts.join("/");
		}
	}

	// Rewrite content by replacing each match's URL with new URL.
	// We do it by constructing a new string and replacing match substrings.
	// Since matches may repeat, we rewrite by walking plannedRewrites and using exact match replacement.
	let newContent = content;
	let rewriteCount = 0;

	for (const pr of plannedRewrites) {
		if (!newContent.includes(pr.match)) {
			// The exact match substring is not present (maybe content changed earlier); fall back to replacing the URL itself.
			if (opts.verbose)
				console.log(
					`  - warning: match substring not found; fallback replace for ${pr.oldUrl}`,
				);
			if (newContent.includes(pr.oldUrl)) {
				newContent = newContent.replaceAll(pr.oldUrl, pr.newUrl);
				rewriteCount++;
			}
			continue;
		}

		let rewrittenMatch = pr.match;
		if (pr.type === "md")
			rewrittenMatch = rewriteMarkdownImage(pr.match, pr.oldUrl, pr.newUrl);
		else rewrittenMatch = rewriteHtmlImgSrc(pr.match, pr.oldUrl, pr.newUrl);

		if (rewrittenMatch !== pr.match) {
			// Replace only the first occurrence of this match to preserve distinct instances.
			newContent = newContent.replace(pr.match, rewrittenMatch);
			rewriteCount++;
		}
	}

	const changed = newContent !== content;

	// Write back post file
	if (changed && !opts.dryRun) {
		await fsp.writeFile(postFile, newContent, "utf8");
	}

	return {
		postFile,
		slug,
		changed,
		rewriteCount,
		downloads,
		plannedRewrites,
		skipped: false,
	};
}

async function main() {
	const opts = parseArgs(process.argv.slice(2));
	if (opts.help) {
		printHelp();
		process.exit(0);
	}

	// Basic validation
	if (!Number.isFinite(opts.concurrency) || opts.concurrency < 1)
		opts.concurrency = 1;
	if (!Number.isFinite(opts.timeoutMs) || opts.timeoutMs < 1000)
		opts.timeoutMs = 1000;

	const contentRoot = path.resolve(opts.content);

	const exists = fs.existsSync(contentRoot);
	if (!exists) {
		console.error(`Content directory not found: ${contentRoot}`);
		process.exit(1);
	}

	console.log(`Content root: ${path.relative(opts.root, contentRoot)}`);
	console.log(`Assets dir name: ${opts.assetsDir}`);
	console.log(
		`Matchers: ${opts.matchers.join(", ")}${opts.includeRemote ? " (plus ALL remote images)" : ""}`,
	);
	console.log(`Dry run: ${opts.dryRun ? "yes" : "no"}`);
	console.log(`Redownload: ${opts.redownload ? "yes" : "no"}`);
	console.log(`Concurrency: ${opts.concurrency}`);

	if (!opts.yes && !opts.dryRun) {
		const ok = await promptYesNo(
			"Proceed with downloading and rewriting files?",
			true,
		);
		if (!ok) {
			console.log("Cancelled.");
			process.exit(0);
		}
	}

	const postFiles = await listMarkdownPostFiles(contentRoot);
	if (!postFiles.length) {
		console.log("No Markdown posts found.");
		process.exit(0);
	}

	/** @type {ReturnType<typeof processPostFile> extends Promise<infer T> ? T : never[]} */
	const results = [];
	for (const postFile of postFiles) {
		const r = await processPostFile(postFile, opts);
		results.push(r);
	}

	const changedPosts = results.filter((r) => r.changed);
	const skippedPosts = results.filter((r) => r.skipped);
	const totalDownloads = results.reduce(
		(sum, r) => sum + (r.downloads?.length || 0),
		0,
	);

	console.log("\nSummary");
	console.log(`- Posts scanned: ${results.length}`);
	console.log(`- Posts changed: ${changedPosts.length}`);
	console.log(`- Posts with no matching remote images: ${skippedPosts.length}`);
	console.log(`- Download operations planned/executed: ${totalDownloads}`);

	// Print a brief report of changed posts
	if (changedPosts.length) {
		console.log("\nChanged posts:");
		for (const r of changedPosts) {
			console.log(
				`- ${path.relative(opts.root, r.postFile)} (${r.rewriteCount ?? 0} rewrites)`,
			);
		}
	}

	// Warnings about assets passthrough:
	console.log("\nReminder:");
	console.log(
		"- Ensure Eleventy copies `content/blog/**/assets/**` to the output (passthrough copy or another mechanism).",
	);
	console.log(
		"- Note: rewritten URLs are `/<slug>/assets/<file>`. If you previously used `/blog/<slug>/assets/<file>`, update any links accordingly.",
	);
	console.log(
		"- If you rely on @11ty/eleventy-img transform plugin, local images referenced via HTML <img> should be transformed more reliably.",
	);
}

main().catch((err) => {
	console.error(err?.stack || err);
	process.exit(1);
});
