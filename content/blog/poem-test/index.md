---
title: "Poem Shortcode Test"
date: 2026-01-05
layout: layouts/post.njk
poems:
  - id: local_poem
    poet:
      en: "Du Fu"
      zh: "杜甫"
    title:
      en: "Spring View"
      zh: "春望"
    text:
      en: |
        The nation is shattered, mountains and rivers remain;
        The city in spring, grass and trees grow deep.
      zh: |
        國破山河在，
        城春草木深。
---

# Poem Shortcode Test

This page tests the `{% raw %}{% poem %}{% endraw %}` shortcode.

## Test 1: External poem file (drinking_alone.yaml)

{% poem "drinking_alone" %}

## Test 2: Frontmatter poem (local_poem)

{% poem "local_poem" %}

## Test 3: Missing poem (should show error)

{% poem "nonexistent_poem" %}
