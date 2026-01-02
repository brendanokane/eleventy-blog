# Leishu-Inspired Design System

This document describes the broadsheet homepage design inspired by late-Ming 日用類書 (leishu, encyclopedic reference works).

## Design Philosophy

The homepage draws visual inspiration from late-Ming woodblock-printed leishu pages, featuring:

- **Multiple ruled borders** - Heavy frames mimicking woodblock printing
- **Dense information architecture** - Efficient columnar layouts
- **Strong black ink on aged paper** aesthetic
- **Decorative seals/stamps** in vermillion red
- **Classical typography hierarchy** with clear title blocks

## Key Design Elements

### 1. Broadsheet Frame
The main content is enclosed in multiple borders that echo woodblock printing:
- Outer border: 4px solid ink with double-line effect
- Middle border: Lighter opacity frame
- Inner border: Subtle accent frame
- All borders use the site's ink color (`#241425`)

### 2. Logo Treatment
The Burning House logo is:
- Displayed in a framed box (80x80px)
- Bordered with double frames
- Background-tinted for depth
- Includes subtle inset shadows

### 3. Typography
- **Display font**: Noto Sans (bold weights)
- **Body font**: Vollkorn with Noto Serif TC for Chinese
- **Hierarchy**: Clear kicker → title → subtitle structure
- **Vermillion accents**: Used for labels and stamps

### 4. Decorative Elements
- **Dispatch stamp**: Rotated vermillion frame in top-right
- **Multiple borders**: Layered frames at different opacities
- **Subtle gradients**: Paper texture effects
- **Ink wash effects**: Semi-transparent ink overlays

## Assets Generated

### Favicons
Run `./scripts/generate-favicons.sh` to generate:
- `favicon.ico` (multi-resolution: 16x16, 32x32, 48x48)
- `favicon.svg` (modern browsers)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`

### OG Images

#### Default Site OG Image
Run `node scripts/generate-default-og.js` to create the branded default OG image featuring:
- Centered logo in decorative frame
- Site name and tagline
- Multiple leishu-inspired borders
- Vermillion dispatch stamp

#### Per-Post OG Images
Generate custom OG images for posts:
```bash
node scripts/generate-og-image.js "Post Title" output.jpg
```

Features:
- Post title in large display type
- Site branding in header
- Leishu-inspired border frames
- 1200x630px (standard OG size)

## Color Palette

```css
--paper: #f6f0e8;        /* warm linen */
--paper-2: #efe6db;      /* darker paper */
--ink: #241425;          /* very dark purple-brown */
--ink-2: #3a223a;        /* lighter ink */
--vermillion: #8f1d14;   /* dark vermillion accent */
```

In dark mode, these invert appropriately.

## CSS Classes

### Broadsheet Layout
- `.broadsheet-shell` - Outer container with max-width
- `.broadsheet` - Main content area with borders
- `.broadsheet-masthead` - Header with logo and title
- `.broadsheet-brand` - Logo and text lockup
- `.broadsheet-stamp` - Decorative vermillion stamp
- `.broadsheet-hero` - Featured post section
- `.broadsheet-grid` - Card grid for recent posts
- `.broadsheet-card` - Individual post cards with frames

### Decorative Effects
- `.broadsheet-inkwash` - Adds subtle ink wash overlay
- `.ink-rise` - Fade-in animation
- `.logo-mark` - Logo with double border treatment

## Responsive Behavior

- Desktop: Side-by-side hero layout with left image, right text
- Tablet/Mobile (<980px): Single column stacked layout
- Logo scales with viewport but maintains framing
- Grid collapses from 3 columns to 1

## Future Enhancements

Potential additions to align further with leishu aesthetic:
- Vertical text options for Chinese content
- More elaborate border patterns
- Additional decorative seals/stamps
- Column dividers for multi-column layouts
- Traditional Chinese pagination/folios

## References

The design references these late-Ming leishu in `leishu-refs/`:
- 萬書萃錦 (Wan Shu Cui Jin)
- 新刻古今選集小掌八譜 (Xin Ke Gu Jin Xuan Ji Xiao Zhang Ba Pu)
- 水陸路程 (Shui Lu Lu Cheng)

These encyclopedic works feature dense columnar text, heavy ruled borders, and a practical information-dense aesthetic that inspired this design.
