#!/usr/bin/env node

/**
 * Generate default OG image for the site
 * This creates a branded image for pages without specific OG images
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';

// OG image dimensions (1200x630 is standard)
const WIDTH = 1200;
const HEIGHT = 630;

// Colors matching the site design
const PAPER = '#f6f0e8';
const INK = '#241425';
const VERMILLION = '#8f1d14';

const outputPath = 'public/assets/og/default.jpg';

async function generateDefaultOG() {
	console.log('Generating default OG image...');

	// Load and process the logo SVG
	const logoSvg = readFileSync('Burning-House-logo.svg', 'utf-8');

	// Create the OG image SVG
	const svg = `
		<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<style>
					@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@600;700;900&amp;display=swap');
					.title {
						font-family: 'Noto Sans', sans-serif;
						font-weight: 900;
						font-size: 72px;
						line-height: 1.1;
						fill: ${INK};
					}
					.subtitle {
						font-family: 'Noto Sans', sans-serif;
						font-weight: 600;
						font-size: 32px;
						line-height: 1.4;
						fill: ${INK};
						opacity: 0.75;
					}
					.kicker {
						font-family: 'Noto Sans', sans-serif;
						font-weight: 600;
						font-size: 18px;
						letter-spacing: 0.15em;
						text-transform: uppercase;
						fill: ${VERMILLION};
					}
				</style>
			</defs>

			<!-- Background with paper texture -->
			<rect width="${WIDTH}" height="${HEIGHT}" fill="${PAPER}"/>

			<!-- Subtle gradient wash -->
			<rect width="${WIDTH}" height="${HEIGHT}"
				fill="url(#paperGradient)" opacity="0.15"/>
			<defs>
				<linearGradient id="paperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" style="stop-color:${INK};stop-opacity:0.05" />
					<stop offset="100%" style="stop-color:${INK};stop-opacity:0" />
				</linearGradient>
			</defs>

			<!-- Leishu-inspired multiple borders -->
			<rect x="40" y="40" width="${WIDTH - 80}" height="${HEIGHT - 80}"
				fill="none" stroke="${INK}" stroke-width="4" opacity="0.85"/>
			<rect x="50" y="50" width="${WIDTH - 100}" height="${HEIGHT - 100}"
				fill="none" stroke="${INK}" stroke-width="1" opacity="0.6"/>
			<rect x="30" y="30" width="${WIDTH - 60}" height="${HEIGHT - 60}"
				fill="none" stroke="${INK}" stroke-width="2" opacity="0.5"/>

			<!-- Inner frame -->
			<rect x="58" y="58" width="${WIDTH - 116}" height="${HEIGHT - 116}"
				fill="none" stroke="${INK}" stroke-width="1" opacity="0.3"/>

			<!-- Logo box (centered, larger) -->
			<g transform="translate(${WIDTH / 2 - 90}, 120)">
				<rect width="180" height="180" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>
				<rect x="6" y="6" width="168" height="168" fill="none" stroke="${INK}" stroke-width="1" opacity="0.5"/>
				<g transform="translate(15, 15)">
					${logoSvg.replace(/<\?xml[^>]*\?>/g, '').replace(/width="384"/g, 'width="150"').replace(/height="384"/g, 'height="150"')}
				</g>
			</g>

			<!-- Kicker text -->
			<text x="${WIDTH / 2}" y="350" class="kicker" text-anchor="middle">
				Unbelievably late-breaking news from China
			</text>

			<!-- Site name -->
			<text x="${WIDTH / 2}" y="425" class="title" text-anchor="middle">
				Stories from a
			</text>
			<text x="${WIDTH / 2}" y="505" class="title" text-anchor="middle">
				Burning House
			</text>

			<!-- Decorative stamp (bottom right) -->
			<g transform="translate(${WIDTH - 200}, ${HEIGHT - 120}) rotate(-2)">
				<rect width="140" height="60" fill="none" stroke="${VERMILLION}" stroke-width="3"/>
				<rect x="4" y="4" width="132" height="52" fill="none" stroke="${VERMILLION}" stroke-width="1" opacity="0.5"/>
				<text x="70" y="40" class="kicker" text-anchor="middle">Dispatch</text>
			</g>
		</svg>
	`;

	// Generate the image
	await sharp(Buffer.from(svg))
		.resize(WIDTH, HEIGHT)
		.jpeg({ quality: 90 })
		.toFile(outputPath);

	console.log(`✓ Default OG image generated: ${outputPath}`);
}

generateDefaultOG().catch(err => {
	console.error('Error generating default OG image:', err);
	process.exit(1);
});
