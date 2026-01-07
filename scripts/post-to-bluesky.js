#!/usr/bin/env node

/**
 * Post to Bluesky with backdating support
 *
 * Usage:
 *   node scripts/post-to-bluesky.js <post-slug> [options]
 *
 * Options:
 *   --description "text"  Social media description (required)
 *   --dry-run            Show what would be posted without posting
 *
 * Example:
 *   node scripts/post-to-bluesky.js whats-good --description "A translation of Jin Shengtan's '33 Nice Things'"
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { stat } from "fs/promises";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

// Bluesky API configuration
const BLUESKY_SERVICE = "https://bsky.social";
const XRPC_ENDPOINT = `${BLUESKY_SERVICE}/xrpc`;

/**
 * Read Bluesky credentials from _bluesky-credentials file
 */
function readCredentials() {
	const credFile = join(PROJECT_ROOT, "_bluesky-credentials");
	const content = readFileSync(credFile, "utf-8");

	const lines = content.split("\n");
	let username = lines
		.find((l) => l.startsWith("Username:"))
		?.split(":")[1]
		?.trim();
	const password = lines
		.find((l) => l.startsWith("App password:"))
		?.split(":")[1]
		?.trim();

	if (!username || !password) {
		throw new Error(
			"Could not parse credentials from _bluesky-credentials file",
		);
	}

	// Remove @ prefix if present
	if (username.startsWith("@")) {
		username = username.slice(1);
	}

	return { username, password };
}

/**
 * Authenticate with Bluesky and get session token
 */
async function login(username, password) {
	const response = await fetch(
		`${XRPC_ENDPOINT}/com.atproto.server.createSession`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				identifier: username,
				password: password,
			}),
		},
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Login failed: ${response.status} ${error}`);
	}

	const session = await response.json();
	return {
		did: session.did,
		accessJwt: session.accessJwt,
		handle: session.handle,
	};
}

/**
 * Upload an image blob to Bluesky
 */
async function uploadImage(session, imagePath, mimeType = "image/jpeg") {
	// Check file size
	const stats = await stat(imagePath);
	const MAX_SIZE = 1000000; // 1MB limit

	if (stats.size > MAX_SIZE) {
		throw new Error(`Image too large: ${stats.size} bytes (max ${MAX_SIZE})`);
	}

	// Read image file
	const imageData = readFileSync(imagePath);

	const response = await fetch(`${XRPC_ENDPOINT}/com.atproto.repo.uploadBlob`, {
		method: "POST",
		headers: {
			"Content-Type": mimeType,
			Authorization: `Bearer ${session.accessJwt}`,
		},
		body: imageData,
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Image upload failed: ${response.status} ${error}`);
	}

	const result = await response.json();
	return result.blob;
}

/**
 * Create a post on Bluesky
 */
async function createPost(session, postData) {
	const response = await fetch(
		`${XRPC_ENDPOINT}/com.atproto.repo.createRecord`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.accessJwt}`,
			},
			body: JSON.stringify({
				repo: session.did,
				collection: "app.bsky.feed.post",
				record: postData,
			}),
		},
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Post creation failed: ${response.status} ${error}`);
	}

	const result = await response.json();
	return result;
}

/**
 * Get image MIME type from file extension
 */
function getMimeType(filename) {
	const ext = filename.split(".").pop().toLowerCase();
	const types = {
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
		webp: "image/webp",
	};
	return types[ext] || "image/jpeg";
}

/**
 * Read post frontmatter from markdown file
 */
function readPostFrontmatter(slug) {
	const postPath = join(PROJECT_ROOT, "content/blog", slug, "index.md");
	const content = readFileSync(postPath, "utf-8");
	const { data } = matter(content);
	return data;
}

/**
 * Main execution
 */
async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes("--help")) {
		console.log(`
Usage: node scripts/post-to-bluesky.js <post-slug> [options]

Options:
  --description "text"  Social media description (required)
  --dry-run            Show what would be posted without posting
  --help               Show this help message

Example:
  node scripts/post-to-bluesky.js whats-good --description "A translation of Jin Shengtan's '33 Nice Things'"
`);
		process.exit(0);
	}

	const slug = args[0];
	const dryRun = args.includes("--dry-run");

	// Parse description
	const descIndex = args.indexOf("--description");
	if (descIndex === -1 || !args[descIndex + 1]) {
		console.error("Error: --description is required");
		process.exit(1);
	}
	const description = args[descIndex + 1];

	try {
		// Read post frontmatter
		console.log(`Reading post: ${slug}...`);
		const frontmatter = readPostFrontmatter(slug);

		if (!frontmatter.title) {
			throw new Error("Post must have a title");
		}

		if (!frontmatter.date) {
			throw new Error("Post must have a date");
		}

		// Construct post URL
		const postUrl = `https://burninghou.se/${slug}/`;

		// Build post text with title, description, and link
		const postText = `${description}\n\n${postUrl}`;

		// Create post record with backdated timestamp
		const postRecord = {
			$type: "app.bsky.feed.post",
			text: postText,
			createdAt: new Date(frontmatter.date).toISOString(),
		};

		// Handle image if present
		let imageBlob = null;
		let imageAlt = null;

		if (frontmatter.post_image) {
			const imagePath = join(
				PROJECT_ROOT,
				"content/blog",
				slug,
				frontmatter.post_image.replace(`/${slug}/`, ""),
			);
			imageAlt = frontmatter.post_image_alt || "";

			console.log(`Image: ${frontmatter.post_image}`);
			console.log(`Alt text: ${imageAlt}`);

			if (!dryRun) {
				// Authenticate first for upload
				console.log("\nAuthenticating with Bluesky...");
				const credentials = readCredentials();
				const session = await login(credentials.username, credentials.password);
				console.log(`Logged in as @${session.handle}`);

				// Upload image
				console.log("\nUploading image...");
				const mimeType = getMimeType(frontmatter.post_image);
				imageBlob = await uploadImage(session, imagePath, mimeType);
				console.log("Image uploaded successfully");
			}
		}

		// Add image embed if we have an image
		if (imageBlob || (dryRun && frontmatter.post_image)) {
			postRecord.embed = {
				$type: "app.bsky.embed.images",
				images: [
					{
						alt: imageAlt || "",
						image: imageBlob || {
							$type: "blob",
							ref: { $link: "mock" },
							mimeType: "image/jpeg",
							size: 0,
						},
					},
				],
			};
		}

		// Display what will be posted
		console.log("\n" + "=".repeat(60));
		console.log("POST PREVIEW");
		console.log("=".repeat(60));
		console.log(`Title: ${frontmatter.title}`);
		console.log(`Date: ${frontmatter.date} (backdated)`);
		console.log(`URL: ${postUrl}`);
		console.log("\nPost text:");
		console.log(postText);
		console.log("\n" + "=".repeat(60));

		if (dryRun) {
			console.log("\n[DRY RUN] Post not created");
			return;
		}

		// Create the post
		console.log("\nCreating post...");
		const credentials = readCredentials();
		const session = await login(credentials.username, credentials.password);

		const result = await createPost(session, postRecord);

		// Construct Bluesky URL
		const postId = result.uri.split("/").pop();
		const blueskyUrl = `https://bsky.app/profile/${session.handle}/post/${postId}`;

		console.log("\n✓ Post created successfully!");
		console.log(`\nBluesky URL: ${blueskyUrl}`);
		console.log(`\nAdd this to your post frontmatter:`);
		console.log(`bluesky_thread: "${blueskyUrl}"`);
	} catch (error) {
		console.error("\n✗ Error:", error.message);
		process.exit(1);
	}
}

main();
