# Content Model

This document defines the frontmatter schema for blog posts.

## Post Frontmatter

```yaml
# === Required ===
title: "Post Title"
date: 2026-01-05

# === Publishing ===
draft: false                      # true = hidden in production builds

# === Descriptions ===
description: "Descriptive summary for RSS feeds and meta tags"
og_description: "Hookier summary for social media link previews"

# === Social/SEO Images ===
post_image: "/post-slug/assets/image.jpg"
post_image_alt: "Alt text describing the image"

# === Bluesky Comments ===
bluesky_thread: "https://bsky.app/profile/burninghou.se/post/abc123"

# === Related Posts (manual curation) ===
related:
  - some-other-post-slug
  - another-related-post

# === Poems (inline definitions, optional) ===
poems:
  - id: poem_id
    poet:
      en: "Poet Name"
      zh: "詩人名"
    title:
      en: "English Title"
      zh: "中文標題"
    text:
      en: |
        English translation
        line by line...
      zh: |
        中文原文
        逐行排列...

# === Custom Layout (optional, rarely used) ===
layout: layouts/post.njk         # Default; override for special posts
```

## Field Reference

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `title` | Yes | string | Post title |
| `date` | Yes | date | Publication date (YYYY-MM-DD) |
| `draft` | No | boolean | If true, excluded from production builds |
| `description` | No | string | Summary for RSS/meta description |
| `og_description` | No | string | Hookier summary for social previews |
| `post_image` | No | string | Path to OG/social image |
| `post_image_alt` | No | string | Alt text for social image |
| `bluesky_thread` | No | string | URL to Bluesky post for comments |
| `related` | No | array | List of related post slugs |
| `poems` | No | array | Inline poem definitions (see below) |
| `layout` | No | string | Custom template (default: `layouts/post.njk`) |

## Poem Structure

When defining poems inline in frontmatter:

```yaml
poems:
  - id: unique_id          # Used with {% poem "unique_id" %}
    poet:
      en: "English name"
      zh: "中文名"
    title:
      en: "English title"
      zh: "中文標題"
    text:
      en: |
        English text
        with line breaks
      zh: |
        中文內容
        保留換行
```

Poems can also be defined externally in `content/poems/{id}.yaml`.

## Deprecated Fields

These fields are no longer used:

| Field | Replaced By |
|-------|-------------|
| `publish` | `draft` (inverted logic) |
| `tags` | Removed; use `related` for connections |

---

*Last updated: 2026-01-05*
