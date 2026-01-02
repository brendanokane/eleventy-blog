#!/bin/bash
# Generate favicon assets from SVG logo
# Requires ImageMagick (convert command)

set -e

echo "Generating favicon assets from Burning-House-logo.svg..."

# Source SVG
SOURCE="Burning-House-logo.svg"

# Output directory
OUT_DIR="public/img"
mkdir -p "$OUT_DIR"

# Generate PNG versions at different sizes
echo "→ Generating PNG favicons..."
magick -background none -density 384 "$SOURCE" -resize 16x16 "$OUT_DIR/favicon-16x16.png"
magick -background none -density 384 "$SOURCE" -resize 32x32 "$OUT_DIR/favicon-32x32.png"
magick -background none -density 384 "$SOURCE" -resize 180x180 "$OUT_DIR/apple-touch-icon.png"
magick -background none -density 384 "$SOURCE" -resize 192x192 "$OUT_DIR/android-chrome-192x192.png"
magick -background none -density 384 "$SOURCE" -resize 512x512 "$OUT_DIR/android-chrome-512x512.png"

# Generate .ico file (multi-resolution)
echo "→ Generating favicon.ico..."
magick -background none -density 384 "$SOURCE" \
  \( -clone 0 -resize 16x16 \) \
  \( -clone 0 -resize 32x32 \) \
  \( -clone 0 -resize 48x48 \) \
  -delete 0 "$OUT_DIR/favicon.ico"

# Copy SVG as-is for modern browsers
echo "→ Copying SVG favicon..."
cp "$SOURCE" "$OUT_DIR/favicon.svg"

echo "✓ Favicon generation complete!"
echo ""
echo "Generated files:"
echo "  - favicon.ico (multi-size)"
echo "  - favicon.svg"
echo "  - favicon-16x16.png"
echo "  - favicon-32x32.png"
echo "  - apple-touch-icon.png (180x180)"
echo "  - android-chrome-192x192.png"
echo "  - android-chrome-512x512.png"
