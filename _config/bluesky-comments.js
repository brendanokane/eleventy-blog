/**
 * Bluesky Comments Integration
 *
 * Fetches replies to a Bluesky post to use as comments on blog posts.
 * Uses the public Bluesky API (no authentication required for public posts).
 *
 * Usage in templates:
 *   {% set comments = bluesky_thread | getBlueskyComments %}
 *   {% for comment in comments %}
 *     {{ comment.text }}
 *   {% endfor %}
 */

const BLUESKY_API = 'https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple in-memory cache
const cache = new Map();

/**
 * Extract post URI from various Bluesky URL formats
 *
 * @param {string} url - Bluesky post URL
 * @returns {string|null} - AT Protocol URI or null
 */
function extractPostUri(url) {
	if (!url) return null;

	// Handle AT Protocol URIs directly
	if (url.startsWith('at://')) {
		return url;
	}

	// Parse bsky.app URLs
	// Format: https://bsky.app/profile/handle.bsky.social/post/abc123xyz
	const match = url.match(/bsky\.app\/profile\/([^\/]+)\/post\/([^\/\?#]+)/);
	if (!match) return null;

	const [, handle, postId] = match;

	// Convert to AT Protocol URI format
	// We need to resolve the handle to a DID, but for now we'll use the handle
	// The API accepts both DIDs and handles
	return `at://${handle}/app.bsky.feed.post/${postId}`;
}

/**
 * Fetch post thread from Bluesky
 *
 * @param {string} uri - AT Protocol URI or bsky.app URL
 * @param {object} options - Fetch options
 * @returns {Promise<object|null>} - Thread data or null on error
 */
async function fetchThread(uri, options = {}) {
	const { depth = 10, useCache = true } = options;

	// Check cache
	if (useCache && cache.has(uri)) {
		const cached = cache.get(uri);
		if (Date.now() - cached.timestamp < CACHE_DURATION) {
			return cached.data;
		}
		cache.delete(uri);
	}

	try {
		const params = new URLSearchParams({
			uri,
			depth: depth.toString(),
		});

		const response = await fetch(`${BLUESKY_API}?${params}`);

		if (!response.ok) {
			console.warn(`Bluesky API error: ${response.status} ${response.statusText}`);
			return null;
		}

		const data = await response.json();

		// Cache the result
		if (useCache) {
			cache.set(uri, {
				data,
				timestamp: Date.now(),
			});
		}

		return data;
	} catch (error) {
		console.warn(`Failed to fetch Bluesky thread: ${error.message}`);
		return null;
	}
}

/**
 * Parse thread into flat list of comments
 *
 * @param {object} thread - Thread data from Bluesky API
 * @returns {Array} - Array of comment objects
 */
function parseComments(thread) {
	if (!thread?.thread?.replies) return [];

	const comments = [];

	function traverse(reply, depth = 0) {
		if (!reply?.post) return;

		const post = reply.post;

		// Extract comment data
		const comment = {
			id: post.cid,
			uri: post.uri,
			author: {
				handle: post.author.handle,
				displayName: post.author.displayName || post.author.handle,
				avatar: post.author.avatar,
				did: post.author.did,
			},
			text: post.record?.text || '',
			createdAt: post.record?.createdAt,
			// Human-readable timestamp
			timestamp: new Date(post.record?.createdAt).toISOString(),
			// Like/repost counts
			likeCount: post.likeCount || 0,
			replyCount: post.replyCount || 0,
			repostCount: post.repostCount || 0,
			// Thread depth for indentation
			depth,
			// Link to the post on Bluesky
			url: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}`,
		};

		comments.push(comment);

		// Recursively traverse replies
		if (reply.replies && Array.isArray(reply.replies)) {
			for (const childReply of reply.replies) {
				traverse(childReply, depth + 1);
			}
		}
	}

	// Start traversing from top-level replies
	if (Array.isArray(thread.thread.replies)) {
		for (const reply of thread.thread.replies) {
			traverse(reply, 0);
		}
	}

	return comments;
}

/**
 * Format timestamp as relative time
 *
 * @param {string} timestamp - ISO 8601 timestamp
 * @returns {string} - Human-readable relative time
 */
function formatRelativeTime(timestamp) {
	const now = Date.now();
	const then = new Date(timestamp).getTime();
	const diff = now - then;

	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;
	const week = 7 * day;
	const month = 30 * day;
	const year = 365 * day;

	if (diff < minute) return 'just now';
	if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
	if (diff < day) return `${Math.floor(diff / hour)}h ago`;
	if (diff < week) return `${Math.floor(diff / day)}d ago`;
	if (diff < month) return `${Math.floor(diff / week)}w ago`;
	if (diff < year) return `${Math.floor(diff / month)}mo ago`;
	return `${Math.floor(diff / year)}y ago`;
}

/**
 * Main function to get comments from a Bluesky thread URL
 *
 * @param {string} url - Bluesky post URL
 * @param {object} options - Fetch options
 * @returns {Promise<Array>} - Array of comment objects
 */
export async function getBlueskyComments(url, options = {}) {
	if (!url) return [];

	const uri = extractPostUri(url);
	if (!uri) {
		console.warn(`Invalid Bluesky URL: ${url}`);
		return [];
	}

	const thread = await fetchThread(uri, options);
	if (!thread) return [];

	const comments = parseComments(thread);

	// Add formatted timestamps
	return comments.map(comment => ({
		...comment,
		relativeTime: formatRelativeTime(comment.timestamp),
	}));
}

/**
 * Get comment count for a thread
 *
 * @param {string} url - Bluesky post URL
 * @returns {Promise<number>} - Number of comments
 */
export async function getCommentCount(url) {
	if (!url) return 0;

	const uri = extractPostUri(url);
	if (!uri) return 0;

	const thread = await fetchThread(uri, { useCache: true });
	if (!thread?.thread?.post) return 0;

	return thread.thread.post.replyCount || 0;
}

/**
 * Clear comment cache
 * Useful for development or manual refresh
 */
export function clearCache() {
	cache.clear();
}

/**
 * Eleventy async filter wrapper
 *
 * Usage in .eleventy.js:
 *   eleventyConfig.addAsyncFilter('getBlueskyComments', getBlueskyComments);
 */
export default {
	getBlueskyComments,
	getCommentCount,
	clearCache,
};
