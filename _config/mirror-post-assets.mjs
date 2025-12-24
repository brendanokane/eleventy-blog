#!/usr/bin/env node
/**
 * Build-time asset mirroring for blog-less public asset URLs.
 *
 * Problem:
 * - Source of truth assets live alongside posts:
 *     content/blog/<slug>/assets/…
 * - But the site uses blog-less post URLs:
 *     /<slug>/
 * - Eleventy passthrough copy preserves directory structure under dir.input ("content"),
 *   so those assets would otherwise publish at:
 *     /blog/<slug>/assets/…
 *
 * Solution:
 * - During build (not committed), mirror assets to:
 *     content/<slug>/assets/…
 *   so the published URL becomes:
 *     /<slug>/assets/…
 *
 * Intended usage:
 *   node _config/mirror-post-assets.mjs --clean
 *
 * Flags:
 *   --root <path>        Project root (default: process.cwd())
 *   --input <path>       Eleventy input dir (default: "<root>/content")
 *   --blog-dir <name>    Blog directory under input (default: "blog")
 *   --assets-dir <name>  Assets directory name (default: "assets")
 *   --clean              Remove previously-mirrored directories under content/<slug>/assets before copying.
 *   --dry-run            Print operations only.
 *   --verbose            Extra logging.
 *
 * Notes:
 * - This script mirrors ONLY directories that exist at content/blog/<slug>/assets/.
 * - It does not attempt to detect “ownership” of content/<slug>/assets beyond the heuristic
 *   that it is a directory directly under content/<slug>/assets (matching a post slug).
 * - It is safe to run repeatedly; it will overwrite destination files by default.
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
	const out = {
		root: process.cwd(),
		input: null,
		blogDir: "blog",
		assetsDir: "assets",
		clean: false,
		dryRun: false,
		verbose: false,
		help: false,
	};

	const args = [...argv];
	while (args.length) {
		const a = args.shift();
		if (!a) break;

		if (a === "--root") out.root = String(args.shift() ?? out.root);
		else if (a === "--input") out.input = String(args.shift() ?? "");
		else if (a === "--blog-dir")
			out.blogDir = String(args.shift() ?? out.blogDir);
		else if (a === "--assets-dir")
			out.assetsDir = String(args.shift() ?? out.assetsDir);
		else if (a === "--clean") out.clean = true;
		else if (a === "--dry-run") out.dryRun = true;
		else if (a === "--verbose") out.verbose = true;
		else if (a === "--help" || a === "-h") out.help = true;
	}

	out.input = out.input
		? path.resolve(out.root, out.input)
		: path.resolve(out.root, "content");

	return out;
}

function printHelp() {
	console.log(
		`
mirror-post-assets.mjs

Mirrors per-post assets from:
  content/blog/<slug>/assets/**/*
to:
  content/<slug>/assets/**/*
so assets can be referenced with blog-less URLs:
  /<slug>/assets/**/*
while keeping assets alongside the post source.

Usage:
  node _config/mirror-post-assets.mjs [--clean] [--dry-run] [--verbose]

Options:
  --root <path>        Project root (default: cwd)
  --input <path>       Eleventy input dir (default: <root>/content)
  --blog-dir <name>    Blog dir under input (default: blog)
  --assets-dir <name>  Assets dir name (default: assets)
  --clean              Remove existing mirrored <slug>/assets dirs before copying
  --dry-run            Print planned operations without modifying files
  --verbose            Extra logging
`.trim(),
	);
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

async function ensureDir(p, dryRun) {
	if (dryRun) return;
	await fsp.mkdir(p, { recursive: true });
}

async function removeDir(p, dryRun, verbose) {
	if (!(await pathExists(p))) return;
	if (verbose) console.log(`rm -rf ${p}`);
	if (dryRun) return;
	await fsp.rm(p, { recursive: true, force: true });
}

async function copyFile(src, dst, dryRun, verbose) {
	if (verbose) console.log(`cp ${src} -> ${dst}`);
	if (dryRun) return;
	await ensureDir(path.dirname(dst), dryRun);
	await fsp.copyFile(src, dst);
}

async function copyDirRecursive(srcDir, dstDir, dryRun, verbose) {
	// Node 18+ has fsp.cp, but implement manually for compatibility + explicitness.
	await ensureDir(dstDir, dryRun);

	const entries = await fsp.readdir(srcDir, { withFileTypes: true });
	for (const ent of entries) {
		const src = path.join(srcDir, ent.name);
		const dst = path.join(dstDir, ent.name);

		if (ent.isDirectory()) {
			await copyDirRecursive(src, dst, dryRun, verbose);
		} else if (ent.isFile()) {
			await copyFile(src, dst, dryRun, verbose);
		} else if (ent.isSymbolicLink()) {
			// Skip symlinks (avoid surprises in build output).
			if (verbose) console.log(`skip symlink ${src}`);
		} else {
			// Skip other types (sockets, etc.)
			if (verbose) console.log(`skip non-file ${src}`);
		}
	}
}

async function listPostSlugsWithAssets(blogRoot, assetsDirName) {
	/** @type {string[]} */
	const slugs = [];

	const entries = await fsp
		.readdir(blogRoot, { withFileTypes: true })
		.catch(() => []);
	for (const ent of entries) {
		if (!ent.isDirectory()) continue;
		const slug = ent.name;

		// Only consider folder-per-post structure with an assets folder.
		const assetsPath = path.join(blogRoot, slug, assetsDirName);
		if (await isDirectory(assetsPath)) {
			slugs.push(slug);
		}
	}

	return slugs.sort();
}

async function main() {
	const opts = parseArgs(process.argv.slice(2));
	if (opts.help) {
		printHelp();
		process.exit(0);
	}

	const blogRoot = path.join(opts.input, opts.blogDir);
	if (!(await isDirectory(blogRoot))) {
		console.error(`Blog directory not found: ${blogRoot}`);
		process.exit(1);
	}

	const slugs = await listPostSlugsWithAssets(blogRoot, opts.assetsDir);

	console.log(`Blog root: ${blogRoot}`);
	console.log(`Mirroring assets for ${slugs.length} post(s).`);
	console.log(
		`Mode: ${opts.dryRun ? "dry-run" : "write"}${opts.clean ? " + clean" : ""}`,
	);

	let mirroredCount = 0;

	for (const slug of slugs) {
		const srcAssets = path.join(blogRoot, slug, opts.assetsDir);
		const dstAssets = path.join(opts.input, slug, opts.assetsDir);

		if (opts.clean) {
			// Remove previously mirrored directory to avoid stale files (renames/deletions).
			await removeDir(dstAssets, opts.dryRun, opts.verbose);
		}

		if (opts.verbose) {
			console.log(`\n[${slug}]`);
			console.log(`  src: ${srcAssets}`);
			console.log(`  dst: ${dstAssets}`);
		}

		await copyDirRecursive(srcAssets, dstAssets, opts.dryRun, opts.verbose);
		mirroredCount++;
	}

	console.log(`\nDone. Mirrored assets for ${mirroredCount} post(s).`);
	console.log(
		`Reminder: add "${path.relative(opts.root, opts.input)}/*/${opts.assetsDir}/" to .gitignore (generated during build only).`,
	);
}

main().catch((err) => {
	console.error(err?.stack || err);
	process.exit(1);
});
