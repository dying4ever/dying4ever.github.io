# Avatar Portals And Recent List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage category collage with a Markdown-backed recent list, move the four category portals into a centered About avatar interaction, and finish the pending prologue polish.

**Architecture:** The Markdown loader remains the single source of article truth. Static rendering writes a small `/recent.json` feed filtered to FILM, LIFE, and PROJECTS; the homepage hydrates that feed into a text-only list. The About scene uses native `<details>` disclosure semantics so hover, keyboard, and touch all reach the same four portal links without a new interaction dependency.

**Tech Stack:** Vite, vanilla JavaScript, Node.js static generation, Markdown, GSAP/ScrollTrigger, CSS.

## Global Constraints

- Modify only `F:\hugo\hexo\immersive`; do not modify the adjacent Hexo project.
- Keep all article sources in `content/**/*.md` with the existing front matter and date routes.
- Do not remigrate or alter the 131 existing Notes.
- Preserve desktop, mobile, and `prefers-reduced-motion` behavior.
- Do not commit or deploy until the user confirms the preview.
- Run `npm test`, `npm run build`, and `python tests/smoke.py` after implementation.

---

### Task 1: Finish The Prologue Polish

**Files:**
- Modify: `tests/scroll-story.test.js`
- Modify: `tests/smoke.py`
- Modify: `src/main.js`
- Modify: `src/scroll-story.js`
- Modify: `src/styles/scroll-story.css`

**Interfaces:**
- Consumes: `SITE_CONTENT.prologueHighlight` and `[data-prologue-attribution]`.
- Produces: inline semantic `<mark>` emphasis, non-overlapping vertical title glyphs, and an earlier bottom-right attribution reveal.

- [ ] **Step 1: Write failing source and browser assertions**

  Assert that `renderProloguePart` no longer creates `prologue-panel__highlight-break`, that the title uses safe line height, and that the attribution tween starts before the third paragraph finishes.

- [ ] **Step 2: Run the focused tests and confirm RED**

  Run: `node --test tests/scroll-story.test.js`

- [ ] **Step 3: Implement the minimal prologue changes**

  Remove the injected `<br>`, use cloned inline highlight decoration, increase vertical glyph line-height while constraining maximum size, anchor the attribution at the quote's bottom-right, and advance its GSAP position.

- [ ] **Step 4: Re-run the focused tests and confirm GREEN**

  Run: `node --test tests/scroll-story.test.js`

### Task 2: Add Three Markdown Samples And A Recent Feed

**Files:**
- Create: `content/film/first-frame.md`
- Create: `content/life/a-july-note.md`
- Create: `content/projects/this-blog.md`
- Create: `src/content/recent.js`
- Modify: `src/content/render-pages.js`
- Modify: `tests/markdown-pipeline.test.js`
- Modify: `tests/static-pages.test.js`

**Interfaces:**
- Consumes: `model.documents`, with `section`, `title`, `date`, `timestamp`, and `route`.
- Produces: `selectRecentEntries(documents, limit)` and `/recent.json` containing only newest FILM/LIFE/PROJECTS entries.

- [ ] **Step 1: Write failing recent-selection and output assertions**

  Verify section filtering, newest-first ordering, the six-entry cap, and serialized `title/date/section/route` fields.

- [ ] **Step 2: Run focused tests and confirm RED**

  Run: `node --test tests/markdown-pipeline.test.js tests/static-pages.test.js`

- [ ] **Step 3: Add sample Markdown and minimal feed generation**

  Use the existing front matter format and write one clearly labeled sample in each requested section. Serialize the filtered model to `recent.json` from `renderStaticPages`.

- [ ] **Step 4: Re-run focused tests and confirm GREEN**

  Run: `node --test tests/markdown-pipeline.test.js tests/static-pages.test.js`

### Task 3: Replace Homepage Portals With The Recent Text List

**Files:**
- Modify: `index.html`
- Modify: `src/main.js`
- Modify: `src/styles/home.css`
- Modify: `src/styles/responsive.css`
- Modify: `tests/content.test.js`
- Modify: `tests/structure.test.js`

**Interfaces:**
- Consumes: `/recent.json`.
- Produces: `[data-recent-list]` rows with an article link and `<time>` for each Markdown entry.

- [ ] **Step 1: Write failing homepage structure assertions**

  Require the heading `最近`, a recent-list mount point, no portal grid inside `.home-hero`, and safe route hydration from `recent.json`.

- [ ] **Step 2: Run focused tests and confirm RED**

  Run: `node --test tests/content.test.js tests/structure.test.js`

- [ ] **Step 3: Implement the text-only recent list**

  Replace `#portal-grid` with a restrained right-side list, build elements through DOM APIs, show title plus date, and retain a graceful empty/error message.

- [ ] **Step 4: Re-run focused tests and confirm GREEN**

  Run: `node --test tests/content.test.js tests/structure.test.js`

### Task 4: Build The Centered Avatar And Hover Portals

**Files:**
- Modify: `index.html`
- Modify: `src/main.js`
- Modify: `src/scroll-story.js`
- Modify: `src/styles/scroll-story.css`
- Modify: `tests/scroll-story.test.js`
- Modify: `tests/smoke.py`

**Interfaces:**
- Consumes: `getPortalItems(resolvedBlogBase)`, `about-avatar.webp`, and the existing `story-stage.webp` landscape.
- Produces: centered circular portrait, cloud ring, modest `曾阿牛` name, GitHub/Douban/email links, and four image portals revealed by hover/focus/open state.

- [ ] **Step 1: Write failing semantic and responsive assertions**

  Require native `<details>/<summary>`, three exact external links, four About portal links, a circular portrait rule, and mobile/reduced-motion fallbacks.

- [ ] **Step 2: Run focused tests and confirm RED**

  Run: `node --test tests/scroll-story.test.js tests/structure.test.js`

- [ ] **Step 3: Implement the selected centered composition**

  Remove the split About copy and giant slogan. Center the circular portrait over the selected warm landscape treatment, add layered cloud pseudo-elements, place the name and links below, and fan the four image portals around the portrait on hover/focus/open.

- [ ] **Step 4: Re-run focused tests and confirm GREEN**

  Run: `node --test tests/scroll-story.test.js tests/structure.test.js`

### Task 5: Verify The Complete Site

**Files:**
- Modify only failing assertions or implementation files already listed above.

**Interfaces:**
- Consumes: complete local source tree.
- Produces: verified 134-entry build with 131 unchanged Notes and three new section samples.

- [ ] **Step 1: Run all unit tests**

  Run: `npm test`

- [ ] **Step 2: Build static output**

  Run: `npm run build`

- [ ] **Step 3: Verify desktop, mobile, routes, hover/touch disclosure, and overflow**

  Run: `python tests/smoke.py`

- [ ] **Step 4: Check the patch and leave it uncommitted for review**

  Run: `git diff --check` and `git status -sb`.
