# Continuous Scroll Prologue and About Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing homepage, landscape interlude, prologue, and About section into one continuous scroll-driven scene while applying the approved prologue typography, atmospheric particles, and portrait treatment.

**Architecture:** Keep the current Vite/vanilla/GSAP stack and make `#scroll-story` the single four-scene desktop stage. Move About into the sticky stage, add one shared atmospheric layer, render the highlighted prose and curved title semantically, and preserve the existing static stacking fallback for mobile, coarse pointers, and reduced motion.

**Tech Stack:** Semantic HTML, CSS custom properties and keyframes, vanilla JavaScript, GSAP 3 + ScrollTrigger, Node test runner, Playwright smoke tests.

## Global Constraints

- Modify only `F:/hugo/hexo/immersive`; read but do not modify the old Hexo project.
- Keep all existing Markdown routes and the 131-note content source unchanged.
- Do not add dependencies or fetch external image assets.
- Copy `F:/hugo/hexo/blog/source/_data/assets/head.webp` into the new project's public assets without changing the source.
- Preserve mobile, coarse-pointer, and `prefers-reduced-motion` fallbacks.
- Do not commit or deploy until the user reviews the local result.

---

### Task 1: Lock the Approved Content and Semantic Structure

**Files:**
- Modify: `tests/scroll-story.test.js`
- Modify: `tests/content.test.js`
- Modify: `index.html`
- Modify: `src/content.js`
- Modify: `src/main.js`

**Interfaces:**
- Produces: `SITE_CONTENT.prologueHighlight: string`.
- Produces: `SITE_CONTENT.aboutPoints: readonly string[]`.
- Produces: `renderProloguePart(node, text, highlight): void`.
- Produces: `.prologue-panel__title-char`, `.prologue-panel__highlight`, `.prologue-panel__attribution`, `.journey-atmosphere`, and `.about-story__portrait` DOM hooks.

- [x] Add failing tests asserting the exact highlight including “呵，”, six title character spans, the attribution inside the quote, three atmosphere groups, About inside the sticky stage, the portrait path, and two About points.
- [x] Run `node --test tests/content.test.js tests/scroll-story.test.js` and verify failures are caused by the missing content and structure.
- [x] Add `prologueHighlight` and `aboutPoints` to `SITE_CONTENT`, add a text-node/`mark` renderer for the matching substring, and render About points without using raw content HTML.
- [x] Restructure `index.html`: make the midpoint title non-wrapping-ready; replace the prologue title with accessible per-character spans; remove the intro description; move attribution below the quote paragraphs; add the atmosphere layer; move About into the sticky stage; add portrait and About point list.
- [x] Run the focused tests and verify they pass.

### Task 2: Build the Curved Prologue and Continuous Visual Stage

**Files:**
- Modify: `tests/scroll-story.test.js`
- Modify: `src/styles/scroll-story.css`
- Modify: `src/styles/responsive.css`
- Copy: `F:/hugo/hexo/blog/source/_data/assets/head.webp` to `public/images/about-avatar.webp`

**Interfaces:**
- Consumes: the Task 1 DOM hooks.
- Produces: four absolute desktop scenes in one sticky stage and natural-flow static scenes below `769px`/coarse pointer.

- [x] Add failing CSS contract tests for one-line midpoint copy, vertical curved character offsets, vivid red title, `2em` paragraph indentation, semantic highlight style, right-aligned attribution, atmospheric layers, and portrait framing.
- [x] Run `node --test tests/scroll-story.test.js` and verify the new style assertions fail.
- [x] Update `scroll-story.css`: extend story height; size the midpoint title responsively; lay out the six title characters along a restrained curve; style the highlight and attribution; make About an absolute fourth scene; add continuous dark-to-light-to-dark stage backgrounds and portrait composition.
- [x] Add cloud, petal, and snow shapes using CSS gradients/clip paths and animation only on `transform`/`opacity`.
- [x] Update mobile/coarse-pointer rules so all four scenes return to normal document flow, the title remains readable, the portrait fits, and particles are reduced; stop particle animation under reduced motion.
- [x] Copy the portrait asset, confirm its byte size is nonzero, run the focused test, and verify it passes.

### Task 3: Extend the Scroll Timeline Through About

**Files:**
- Modify: `tests/scroll-story.test.js`
- Modify: `src/scroll-story.js`

**Interfaces:**
- Consumes: `.about-story`, `.journey-cloud`, `.journey-petal`, `.journey-snow`, and the existing prologue nodes.
- Produces: one GSAP timeline whose final stable scene is About before sticky release.

- [x] Add failing motion contract tests that require About and each atmosphere group to be queried, prohibit the old prologue-to-story-world flashback, and require a final About reveal.
- [x] Run `node --test tests/scroll-story.test.js` and confirm the missing About timeline behavior fails.
- [x] Initialize About and particle layers with GSAP, revise the timing labels so the prologue stays over the river, crossfade it directly into About, and keep About visible through the end of the sticky range.
- [x] Stagger the six title characters, drift petals during the prologue, introduce snow during the bridge, and retain slow cloud movement across both scenes.
- [x] Run the focused test and then `npm test`; fix only regressions caused by this change.

### Task 4: Browser Verification and Local Preview

**Files:**
- Modify: `tests/smoke.py`
- Update generated previews under `previews/` only as local review artifacts.

**Interfaces:**
- Verifies desktop, mobile, content accuracy, geometry, asset loading, no horizontal overflow, and no browser errors.

- [x] Add failing Playwright checks for the single-line midpoint title, exact highlighted sentence, six curved title characters, `2em` indentation, right-column attribution, loaded portrait, and visible About at late story progress.
- [x] Start the existing local server with `npm run dev` if port `4173` is not already serving the project.
- [x] Run `python tests/smoke.py`, inspect the expected failures, then adjust implementation rather than weakening assertions.
- [x] Re-run `git diff --check`, `npm test`, `npm run build`, and `python tests/smoke.py` until all exit zero.
- [x] Capture desktop and mobile review screenshots, inspect them visually, and report the local preview URL and exact editable source locations to the user. Do not commit or deploy.
