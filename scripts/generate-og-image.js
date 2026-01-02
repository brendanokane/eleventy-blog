#!/usr/bin/env node

/**
 * Generate OG images with leishu-inspired woodblock aesthetic
 * Usage: node scripts/generate-og-image.js "Post Title" output.jpg [post-image.jpg]
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// OG image dimensions (1200x630 is standard)
const WIDTH = 1200;
const HEIGHT = 630;

// Colors matching the site design
const PAPER = '#f6f0e8';
const INK = '#241425';
const VERMILLION = '#8f1d14';

const args = process.argv.slice(2);
if (args.length < 2) {
	console.error('Usage: node scripts/generate-og-image.js "Post Title" output.jpg [post-image.jpg]');
	process.exit(1);
}

const title = args[0];
const outputPath = args[1];
const postImage = args[2] || null;

async function generateOGImage() {
	console.log(`Generating OG image: ${outputPath}`);
	console.log(`Title: ${title}`);
	if (postImage) {
		console.log(`Post image: ${postImage}`);
	}

	// Create base SVG with leishu-inspired layout
	const svg = `
		<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<style>
					@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@700;900&amp;display=swap');
					.title {
						font-family: 'Noto Sans', sans-serif;
						font-weight: 900;
						font-size: 64px;
						line-height: 1.2;
						fill: ${INK};
					}
					.site-name {
						font-family: 'Noto Sans', sans-serif;
						font-weight: 700;
						font-size: 28px;
						fill: ${INK};
					}
					.kicker {
						font-family: 'Noto Sans', sans-serif;
						font-weight: 600;
						font-size: 16px;
						letter-spacing: 0.15em;
						text-transform: uppercase;
						fill: ${VERMILLION};
					}
				</style>
			</defs>

			<!-- Background with paper texture -->
			<rect width="${WIDTH}" height="${HEIGHT}" fill="${PAPER}"/>

			<!-- Leishu-inspired multiple borders -->
			<rect x="40" y="40" width="${WIDTH - 80}" height="${HEIGHT - 80}"
				fill="none" stroke="${INK}" stroke-width="3" opacity="0.85"/>
			<rect x="50" y="50" width="${WIDTH - 100}" height="${HEIGHT - 100}"
				fill="none" stroke="${INK}" stroke-width="1" opacity="0.6"/>
			<rect x="30" y="30" width="${WIDTH - 60}" height="${HEIGHT - 60}"
				fill="none" stroke="${INK}" stroke-width="2" opacity="0.5"/>

			<!-- Inner content area background -->
			<rect x="60" y="60" width="${WIDTH - 120}" height="${HEIGHT - 120}"
				fill="${PAPER}" opacity="0.9"/>

			<!-- Logo area (top left) -->
			<rect x="80" y="80" width="100" height="100"
				fill="none" stroke="${INK}" stroke-width="2"/>

			<!-- Kicker text -->
			<text x="200" y="120" class="kicker">Stories from a</text>

			<!-- Site name -->
			<text x="200" y="160" class="site-name">Burning House</text>

			<!-- Decorative stamp (top right) -->
			<g transform="translate(${WIDTH - 180}, 95) rotate(-3)">
				<rect width="120" height="50" fill="none" stroke="${VERMILLION}" stroke-width="3"/>
				<text x="60" y="33" class="kicker" text-anchor="middle">Dispatch</text>
			</g>

			<!-- Title text (wrapped) -->
			<foreignObject x="80" y="220" width="${WIDTH - 160}" height="320">
				<div xmlns="http://www.w3.org/1999/xhtml" style="
					font-family: 'Noto Sans', sans-serif;
					font-weight: 900;
					font-size: 56px;
					line-height: 1.2;
					color: ${INK};
					display: -webkit-box;
					-webkit-line-clamp: 4;
					-webkit-box-orient: vertical;
					overflow: hidden;
					text-overflow: ellipsis;
				">
					${escapeHtml(title)}
				</div>
			</foreignObject>

			<!-- Bottom border accent -->
			<line x1="80" y1="${HEIGHT - 80}" x2="${WIDTH - 80}" y2="${HEIGHT - 80}"
				stroke="${INK}" stroke-width="2"/>
		</svg>
	`;

	// Generate the image
	let pipeline = sharp(Buffer.from(svg))
		.resize(WIDTH, HEIGHT)
		.jpeg({ quality: 90 });

	await pipeline.toFile(outputPath);
	console.log(`✓ OG image generated: ${outputPath}`);
}

function escapeHtml(text) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

generateOGImage().catch(err => {
	console.error('Error generating OG image:', err);
	process.exit(1);
});
