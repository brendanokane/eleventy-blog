# URGENT HANDOFF - Margin Notes Broken

## Current Status: ⚠️ NEEDS IMMEDIATE FIX

Margin notes are not rendering at all on posts. User's typography preferences have been successfully applied, but the positioning system is broken.

## What's Broken

**File:** `_includes/layouts/post-woodblock.njk`
**Line:** 270
**Problem:** Alignment function has `return;` statement that disables it

The notes exist in HTML but are not visible on screen.

## Quick Fix to Try First

1. Remove line 270 (`return;`) from `alignDesktopMarginNotes()`
2. Test if notes appear in margin column
3. If they appear but overlap: vertical offset calculation is wrong
4. If they don't appear: deeper positioning issue

## Root Cause

The alignment JavaScript was:
- Resetting notes to `position: relative; top: 0px`
- Then calculating vertical offsets to align with markers
- This caused notes to overlap main text instead of staying in margin column

## Two Possible Solutions

### Option A: CSS Only (Faster)
- Remove all alignment JavaScript
- Let CSS Grid handle everything naturally
- Notes won't align perfectly with markers
- But they'll be visible and in the right column

### Option B: Fix JavaScript (Better UX)
- Use `transform: translateY()` instead of `top` property
- This keeps grid flow intact while adjusting position
- Or: Don't reset position at all, calculate delta from current position

## User's Applied Settings ✅

Successfully applied from playground:
- Colors: #f6f0e8 paper, #241425 ink, #8f1d14 marker
- Body: Vollkorn 1.2rem, 1.7 line-height
- Headlines: Noto Sans, H1 2.5em, H2 1.75em
- Margin notes: Gill Sans 0.85rem, 1.3 line-height
- Layout: 64ch main, 270px margin, 4rem gap, 10px borders

## Also Needs Attention

- Mobile breakpoint: User wants ~1900px instead of 950px
- Mobile notes toggleable but untested
- Full-width mobile layout needs refinement

## Working Reference

`public/design-playground.html` - Fully functional with perfect alignment
The playground's alignment code works. Can be adapted to production layout.

## Debug History

1. Notes had `opacity: 0` → Fixed by removing old visibility function
2. Notes overlapped text → Tried to fix alignment
3. Disabled JS to test → Notes disappeared completely
4. Current state → Alignment disabled, notes not visible

## Test URL

http://localhost:8080/the-naming-of-cats-and-an-offering/

Should have margin notes but currently shows none.

## Files to Check

- `_includes/layouts/post-woodblock.njk` (line 267-310) - Alignment JavaScript
- `public/design-playground.html` - Working reference implementation
- `venting.md` - Full debugging history
- `so-far.md` - Complete project context

Good luck! The typography looks beautiful, just need to make those notes visible.
