# Development Guidelines

**⚠️ IMPORTANT FOR FUTURE AGENTS:**

This document contains critical workflows and requirements for working on this project.

---

## Starting the Development Server

**ALWAYS use the dev script instead of running npm/npx commands directly:**

```bash
./dev.sh
```

**Why?** This project has repeatedly had issues with multiple Eleventy instances running simultaneously, causing confusion where different browser tabs show different versions of the site. The `dev.sh` script:

1. Kills any existing Eleventy processes
2. Waits for cleanup
3. Starts a fresh dev server

**Never run these commands directly:**
- ❌ `npm start`
- ❌ `npx @11ty/eleventy --serve`
- ❌ `eleventy --serve`

**Always use:**
- ✅ `./dev.sh`

---

## Before Testing Changes

After making changes to templates, configuration, or shortcodes:

1. **Kill any running dev servers:**
   ```bash
   pkill -f "eleventy.*--serve"
   ```

2. **Start fresh:**
   ```bash
   ./dev.sh
   ```

3. **Hard refresh in browser** (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows/Linux)

---

## Checking for Multiple Instances

If you suspect multiple Eleventy instances are running:

```bash
ps aux | grep -i eleventy | grep -v grep
```

This will show all running Eleventy processes. There should only be 1-2 (one parent, one child).

To check which ports are in use:

```bash
lsof -i -P | grep LISTEN | grep node
```

The dev server typically runs on port 8080.

---

## Build vs Dev Server

**Production build** (no server):
```bash
npm run build
```

**Development server** (with live reload):
```bash
./dev.sh
```

The dev server watches for file changes and rebuilds automatically. However, template changes (`.njk` files) may not always trigger a proper reload, especially if they contain JavaScript or significant structural changes.

---

## When Changes Don't Appear

If your changes aren't showing up in the browser:

1. Check you're looking at the right port (should be 8080)
2. Hard refresh the browser (Cmd+Shift+R)
3. Kill and restart the dev server with `./dev.sh`
4. Check browser console for JavaScript errors
5. Check terminal for Eleventy build errors

---

## Template and Configuration Changes

Changes to these files often require a full server restart:

- `eleventy.config.js` - **Always restart**
- `_includes/layouts/*.njk` - **Restart recommended**
- `_config/*.js` - **Always restart**
- `package.json` scripts - **Always restart**

Changes to these usually work with auto-reload:

- Blog post markdown files (`content/blog/**/*.md`)
- CSS files (`css/**/*.css`)
- Frontmatter data

---

## Agent Workflow

When working on this project as an AI agent:

1. **After making any changes**, always kill existing servers:
   ```bash
   pkill -f "eleventy.*--serve"
   ```

2. **Start a fresh server**:
   ```bash
   ./dev.sh
   ```

3. **Tell the user** which port to check (usually 8080)

4. **If the user reports issues**, first verify:
   - No multiple instances running
   - They're looking at the correct port
   - They've hard-refreshed the browser

---

## Project Structure

```
eleventy-blog/
├── dev.sh                  # Development server startup script (use this!)
├── eleventy.config.js      # Main Eleventy configuration
├── content/                # All content (blog posts, pages)
│   └── blog/              # Blog posts
├── _includes/              # Templates and layouts
│   ├── layouts/           # Page layouts (.njk files)
│   └── components/        # Reusable components
├── _config/               # Configuration modules
│   ├── filters.js         # Nunjucks filters
│   └── bluesky-comments.js
├── css/                   # Stylesheets
├── public/                # Static assets (copied to _site/)
├── _site/                 # Build output (generated, don't edit)
└── node_modules/          # Dependencies
```

---

## Documentation Files

- `SHORTCODES.md` - Custom shortcode reference
- `MARKDOWN-CONFIG.md` - Markdown configuration and rollback instructions
- `DEVELOPMENT.md` - This file (workflows and agent instructions)
- `README.md` - Project overview

---

## Important Notes

- The site uses custom Markdown configuration with `breaks: true` and `html: true`
- Margin notes (`{% mn %}`) and footnotes (`{% fn %}`) share a counter
- Footnotes are collected by JavaScript on the client side
- Poetry uses `<br>` tags for line breaks (enabled by `breaks: true`)

---

**Remember: Always kill existing servers before starting a new one!**
