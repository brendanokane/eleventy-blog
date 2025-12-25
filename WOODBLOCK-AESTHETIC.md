# Woodblock Print Aesthetic Guide

**Goal:** Evoke the character of historical woodblock printing without creating a "historical recreation" costume. Think **suggestion, not simulation**.

---

## Understanding the Aesthetic

Historical woodblock prints (especially Chinese/Japanese from Ming-Qing era) have distinctive visual characteristics:

### Key Features

1. **Uneven Ink Distribution**
   - Darker in centers, lighter at edges (or vice versa)
   - Variations across the same line/character
   - Not perfectly uniform like digital printing

2. **Border Irregularities**
   - Thick borders aren't perfectly straight
   - Slight waviness, organic feeling
   - Corner joins show the wood grain's influence

3. **Paper Texture**
   - Fibrous, uneven surface
   - Not smooth like modern paper
   - Shows through the ink in places

4. **Registration Imperfection**
   - Multi-color prints show slight misalignment
   - Gives dimensionality and handmade quality

5. **Ink Bleed & Spread**
   - Ink absorbs into paper unevenly
   - Edges aren't laser-sharp
   - Organic, natural boundaries

### What to Avoid

❌ **Distressed/grunge effects** - Too aggressive, too "designed"  
❌ **Heavy noise overlays** - Makes text hard to read  
❌ **Skeuomorphic curled pages** - Cheesy, dated  
❌ **Excessive texture** - Distracting, tiring to look at  
❌ **Fake aging** (yellowing, tears, stains) - We want historic inspiration, not decay

---

## CSS/SVG Techniques

### 1. Subtle Texture Overlay (Lightweight)

Use CSS blend modes with very light noise:

```css
.woodblock-texture {
  position: relative;
}

.woodblock-texture::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  mix-blend-mode: multiply;
  opacity: 0.3;
}
```

**Key:** Very low opacity (0.03 in filter, 0.3 on element). Should be barely perceptible.

### 2. Organic Border Variations (SVG Filter)

Make thick borders slightly wavy instead of perfectly straight:

```css
.woodblock-border {
  border: 12px solid var(--ink);
  filter: url(#woodblock-distortion);
}
```

```html
<svg style="position: absolute; width: 0; height: 0;">
  <defs>
    <filter id="woodblock-distortion">
      <feTurbulence 
        type="turbulence" 
        baseFrequency="0.02" 
        numOctaves="2" 
        result="turbulence"/>
      <feDisplacementMap 
        in="SourceGraphic" 
        in2="turbulence" 
        scale="2" 
        xChannelSelector="R" 
        yChannelSelector="G"/>
    </filter>
  </defs>
</svg>
```

**Tuning:**
- `baseFrequency`: Lower = gentler waves (0.01-0.05)
- `scale`: Displacement amount (1-4px for subtlety)
- `numOctaves`: Complexity (1-3 for natural look)

### 3. Ink Irregularity on Text (Experimental)

Very subtle variation in text weight:

```css
.woodblock-text {
  /* Slightly irregular text edges */
  filter: 
    drop-shadow(0 0 0.3px var(--ink))
    contrast(1.02);
  
  /* Or use text-shadow for subtle spread */
  text-shadow: 
    0.02em 0 0.02em var(--ink),
    -0.02em 0 0.02em var(--ink);
}
```

**Warning:** Test extensively. Can make text harder to read if overdone.

### 4. Paper Texture Background

Layered gradients for subtle "linen" feel (already in your CSS!):

```css
body {
  background:
    /* Subtle variations like paper fibers */
    radial-gradient(
      1200px 600px at 20% 0%,
      color-mix(in srgb, var(--paper-2), transparent 35%),
      transparent 60%
    ),
    radial-gradient(
      900px 500px at 90% 10%,
      color-mix(in srgb, var(--paper-2), transparent 35%),
      transparent 55%
    ),
    linear-gradient(
      0deg,
      color-mix(in srgb, var(--paper), #ffffff 3%),
      var(--paper)
    );
}
```

### 5. Imperfect Circles/Decorative Elements

Use SVG with slight irregularity:

```html
<svg width="20" height="20">
  <circle cx="10" cy="10" r="8" fill="var(--vermillion)">
    <animate
      attributeName="r"
      values="8;8.2;7.9;8.1;8"
      dur="10s"
      repeatCount="indefinite" />
  </circle>
</svg>
```

**Very subtle animation** makes it feel slightly organic.

---

## Practical Implementation

### Strategy: Layered Restraint

Apply effects **in layers**, from lightest to most noticeable:

1. **Always:** Proper color palette (ink on linen, never pure black/white)
2. **Baseline:** Thick borders (already have this - 12px borders)
3. **Subtle:** Paper texture background (already implemented)
4. **Optional:** Very light noise overlay (barely visible)
5. **Experimental:** Border distortion (test carefully)
6. **Rare:** Text irregularity (only on large headings?)

### Where to Apply Effects

#### High Impact, Low Risk:
- **Borders around main content** - Organic distortion works well here
- **Background texture** - Already doing this well
- **Decorative elements** (dots, rules) - Can be more irregular
- **Header images** - Slight paper texture overlay

#### Medium Risk:
- **Social card images** - Texture can add character
- **Large headlines** - Slight ink variation acceptable
- **Pull quotes** - Border distortion could work

#### High Risk (Be Careful):
- **Body text** - Readability is paramount
- **Navigation** - Functionality > aesthetics
- **Margin notes** - Already complex, don't add more

### Testing Checklist

Before shipping any woodblock effect:

- [ ] Readable in bright sunlight (phone screen)
- [ ] Readable with night mode/dark mode
- [ ] Doesn't cause eye strain after 5+ minutes
- [ ] Doesn't make text measurably harder to read
- [ ] Effect is noticeable but not distracting
- [ ] Works on mobile (doesn't break layout)
- [ ] Doesn't tank performance (check frame rate)
- [ ] Looks good on retina displays
- [ ] Looks good on low-DPI screens
- [ ] Someone unfamiliar with the site says "nice" not "what happened?"

---

## Code Examples

### Example 1: Woodblock Frame Around Post Content

```css
.post-content {
  border: 12px solid var(--ink);
  padding: 3rem;
  position: relative;
  filter: url(#woodblock-border);
}

.post-content::before {
  /* Subtle paper texture overlay */
  content: '';
  position: absolute;
  inset: -12px; /* Cover border too */
  background: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.01) 2px,
      rgba(0, 0, 0, 0.01) 4px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.01) 2px,
      rgba(0, 0, 0, 0.01) 4px
    );
  pointer-events: none;
  opacity: 0.4;
}
```

### Example 2: Organic Header Image Border

```css
.header-image img {
  border: 4px solid var(--ink);
  border-radius: 2px; /* Very slight, organic */
  filter: 
    url(#woodblock-distortion)
    drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}
```

### Example 3: Textured Social Cards

Already implemented in `scripts/generate-social-cards.mjs`:

```javascript
<!-- Texture overlay in SVG -->
<filter id="texture">
  <feTurbulence 
    type="fractalNoise" 
    baseFrequency="0.9" 
    numOctaves="4" 
    result="noise" />
  <feColorMatrix 
    in="noise" 
    type="saturate" 
    values="0" 
    result="desaturatedNoise"/>
  <feComponentTransfer in="desaturatedNoise" result="theNoise">
    <feFuncA type="table" tableValues="0 0 0.05 0" />
  </feComponentTransfer>
  <feBlend 
    in="SourceGraphic" 
    in2="theNoise" 
    mode="multiply" />
</filter>
```

---

## Philosophical Approach

### Historical Inspiration, Not Recreation

We're not making a museum piece. We're making a **modern website** that **nods to** historical printing.

Think of it like:
- A jazz musician interpreting a classical piece (not a cover band)
- A minimalist chair inspired by Ming furniture (not a reproduction)
- A modern building with art deco details (not a theme park)

### The Goal: Character, Not Authenticity

Woodblock printing had "imperfections" because it was **made by hand with physical materials**. We're not simulating imperfection for its own sake - we're capturing the **warmth** and **humanity** of handmade objects.

The best outcome: Someone thinks "this feels thoughtful and well-crafted" without necessarily knowing why.

### When in Doubt, Do Less

It's always easier to add effects than to remove them. Start with the minimal viable aesthetic and add very carefully.

---

## Resources & References

### Technical Resources
- [SVG Filters: The Missing Manual](https://www.smashingmagazine.com/2015/05/why-the-svg-filter-is-awesome/)
- [CSS Blend Modes](https://developer.mozilla.org/en-US/docs/Web/CSS/blend-mode)
- [feDisplacementMap examples](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap)

### Historical Reference
- Search: "Ming dynasty woodblock print" for authentic examples
- [Digital collections at Met Museum](https://www.metmuseum.org/) - Great historical prints
- Look at **borders and frames** in particular - that's where irregularity shows most

### Modern Examples
- [Butterick's Practical Typography](https://practicaltypography.com/) - Restrained, thoughtful
- [The Monocle](https://monocle.com/) - Magazine aesthetic, careful typography
- Historical newspapers (pre-offset printing era)

---

## Quick Start: Add One Effect

If you want to start simple, just add the organic border distortion to your main content frame:

1. Add the SVG filter definition to `_includes/layouts/base.njk`:

```html
<svg style="position: absolute; width: 0; height: 0;" aria-hidden="true">
  <defs>
    <filter id="woodblock-border">
      <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="2" result="turbulence"/>
      <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="1.5" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
</svg>
```

2. Apply it to borders in `css/index.css`:

```css
.wb-shell {
  filter: url(#woodblock-border);
}
```

3. Test it. If it looks good, keep it. If not, adjust or remove.

---

## Performance Notes

SVG filters can impact performance on older devices:

- **Test on mobile** - Filters use GPU, can drain battery
- **Use sparingly** - One or two filtered elements, not everything
- **Consider `will-change`** - Hints to browser for optimization:
  ```css
  .filtered-element {
    will-change: filter;
  }
  ```
- **Provide fallback** - Site should work without filters if browser doesn't support them

---

## Final Thoughts

The best woodblock aesthetic is one that makes people feel something without them necessarily knowing what technique you used. 

If they notice the technique more than the content, dial it back.

If they just think "this feels nice to read," you've succeeded.

Good luck! 🖨️✨