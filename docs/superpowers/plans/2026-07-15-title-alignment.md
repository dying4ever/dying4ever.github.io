# Title Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the cover, transition, and homepage titles use the same fixed two-line typography and aligned anchors without changing the selected font file.

**Architecture:** Keep `SITE_CONTENT` as the single content source, add an explicit two-line title representation, and render the same line elements into all three title nodes. Move shared visual rules into `site-title` and `hero-vertical` classes while leaving only size and visibility differences on scene-specific classes; keep the existing GSAP geometry bridge.

**Tech Stack:** Semantic HTML, CSS custom properties, vanilla JavaScript, GSAP 3, Node test runner, Playwright with Microsoft Edge.

## Global Constraints

- Keep the current `QuanHengDuLiang-subset.woff2` display font; this task fixes inconsistency rather than choosing a new font.
- Render the title as exactly two lines: `终南山下，` and `活死人墓`.
- Keep the existing mountain, cloud, portal, and transition behavior.
- Do not modify `F:\hugo\hexo\blog` or `F:\hugo\hexo\new`.
- Preserve reduced-motion behavior and avoid new dependencies.

---

### Task 1: Explicit Two-Line Title Structure

**Files:**
- Modify: `src/content.js`
- Modify: `src/main.js`
- Modify: `index.html`
- Modify: `tests/content.test.js`
- Modify: `tests/structure.test.js`

**Interfaces:**
- Produces: `SITE_CONTENT.titleLines: readonly [string, string]`.
- Produces: `renderSiteTitle(node: Element, lines: readonly string[]): void` in `src/main.js`.
- Consumes: existing `SITE_CONTENT.title` and existing `[data-site-title]` nodes.

- [ ] **Step 1: Write the failing content and structure tests**

Add to `tests/content.test.js` inside the identity test:

```js
assert.deepEqual(SITE_CONTENT.titleLines, ['终南山下，', '活死人墓']);
```

Add to `tests/structure.test.js`:

```js
test('renders every display title as the same two fixed lines', async () => {
  const html = await readHtml();
  assert.equal((html.match(/class="[^"]*site-title(?:\s|[^"])*"/g) ?? []).length, 3);
  assert.equal((html.match(/class="site-title__line"/g) ?? []).length, 6);
});
```

- [ ] **Step 2: Run the tests and verify the expected failure**

Run:

```powershell
npm test -- tests/content.test.js tests/structure.test.js
```

Expected: failure because `SITE_CONTENT.titleLines`, `site-title`, and `site-title__line` do not exist.

- [ ] **Step 3: Add the title line content and renderer**

Add to `SITE_CONTENT` in `src/content.js`:

```js
titleLines: Object.freeze(['终南山下，', '活死人墓']),
```

Add above `renderPage` in `src/main.js`:

```js
export function renderSiteTitle(node, lines) {
  const titleLines = lines.map((text) => {
    const line = node.ownerDocument.createElement('span');
    line.className = 'site-title__line';
    line.textContent = text;
    return line;
  });
  node.replaceChildren(...titleLines);
}
```

Replace the current title assignment with:

```js
document.querySelectorAll('[data-site-title]').forEach((node) => {
  renderSiteTitle(node, SITE_CONTENT.titleLines);
});
```

In `index.html`, add `site-title` to the cover, transition, and homepage title classes and replace each plain title with:

```html
<span class="site-title__line">终南山下，</span>
<span class="site-title__line">活死人墓</span>
```

- [ ] **Step 4: Run the focused tests and verify they pass**

Run:

```powershell
npm test -- tests/content.test.js tests/structure.test.js
```

Expected: both files pass with no failures.

- [ ] **Step 5: Commit the structural change**

```powershell
git add src/content.js src/main.js index.html tests/content.test.js tests/structure.test.js
git commit -m "fix: unify display title structure"
```

---

### Task 2: Shared Typography and Position Anchors

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/cover.css`
- Modify: `src/styles/home.css`
- Modify: `src/styles/responsive.css`
- Modify: `index.html`
- Modify: `tests/styles.test.js`

**Interfaces:**
- Consumes: `.site-title`, `.site-title__line`, `.cover__title`, `.transition-title`, and `.home-hero__title` from Task 1.
- Produces: `--hero-copy-top` and `--hero-copy-width` layout tokens.
- Produces: `.hero-vertical` shared right-side typography contract.
- Produces: `.hero-eyebrow` shared pre-title spacing contract.

- [ ] **Step 1: Write the failing shared-style test**

Add to `tests/styles.test.js`:

```js
test('uses one title system and one hero anchor system', () => {
  assert.match(css, /\.site-title\s*\{[\s\S]*?font-family:\s*var\(--font-display\)/);
  assert.match(css, /\.site-title__line\s*\{[\s\S]*?display:\s*block/);
  assert.match(css, /--hero-copy-top:/);
  assert.match(css, /--hero-copy-width:/);
  assert.match(css, /\.hero-eyebrow\s*\{/);
  assert.match(css, /\.hero-vertical\s*\{/);
});
```

- [ ] **Step 2: Run the style test and verify the expected failure**

Run:

```powershell
node --test tests/styles.test.js
```

Expected: failure reporting the missing `.site-title` shared block.

- [ ] **Step 3: Add the shared layout tokens**

Add to `:root` in `src/styles/tokens.css`:

```css
--hero-copy-top: clamp(8.5rem, 25vh, 17rem);
--hero-copy-width: min(43rem, 49vw);
```

- [ ] **Step 4: Consolidate title typography**

In `src/styles/cover.css`, move the shared title appearance into:

```css
.site-title {
  margin: 0;
  color: transparent;
  background:
    repeating-linear-gradient(90deg, var(--gold-bright) 0 2px, transparent 2px 6px),
    linear-gradient(var(--paper), var(--gold));
  background-clip: text;
  -webkit-background-clip: text;
  font-family: var(--font-display);
  font-size: var(--title-size);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: 0.035em;
  filter: drop-shadow(0 0.1em 0.3em rgba(0, 0, 0, 0.4));
}

.site-title__line {
  display: block;
  width: max-content;
  white-space: nowrap;
}

.cover__title {
  --title-size: clamp(3.3rem, 7.4vw, 8.9rem);
}
```

Set `.home-hero__title` in `src/styles/home.css` to only the scene-specific value and focus behavior:

```css
.home-hero__title {
  --title-size: clamp(3.1rem, 5.65vw, 7rem);
}
```

Keep `.transition-title` responsible only for fixed positioning, visibility, pointer behavior, and `will-change`; it inherits typography from `.site-title`.

- [ ] **Step 5: Align both copy containers and both vertical labels**

Set both copy containers to the shared anchors:

```css
.cover__content,
.home-hero__copy {
  position: absolute;
  top: var(--hero-copy-top);
  left: var(--page-pad);
  width: var(--hero-copy-width);
}
```

Keep each container's existing `z-index`, opacity, and animation declarations, but remove cover vertical centering, homepage margin-based vertical positioning, and the homepage container's initial `translateX`; GSAP already animates the child details during entry.

Add `hero-eyebrow` to the cover eyebrow and homepage section kicker in `index.html`, then define the shared geometry while allowing scene-specific colors:

```css
.hero-eyebrow {
  margin: 0 0 clamp(1.1rem, 2.2vw, 2rem);
  font-family: var(--font-latin);
  font-size: clamp(0.64rem, 0.75vw, 0.78rem);
  line-height: 1;
  letter-spacing: 0.24em;
}
```

Add `hero-vertical` to both vertical copy elements in `index.html`, then define:

```css
.hero-vertical {
  position: absolute;
  top: 50%;
  right: clamp(1.1rem, 2.2vw, 2.5rem);
  margin: 0;
  font-family: var(--font-display);
  font-size: 0.83rem;
  letter-spacing: 0.42em;
  writing-mode: vertical-rl;
  transform: translateY(-50%);
}
```

Leave only color, z-index, and homepage reveal opacity on the scene-specific vertical classes.

- [ ] **Step 6: Preserve the fixed two-line layout on smaller screens**

In `src/styles/responsive.css`, set the mobile shared anchor and size without reintroducing automatic wrapping:

```css
@media (max-width: 640px) {
  :root {
    --hero-copy-top: clamp(7rem, 22vh, 12rem);
    --hero-copy-width: calc(100% - 2 * var(--page-pad));
  }

  .cover__title,
  .home-hero__title {
    --title-size: clamp(2.7rem, 13vw, 4.6rem);
  }
}
```

Remove the responsive `margin-top` overrides from `.home-hero__copy` and keep its width controlled by `--hero-copy-width`.

- [ ] **Step 7: Run the style and full unit suites**

Run:

```powershell
node --test tests/styles.test.js
npm test
```

Expected: all tests pass.

- [ ] **Step 8: Commit the shared style change**

```powershell
git add index.html src/styles/tokens.css src/styles/cover.css src/styles/home.css src/styles/responsive.css tests/styles.test.js
git commit -m "fix: align cover and home typography"
```

---

### Task 3: Browser Geometry and Transition Verification

**Files:**
- Modify: `tests/smoke.py`
- Update: `previews/desktop-cover.png`
- Update: `previews/desktop-transition.png`
- Update: `previews/desktop-home.png`
- Update: `previews/mobile-home.png`

**Interfaces:**
- Consumes: the three `.site-title` nodes and two `.hero-vertical` nodes from Tasks 1 and 2.
- Produces: automated evidence that font family, line count, left/top anchors, and transition line structure match.

- [ ] **Step 1: Add browser assertions before opening**

In `exercise_desktop`, immediately after `page.goto`, evaluate:

```python
title_contract = page.evaluate(
    """
    () => {
      const cover = document.querySelector('#cover-title');
      const home = document.querySelector('#home-heading');
      const coverRect = cover.getBoundingClientRect();
      const homeRect = home.getBoundingClientRect();
      const coverStyle = getComputedStyle(cover);
      const homeStyle = getComputedStyle(home);
      return {
        coverLines: cover.querySelectorAll('.site-title__line').length,
        homeLines: home.querySelectorAll('.site-title__line').length,
        sameFont: coverStyle.fontFamily === homeStyle.fontFamily,
        sameFill: coverStyle.backgroundImage === homeStyle.backgroundImage,
        leftDelta: Math.abs(coverRect.left - homeRect.left),
        topDelta: Math.abs(coverRect.top - homeRect.top),
      };
    }
    """
)
assert title_contract["coverLines"] == 2
assert title_contract["homeLines"] == 2
assert title_contract["sameFont"]
assert title_contract["sameFill"]
assert title_contract["leftDelta"] <= 1
assert title_contract["topDelta"] <= 2
```

During the existing transition checkpoint, add:

```python
assert page.locator("[data-transition-title] .site-title__line").count() == 2
```

- [ ] **Step 2: Run the browser check against the live preview**

Run:

```powershell
& 'C:\Users\asus-\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' `
  'F:\hugo\hexo\immersive\tests\smoke.py'
```

Expected: `Smoke checks passed` with no request, console, overflow, title-contract, or transition failures.

- [ ] **Step 3: Inspect all four regenerated screenshots**

Inspect:

```text
previews/desktop-cover.png
previews/desktop-transition.png
previews/desktop-home.png
previews/mobile-home.png
```

Acceptance: cover and homepage remain two lines; their left/top anchors align; the transition title keeps two lines; portal cards do not overlap the title; mobile has no horizontal overflow.

- [ ] **Step 4: Run final verification**

Run:

```powershell
git diff --check
npm test
npm run build
& 'C:\Users\asus-\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' `
  'F:\hugo\hexo\immersive\tests\smoke.py'
```

Expected: clean diff check, all Node tests pass, Vite build exits zero, and browser smoke checks pass.

- [ ] **Step 5: Commit browser verification and previews**

```powershell
git add tests/smoke.py previews/desktop-cover.png previews/desktop-transition.png previews/desktop-home.png previews/mobile-home.png
git commit -m "test: verify aligned title transition"
```
