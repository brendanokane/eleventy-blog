/**
 * Social Card Generation Script
 * Generates 1200x630px OG images for blog posts
 * Uses Sharp to convert SVG templates to PNG
 */

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Site design tokens
const COLORS = {
	paper: "#f6f0e8",
	ink: "#241425",
	inkMuted: "#3a223a",
	vermillion: "#8f1d14",
	rule: "#c4b5b0",
};

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const PADDING = 80;
const CONTENT_WIDTH = CARD_WIDTH - PADDING * 2;

/**
 * Escape XML special characters for SVG
 */
function escapeXml(unsafe) {
	if (typeof unsafe !== "string") return "";
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

/**
 * Truncate text to fit width constraints
 */
function truncateText(text, maxLength) {
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength - 3) + "...";
}

/**
 * Wrap text to multiple lines
 */
function wrapText(text, maxCharsPerLine) {
	const words = text.split(" ");
	const lines = [];
	let currentLine = "";

	for (const word of words) {
		const testLine = currentLine ? `${currentLine} ${word}` : word;
		if (testLine.length <= maxCharsPerLine) {
			currentLine = testLine;
		} else {
			if (currentLine) lines.push(currentLine);
			currentLine = word;
		}
	}

	if (currentLine) lines.push(currentLine);
	return lines;
}

/**
 * Generate SVG template for social card
 */
function generateSvgTemplate(options) {
	const {
		title = "Untitled",
		subtitle = "",
		date = "",
		siteName = "Burning House",
		lang = "en",
	} = options;

	// Title wrapping - adjust for CJK characters (which are wider)
	const titleMaxChars = lang.startsWith("zh") ? 25 : 40;
	const titleLines = wrapText(title, titleMaxChars).slice(0, 3); // Max 3 lines
	const titleFontSize =
		titleLines.length === 1 ? 72 : titleLines.length === 2 ? 64 : 56;

	// Subtitle
	const subtitleMaxChars = lang.startsWith("zh") ? 35 : 60;
	const subtitleText = subtitle ? truncateText(subtitle, subtitleMaxChars) : "";

	// Position calculations
	const titleStartY = subtitle ? 200 : 240;
	const lineHeight = titleFontSize * 1.2;

	// Build title SVG elements
	let titleSvg = "";
	titleLines.forEach((line, index) => {
		const y = titleStartY + index * lineHeight;
		titleSvg += `
      <text
        x="50%"
        y="${y}"
        font-family="ui-serif, Georgia, serif"
        font-size="${titleFontSize}"
        font-weight="800"
        fill="${COLORS.ink}"
        text-anchor="middle"
        dominant-baseline="middle"
      >${escapeXml(line)}</text>
    `;
	});

	// Subtitle position (below title)
	const subtitleY = titleStartY + titleLines.length * lineHeight + 40;

	return `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Alegreya:wght@500;800&amp;display=swap');
        </style>

        <!-- Subtle texture pattern -->
        <filter id="texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" result="desaturatedNoise"/>
          <feComponentTransfer in="desaturatedNoise" result="theNoise">
            <feFuncA type="table" tableValues="0 0 0.05 0" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="theNoise" mode="multiply" />
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${COLORS.paper}" />

      <!-- Texture overlay -->
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${COLORS.paper}" filter="url(#texture)" opacity="0.3" />

      <!-- Top border -->
      <rect x="${PADDING}" y="${PADDING}" width="${CONTENT_WIDTH}" height="12" fill="${COLORS.ink}" />

      <!-- Bottom border -->
      <rect x="${PADDING}" y="${CARD_HEIGHT - PADDING - 12}" width="${CONTENT_WIDTH}" height="12" fill="${COLORS.ink}" />

      <!-- Left accent line -->
      <rect x="${PADDING}" y="${PADDING}" width="4" height="${CARD_HEIGHT - PADDING * 2}" fill="${COLORS.vermillion}" />

      <!-- Title -->
      ${titleSvg}

      ${
				subtitleText
					? `
      <!-- Subtitle -->
      <text
        x="50%"
        y="${subtitleY}"
        font-family="ui-serif, Georgia, serif"
        font-size="36"
        font-weight="400"
        fill="${COLORS.inkMuted}"
        text-anchor="middle"
        dominant-baseline="middle"
      >${escapeXml(subtitleText)}</text>
      `
					: ""
			}

      <!-- Site name -->
      <text
        x="${PADDING + 20}"
        y="${CARD_HEIGHT - PADDING - 40}"
        font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="28"
        font-weight="600"
        fill="${COLORS.ink}"
        text-anchor="start"
      >${escapeXml(siteName)}</text>

      ${
				date
					? `
      <!-- Date -->
      <text
        x="${CARD_WIDTH - PADDING - 20}"
        y="${CARD_HEIGHT - PADDING - 40}"
        font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="24"
        font-weight="400"
        fill="${COLORS.inkMuted}"
        text-anchor="end"
      >${escapeXml(date)}</text>
      `
					: ""
			}

      <!-- Decorative element -->
      <circle cx="${CARD_WIDTH - PADDING - 20}" cy="${PADDING + 20}" r="8" fill="${COLORS.vermillion}" />
    </svg>
  `.trim();
}

/**
 * Generate a social card PNG from post data
 */
async function generateSocialCard(postData, outputPath) {
	const { title, subtitle, date, lang = "en" } = postData;

	// Format date if provided
	let formattedDate = "";
	if (date) {
		const dateObj = new Date(date);
		formattedDate = dateObj.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}

	// Generate SVG
	const svg = generateSvgTemplate({
		title,
		subtitle,
		date: formattedDate,
		lang,
	});

	// Convert SVG to PNG using Sharp
	const svgBuffer = Buffer.from(svg);

	await sharp(svgBuffer)
		.resize(CARD_WIDTH, CARD_HEIGHT)
		.png()
		.toFile(outputPath);

	console.log(`✓ Generated social card: ${outputPath}`);
	return outputPath;
}

/**
 * Generate social cards for all posts that need them
 */
async function generateCardsForPosts(postsDir, outputDir) {
	// Ensure output directory exists
	await fs.mkdir(outputDir, { recursive: true });

	// This would typically be called from Eleventy
	// For standalone use, you'd need to parse post frontmatter
	console.log("Social card generator ready.");
	console.log("Call generateSocialCard(postData, outputPath) for each post.");
}

/**
 * CLI usage
 */
if (import.meta.url === `file://${process.argv[1]}`) {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.log("Usage:");
		console.log("  node generate-social-cards.js <title> [subtitle] [date]");
		console.log("");
		console.log("Example:");
		console.log(
			'  node generate-social-cards.js "Post Title" "Optional Subtitle" "2025-01-15"',
		);
		console.log("");
		console.log("Or import and use programmatically:");
		console.log(
			'  const { generateSocialCard } = require("./generate-social-cards");',
		);
		process.exit(0);
	}

	const [title, subtitle = "", date = ""] = args;
	const outputPath = path.join(__dirname, "..", "_site", "og-test.png");

	generateSocialCard({ title, subtitle, date }, outputPath)
		.then(() => {
			console.log("✓ Test card generated successfully!");
			console.log(`  View at: ${outputPath}`);
		})
		.catch((err) => {
			console.error("✗ Error generating card:", err);
			process.exit(1);
		});
}

export { generateSocialCard, generateCardsForPosts, CARD_WIDTH, CARD_HEIGHT };
