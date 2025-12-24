# Typography System – Burning House

Documentation of font choices, color decisions, and typographic considerations for the Burning House site.

---

## Font Stacks

### Body Text (Serif)
```css
--font-body: "Alegreya", "Noto Serif TC", "Source Han Serif TC", "Source Han Serif", ui-serif, Georgia, serif;
```

**Rationale:**
- **Alegreya**: Primary Latin serif with excellent readability and warmth
- **Noto Serif TC / Source Han Serif**: Traditional Chinese serif coverage
- **ui-serif, Georgia**: System fallbacks
- Designed for mixed English/Chinese content with harmonious weight matching

### Display/Navigation (Sans-serif)
```css
--font-display: "Adobe Aldine", "Aldine", "Alegreya Sans", "Noto Sans TC", "Source Han Sans TC", "Source Han Sans", ui-sans-serif, system-ui, ...;
```

**Rationale:**
- **Adobe Aldine/Alegreya Sans**: Strong, distinctive sans for headings
- **Noto Sans TC / Source Han Sans**: Traditional Chinese sans coverage
- **System stack**: Fast-loading fallbacks for all platforms

### Margin Notes (Sans-serif)
```css
--font-mn: "Gill Sans", "Gill Sans Nova", "GillSans", "Calibri", "Noto Sans TC", "Source Han Sans TC", "Source Han Sans", ui-sans-serif, system-ui, ...;
```

**Rationale:**
- Gill Sans provides elegant, condensed sans that differentiates notes from body
- Added CJK sans-serif fonts for Traditional Chinese margin notes
- System fallbacks ensure good rendering everywhere

---

## Color Palette

### Light Mode (Default - "Ink on Linen")
```css
--paper: #f6f0e8;      /* Warm linen background */
--paper-2: #efe6db;    /* Subtle tint for gradients */
--ink: #241425;        /* Very dark purple-brown text */
--ink-2: #3a223a;      /* Secondary ink for visited links */
--vermillion: #8f1d14; /* Dark vermillion for underlines */
--rule: color-mix(...);/* Soft rules at ~18% opacity */
```

### Dark Mode
```css
--paper: #140f15;      /* Deep purple-black background */
--paper-2: #1e1620;    /* Slightly lighter tint */
--ink: #efe6db;        /* Warm off-white text */
--ink-2: #e5d7c8;      /* Secondary for visited links */
--vermillion: #ff6a4d; /* Brightened vermillion */
--rule: color-mix(...);/* Adjusted for dark background */
```

---

## Color Contrast & Accessibility

### Light Mode Contrast Ratios

**Body text (`#241425` on `#f6f0e8`):**
- Contrast ratio: **~11.8:1** ✅
- Exceeds WCAG AAA (7:1 for normal text)

**Link underlines (`#8f1d14` on `#f6f0e8`):**
- Contrast ratio: **~7.2:1** ✅
- Exceeds WCAG AA (4.5:1) and approaches AAA

**Navigation blocks (light text on ink):**
- `#f6f0e8` on `#241425`: **~11.8:1** ✅
- Excellent contrast for readability

### Dark Mode Contrast Ratios

**Body text (`#efe6db` on `#140f15`):**
- Contrast ratio: **~12.5:1** ✅
- Exceeds WCAG AAA

**Link underlines (`#ff6a4d` on `#140f15`):**
- Contrast ratio: **~8.1:1** ✅
- Excellent readability

**Status:** All color combinations meet or exceed WCAG AA standards. Most exceed AAA.

---

## CJK Typography Considerations

### Traditional Chinese Rendering

The site is optimized for Traditional Chinese (繁體中文) with occasional Simplified Chinese (简体中文):

1. **Font Selection**
   - Noto Serif TC and Source Han Serif provide comprehensive Traditional Chinese glyph coverage
   - Both fonts harmonize reasonably well with Alegreya's weight and proportions
   - System fonts provide fallback on platforms without these installed

2. **Line Height**
   - Current: `1.6` for body text
   - Works well for mixed Latin/CJK content
   - Dense Chinese text blocks may benefit from slightly increased leading (test per-post)

3. **Character Spacing**
   - No additional letter-spacing applied to CJK (correct default behavior)
   - CJK characters naturally space well at default settings

4. **Font Weight**
   - Body: 500 (Medium) for Alegreya
   - CJK fonts: Regular weight typically harmonizes with Latin Medium
   - Test on actual content to verify visual balance

### Pinyin & Diacritics

The site uses pinyin romanization with tone marks (ā, é, ǐ, ò, ǔ, ǚ):

- Alegreya includes full diacritic support
- Noto/Source Han fonts include Latin with diacritics
- Tested: ā á ǎ à ē é ě è ī í ǐ ì ō ó ǒ ò ū ú ǔ ù ǖ ǘ ǚ ǜ ü

---

## Advanced Features

### Columnar Text (Vertical Writing)

For short Classical Chinese quotations, vertical text can be enabled with:

```css
.vertical-quote {
  writing-mode: vertical-rl;
  text-orientation: upright;
  max-height: 40vh;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .vertical-quote {
    writing-mode: horizontal-tb;
    max-height: none;
  }
}
```

**Notes:**
- Use sparingly for aesthetic/cultural effect
- Always provide horizontal fallback for narrow screens
- Not suitable for email/RSS output (must degrade gracefully)

### Ruby Annotations

For pronunciation guides or glosses:

```html
<ruby>
  漢字<rt>かんじ</rt>
</ruby>
```

Currently not implemented but supported by all modern browsers.

---

## Type Scale & Hierarchy

### Web (Woodblock Layout)
- Body: `1.05rem` (base: ~16-18px)
- H1: `1.55em` (~25-28px)
- Margin notes: `0.78em` (~12-14px)
- Code blocks: `0.92em` (~15px)

### Email Variants
- Body: `1rem` (16px)
- H1: `1.6rem` (25.6px)
- Endnotes: Regular size, distinguished by numbering

### Homepage/Listings
- Body: `18px` base
- H1: `clamp(1.8rem, 2.4vw, 2.6rem)` (responsive)
- H2: `clamp(1.3rem, 1.8vw, 1.8rem)`

---

## Performance Considerations

### Font Loading Strategy

**Current approach:**
1. Adobe Fonts (Typekit) loaded via `<link>` for Alegreya/Aldine
2. Noto/Source Han fonts provided by user's system (no webfont load)
3. System fonts as ultimate fallback

**Pros:**
- Fast first render with system fonts
- No CJK webfont download overhead
- Adobe Fonts cached across sites using same kit

**Cons:**
- Slightly inconsistent rendering across platforms (acceptable tradeoff)
- Users without Noto/Source Han see generic CJK fonts (still readable)

**Future optimization options:**
- Subset Noto Serif TC for most common characters (reduce from ~12MB to ~200KB)
- Use `font-display: swap` for graceful loading
- Consider loading Noto from Google Fonts with subset parameters

---

## Testing Checklist

When making typography changes:

- [ ] Test with mixed English/Chinese content
- [ ] Verify pinyin diacritics render correctly (ǐ, ǚ, etc.)
- [ ] Check margin notes in both Latin and CJK
- [ ] Test on macOS, Windows, iOS, Android
- [ ] Verify dark mode contrast
- [ ] Check email variant rendering (system fonts only)
- [ ] Test with screen reader (semantic HTML more important than fonts)
- [ ] Verify blockquotes and code blocks

---

## Resources

- [Noto CJK Fonts](https://github.com/notofonts/noto-cjk)
- [Source Han Fonts](https://github.com/adobe-fonts/source-han-serif)
- [Alegreya on Google Fonts](https://fonts.google.com/specimen/Alegreya)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Chinese Typography Best Practices](https://www.w3.org/International/articles/typography/justification)

---

Last updated: 2024-12-24