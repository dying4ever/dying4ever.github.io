import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { SITE_CONTENT } from '../src/content.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const tokens = await readFile(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const coverCss = await readFile(new URL('../src/styles/cover.css', import.meta.url), 'utf8');
const storyCss = await readFile(new URL('../src/styles/scroll-story.css', import.meta.url), 'utf8');
const storyMotion = await readFile(new URL('../src/scroll-story.js', import.meta.url), 'utf8');
const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');

test('serves the approved warm mountain background as a lightweight WebP', async () => {
  const asset = await stat(new URL('../public/images/scroll-mountain.webp', import.meta.url));
  assert.ok(asset.size < 900_000, `scroll mountain background is ${asset.size} bytes`);
});

test('serves three harmonized story backgrounds in scroll order', async () => {
  for (const name of ['story-path.webp', 'story-river.webp', 'story-stage.webp']) {
    const asset = await stat(new URL(`../public/images/${name}`, import.meta.url));
    assert.ok(asset.size < 900_000, `${name} is ${asset.size} bytes`);
  }
  assert.match(storyCss, /story-path\.webp[\s\S]*story-river\.webp[\s\S]*story-stage\.webp/);
});

test('keeps QuanHeng for display text and uses FangSong for subtitle-sized reading text', () => {
  assert.match(tokens, /--font-cn:\s*"QuanHeng"/);
  assert.match(tokens, /--font-display:\s*var\(--font-cn\)/);
  assert.match(tokens, /--font-reading:\s*"STFangsong",\s*"FangSong"/);
  assert.match(tokens, /--font-body:\s*var\(--font-reading\)/);
  assert.match(coverCss, /\.cover__subtitle[\s\S]*?font-family:\s*var\(--font-reading\)/);
});

test('contains the cinematic mountain, cloud, bird, prologue, and about scenes', () => {
  for (const id of ['scroll-story', 'prologue', 'about-story']) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
  for (const marker of [
    'data-story-stage',
    'data-story-landscape',
    'data-story-cloud',
    'data-bird-flock',
    'data-prologue-part',
  ]) {
    assert.match(html, new RegExp(marker), `missing ${marker}`);
  }
});

test('provides the approved prologue and original-blog about material', () => {
  assert.equal(SITE_CONTENT.prologueParts.length, 3);
  assert.match(SITE_CONTENT.prologueParts.join(''), /\u4ee5\u524d\u6211\u4e00\u76f4\u8fd9\u6837\u60f3\u7740/);
  assert.match(SITE_CONTENT.prologueParts.join(''), /\u8fdf\u4e86\u6765\u4e0d\u53ca\u4e86/);
  assert.equal(SITE_CONTENT.prologueAttribution, '\u2014\u2014\u5f20\u7231\u73b2\u300a\u4f20\u5947\u300b');
  assert.match(SITE_CONTENT.aboutStory, /\u66fe\u963f\u725b/);
});

test('loads dedicated cinematic scroll-story styles', () => {
  assert.match(main, /styles\/scroll-story\.css/);
});

test('keeps the midpoint typography unboxed', () => {
  const focusRule = storyCss.match(/\.story-world__focus\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.match(focusRule, /background:\s*transparent/);
  assert.match(focusRule, /box-shadow:\s*none/);
  assert.doesNotMatch(focusRule, /border:\s*1px/);
});

test('carries the river landscape into the prologue crossfade', () => {
  const prologueRules = [...storyCss.matchAll(/\.prologue-panel\s*\{([\s\S]*?)\}/g)];
  assert.ok(
    prologueRules.some((rule) => /url\("\/images\/story-river\.webp"\)/.test(rule[1])),
    'prologue is missing the river image',
  );
});

test('uses an about-like split prologue with readable non-overlapping paragraphs', () => {
  assert.match(html, /prologue-panel__intro/);
  assert.match(html, /prologue-panel__body/);
  const quoteRule = storyCss.match(/\.prologue-panel__quote p\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.match(quoteRule, /color:\s*rgba\(235,\s*218,\s*183,\s*0\.96\)/);
  assert.match(quoteRule, /text-shadow:/);
  assert.doesNotMatch(quoteRule, /position:\s*absolute/);
  assert.doesNotMatch(storyMotion, /autoAlpha:\s*0\.38/);
  assert.match(storyMotion, /autoAlpha:\s*0\.78/);
});

test('dissolves line art before the sticky scene releases into the about section', () => {
  assert.match(storyMotion, /querySelectorAll\('\.story-world__ink'\)/);
  assert.match(storyMotion, /storyStripes,\s*\.\.\.storyInk/);
  assert.match(storyMotion, /autoAlpha:\s*0/);
});

test('bridges dark prologue through a warm about landscape into the dark overview', () => {
  const aboutRule = storyCss.match(/\.about-story\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.match(aboutRule, /linear-gradient\(180deg/);
  assert.match(aboutRule, /#211b14\s+0%/);
  assert.match(aboutRule, /#cbb895\s+18%/);
  assert.match(aboutRule, /#0c0d0c\s+100%/);
  assert.doesNotMatch(aboutRule, /box-shadow:\s*inset/);
  assert.match(aboutRule, /story-stage\.webp/);
});
