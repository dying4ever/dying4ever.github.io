# Standalone Markdown Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `immersive` into a standalone static Markdown blog with the existing immersive homepage, preserved dated article URLs, coherent mountain backgrounds, and no runtime or build dependency on Hexo.

**Architecture:** A focused Node content pipeline scans `content/`, parses front matter, renders Markdown, aggregates archives/categories, and writes complete static HTML pages into Vite's `dist`. The current Vite/GSAP homepage stays separate from reading-page JavaScript so article routes remain fast and progressively enhanced.

**Tech Stack:** Vite 7, Node.js ESM, GSAP 3, gray-matter, markdown-it, markdown-it-anchor, markdown-it-task-lists, highlight.js, Node test runner, Playwright.

## Global Constraints

- Modify only `F:/hugo/hexo/immersive`; treat `../blog` as a read-only one-time migration source.
- Do not execute Hexo in production builds.
- Preserve `/YYYY/MM/DD/文章文件名/` article URLs.
- Preserve original Markdown front matter and relative `.assets` images.
- Existing articles live under `content/notes`; new top-level folders are `film`, `life`, and `projects`.
- Reading pages use a dark landscape masthead and light parchment body.
- Do not push or create intermediate Git commits; commit and publish only after final verification.

---

### Task 1: Content Model and Route Compatibility

**Files:**
- Create: `src/content/frontmatter.js`
- Create: `src/content/routes.js`
- Create: `tests/markdown-pipeline.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `parseDocument(source, filePath, parentSection)` returning `{ title, date, categories, tags, sticky, desc, body, sourcePath, section }`.
- Produces: `getArticleRoute(document)` returning `/YYYY/MM/DD/<encoded-stem>/`.
- Produces: `collectTaxonomy(documents)` returning `{ sections, categories, tags, archives }`.

- [ ] **Step 1: Add failing parser and route tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDocument } from '../src/content/frontmatter.js';
import { getArticleRoute, collectTaxonomy } from '../src/content/routes.js';

test('preserves original front matter and builds the dated route', () => {
  const doc = parseDocument(`---\ntitle: 示例\ndate: 2025-07-17 19:41:51\ncategories:\n  - cpp\ntags:\n  - cpp\n---\n正文`, 'content/notes/cpp/chrono.md', 'notes');
  assert.equal(doc.title, '示例');
  assert.deepEqual(doc.categories, ['cpp']);
  assert.equal(getArticleRoute(doc), '/2025/07/17/chrono/');
});

test('groups all migrated categories beneath notes', () => {
  const docs = [
    parseDocument('---\ntitle: A\ndate: 2025-01-01\ncategories: [cpp]\n---\nA', 'content/notes/cpp/a.md', 'notes'),
    parseDocument('---\ntitle: B\ndate: 2025-02-01\ncategories: [影评]\n---\nB', 'content/film/b.md', 'film'),
  ];
  const taxonomy = collectTaxonomy(docs);
  assert.equal(taxonomy.sections.notes.length, 1);
  assert.equal(taxonomy.sections.film.length, 1);
  assert.equal(taxonomy.categories.cpp.length, 1);
});
```

- [ ] **Step 2: Verify RED**

Run: `node --test tests/markdown-pipeline.test.js`

Expected: FAIL because `src/content/frontmatter.js` and `src/content/routes.js` do not exist.

- [ ] **Step 3: Install parsing dependencies and implement the model**

Run: `npm install gray-matter markdown-it markdown-it-anchor markdown-it-task-lists highlight.js`

Implementation requirements:

```js
export function parseDocument(source, filePath, parentSection) { /* validate required title/date and normalize arrays */ }
export function getArticleRoute(document) { /* UTC-safe local date parts + path stem */ }
export function collectTaxonomy(documents) { /* deterministic section/category/tag/archive maps */ }
```

Dates must be parsed from the `YYYY-MM-DD` portion without timezone shifting. Missing title/date and duplicate routes throw errors containing the source path.

- [ ] **Step 4: Verify GREEN**

Run: `node --test tests/markdown-pipeline.test.js`

Expected: 2 tests PASS.

---

### Task 2: One-Time Markdown and Asset Migration

**Files:**
- Create: `scripts/migrate-content.mjs`
- Create: `content/notes/**`
- Create: `content/film/.gitkeep`
- Create: `content/life/.gitkeep`
- Create: `content/projects/.gitkeep`
- Create: `content/pages/about.md`
- Create: `content/pages/friends.md`
- Create: `content/pages/changelog.md`
- Create: `tests/content-migration.test.js`

**Interfaces:**
- Consumes: read-only `../blog/source/_posts` and selected page Markdown.
- Produces: self-contained `content/` tree with 131 article Markdown files and all sibling resource directories.

- [ ] **Step 1: Add failing migration integrity tests**

```js
test('contains all 131 migrated notes', async () => {
  const files = await globMarkdown('content/notes');
  assert.equal(files.length, 131);
});
```

- [ ] **Step 2: Verify RED**

Run: `node --test tests/content-migration.test.js`

Expected: FAIL because `content/notes` and the standalone build script are absent.

- [ ] **Step 3: Implement and run one-time migration**

`scripts/migrate-content.mjs` must:

```js
await cp(sourcePosts, targetNotes, { recursive: true, force: false });
```

It must refuse to overwrite an existing non-empty `content/notes`, create the three future section directories, and copy About/friends/build-log source into `content/pages` as normalized UTF-8 Markdown. Run once with `node scripts/migrate-content.mjs`.

- [ ] **Step 4: Verify migrated resources and Markdown**

Run: `node --test tests/content-migration.test.js tests/markdown-pipeline.test.js`

Expected: all tests PASS; output reports 131 notes.

---

### Task 3: Markdown Rendering and Static Page Templates

**Files:**
- Create: `src/content/markdown.js`
- Create: `src/content/load-content.js`
- Create: `src/content/render-pages.js`
- Create: `src/templates/site-shell.js`
- Create: `src/templates/article-page.js`
- Create: `src/templates/list-page.js`
- Create: `src/styles/content-site.css`
- Create: `src/content-site.js`
- Create: `tests/static-pages.test.js`

**Interfaces:**
- Produces: `createMarkdownRenderer()` configured with anchors, task lists, image rewriting, lazy loading, and highlighted code.
- Produces: `loadContent(contentRoot)` returning validated documents and taxonomy.
- Produces: `renderStaticPages(model, outDir)` writing articles, sections, categories, archives, About, friends, changelog, and 404 pages.

- [ ] **Step 1: Add failing renderer/template tests**

```js
test('rewrites a sibling asset image and adds lazy loading', () => {
  const html = renderMarkdown('![](demo.assets/a.png)', { assetBase: '/2025/01/01/demo/assets/' });
  assert.match(html, /src="\/2025\/01\/01\/demo\/assets\/a\.png"/);
  assert.match(html, /loading="lazy"/);
});

test('article template contains masthead metadata, TOC and parchment body', () => {
  const html = renderArticlePage(fixtureDocument);
  assert.match(html, /class="content-masthead"/);
  assert.match(html, /class="article-toc"/);
  assert.match(html, /class="article-paper"/);
});
```

- [ ] **Step 2: Verify RED**

Run: `node --test tests/static-pages.test.js`

Expected: FAIL because renderer/template modules do not exist.

- [ ] **Step 3: Implement Markdown renderer and focused templates**

The shared shell must contain the same navigation labels and routes as the homepage. The article template must expose semantic `<article>`, `<time>`, category/tag links, generated heading TOC, prev/next links, and accessible skip link. List templates must support empty states for Film, Life, and Projects.

The stylesheet must define charcoal/gold mastheads, a warm parchment reading surface, responsive typography, dark highlighted code, readable tables, captions, blockquotes, and a collapsible mobile TOC.

- [ ] **Step 4: Verify GREEN**

Run: `node --test tests/static-pages.test.js tests/markdown-pipeline.test.js`

Expected: all tests PASS.

---

### Task 4: Standalone Build and Development Routing

**Files:**
- Create: `scripts/build-site.mjs`
- Create: `scripts/dev-content.mjs`
- Modify: `package.json`
- Modify: `vite.config.js`
- Delete: `scripts/build-unified.mjs`
- Modify: `tests/unified-site.test.js`

**Interfaces:**
- Produces: `npm run build` writing the homepage and all Markdown-derived routes to `dist` without Hexo.
- Produces: local Vite middleware/fallback serving generated content routes at port 4173.

- [ ] **Step 1: Replace old unified-build assertions with failing standalone assertions**

```js
test('build scripts are standalone and never execute Hexo', async () => {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  assert.equal(pkg.scripts.build, 'node scripts/build-site.mjs');
  const buildText = await readFile('scripts/build-site.mjs', 'utf8');
  assert.doesNotMatch(`${JSON.stringify(pkg.scripts)}\n${buildText}`, /hexo|blogRoot|\.\.\/blog/i);
});
```

- [ ] **Step 2: Verify RED**

Run: `node --test tests/unified-site.test.js`

Expected: FAIL because the package still points to Vite/unified Hexo behavior.

- [ ] **Step 3: Implement build orchestration**

`scripts/build-site.mjs` must clear `dist`, invoke Vite into a temporary homepage directory, load Markdown, copy article resources, render all static pages, then merge homepage assets. It must emit route counts and warnings and exit non-zero on malformed front matter or duplicate routes.

The development server must serve generated static pages and rebuild content when Markdown changes without requiring Hexo.

- [ ] **Step 4: Verify GREEN and inspect output**

Run: `npm run build`

Expected: exit 0, reports 131 notes, and creates `dist/about/index.html`, `dist/categories/index.html`, `dist/archives/index.html`, and dated article directories.

Run: `node --test tests/*.test.js`

Expected: all Node tests PASS.

---

### Task 5: Continuous Landscape Story and Prologue Layout

**Files:**
- Create: `public/images/story-path.webp`
- Create: `public/images/story-river.webp`
- Create: `public/images/story-stage.webp`
- Modify: `index.html`
- Modify: `src/scroll-story.js`
- Modify: `src/styles/scroll-story.css`
- Modify: `src/styles/responsive.css`
- Modify: `tests/scroll-story.test.js`

**Interfaces:**
- Produces: three lazy story backgrounds used in order after the homepage.
- Produces: two-column prologue with normal-flow paragraphs and minimal inactive opacity change.

- [ ] **Step 1: Add failing visual-structure tests**

```js
test('uses all three continuous story backgrounds in order', () => {
  assert.match(css, /story-path\.webp[\s\S]*story-river\.webp[\s\S]*story-stage\.webp/);
});

test('prologue uses a split layout and avoids overlapping paragraphs', () => {
  assert.match(html, /prologue-panel__intro/);
  assert.match(html, /prologue-panel__body/);
  assert.doesNotMatch(prologueRule, /position:\s*absolute/);
});
```

- [ ] **Step 2: Verify RED**

Run: `node --test tests/scroll-story.test.js`

Expected: FAIL because new assets/classes are missing.

- [ ] **Step 3: Prepare assets and implement story transitions**

Convert the three approved source images to WebP at no more than 1920px wide, harmonize contrast and edge fog without changing their compositions, and copy them into `public/images` under the filenames above.

Use layered background crossfades, `background-position` motion, and a restrained GSAP scale progression. Keep transitions warm and continuous; never reveal a pure black or pure white frame.

Change prologue markup to left intro/right quote. Paragraphs stay in document flow; active opacity is `1`, inactive opacity is at least `0.72`, and ghost transforms are removed.

In `@media (prefers-reduced-motion: reduce)`, disable background position animation, cloud drift, bird travel, and pinned scale transitions while keeping every section readable.

- [ ] **Step 4: Verify GREEN**

Run: `node --test tests/scroll-story.test.js tests/styles.test.js`

Expected: all tests PASS.

---

### Task 6: Browser, Mobile, Performance and Final Publication Verification

**Files:**
- Modify: `tests/smoke.py`
- Create or update: `previews/standalone-home.png`
- Create or update: `previews/standalone-prologue.png`
- Create or update: `previews/standalone-article.png`
- Create or update: `previews/standalone-mobile.png`
- Modify: `content/pages/changelog.md`

**Interfaces:**
- Consumes: final `dist` and local port 4173.
- Produces: evidence for routes, browser behavior, mobile layout, console cleanliness, and final build readiness.

- [ ] **Step 1: Extend smoke tests before final UI fixes**

The Playwright script must verify:

```python
assert page.locator('.prologue-panel__body p').count() == 3
assert page.locator('.article-paper').is_visible()
assert page.locator('.content-nav').is_visible()
assert not console_errors
```

It must visit `/`, `/notes/`, `/categories/`, `/archives/`, `/about/`, `/friends/`, `/changelog/`, one dated article, one relative article image, and a missing route. It must repeat homepage/article checks at 390px width and with reduced motion.

- [ ] **Step 2: Run smoke tests and observe failures**

First run helper usage:

`python C:/Users/asus-/.codex/skills/webapp-testing/scripts/with_server.py --help`

Then run the project smoke suite through the helper on port 4173. Expected at this stage: any remaining layout or route regression is reported by a specific assertion.

- [ ] **Step 3: Fix only observed browser regressions and update changelog**

Adjust responsive CSS, focus states, content asset paths, or animation thresholds only where the smoke evidence shows a problem. Add a dated changelog entry describing the standalone migration and verification results.

- [ ] **Step 4: Run final verification**

Run:

```powershell
npm test
npm run build
python C:/Users/asus-/.codex/skills/webapp-testing/scripts/with_server.py --server "npm run dev" --port 4173 -- python tests/smoke.py
```

Expected: all Node tests PASS, build exits 0 with 131 migrated notes, all Playwright scenarios PASS, no console errors, and screenshots show coherent desktop/mobile rendering.

- [ ] **Step 5: Final Git publication only after approval**

Review `git status` and `git diff --stat`, then create one intentional final commit and push the currently configured publication branch. Do not push if any verification command fails.
