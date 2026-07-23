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

test('keeps About inside the sticky journey with shared atmospheric layers', () => {
  const stickyStart = html.indexOf('class="scroll-story__sticky"');
  const prologueStart = html.indexOf('class="prologue-panel"');
  const aboutStart = html.indexOf('id="about-story"');
  const anchorStart = html.indexOf('class="scroll-story__anchor"');
  assert.ok(stickyStart >= 0 && stickyStart < prologueStart);
  assert.ok(prologueStart < aboutStart && aboutStart < anchorStart);
  for (const layer of ['cloud', 'petal', 'snow']) {
    assert.match(html, new RegExp(`data-atmosphere="${layer}"`));
  }
});

test('uses the approved prologue title, highlight, attribution, and portrait structure', () => {
  assert.equal((html.match(/class="prologue-panel__title-char"/g) ?? []).length, 6);
  assert.match(html, /aria-label="出名要趁早呀"/);
  assert.match(html, /class="prologue-panel__attribution"[^>]*data-prologue-attribution/);
  assert.match(html, /data-prologue-part="2"[\s\S]*prologue-panel__attribution/);
  assert.match(html, /<details class="about-story__portal-disclosure"/);
  assert.match(html, /class="about-story__portrait"/);
  assert.match(html, /src="\/images\/about-avatar\.webp"/);
  assert.match(html, /data-about-portals/);
  assert.doesNotMatch(html, /data-about-points/);
  assert.doesNotMatch(html, /about-story__statement/);
  assert.match(main, /prologue-panel__highlight/);
});

test('provides the approved prologue and original-blog about material', () => {
  assert.equal(SITE_CONTENT.prologueParts.length, 3);
  assert.match(SITE_CONTENT.prologueParts.join(''), /\u4ee5\u524d\u6211\u4e00\u76f4\u8fd9\u6837\u60f3\u7740/);
  assert.match(SITE_CONTENT.prologueParts.join(''), /\u8fdf\u4e86\u6765\u4e0d\u53ca\u4e86/);
  assert.equal(SITE_CONTENT.prologueAttribution, '\u2014\u2014\u5f20\u7231\u73b2\u300a\u4f20\u5947\u300b');
  assert.equal(
    SITE_CONTENT.prologueHighlight,
    '\u5475\uff0c\u51fa\u540d\u8981\u8d81\u65e9\u5440\uff01\u6765\u5f97\u592a\u665a\u7684\u8bdd\uff0c\u5feb\u4e50\u4e5f\u4e0d\u90a3\u4e48\u75db\u5feb\u3002',
  );
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

test('bridges the prologue into the selected warm About landscape', () => {
  const aboutRules = [...storyCss.matchAll(/\.about-story\s*\{([\s\S]*?)\}/g)];
  const aboutRule = aboutRules.find((rule) => /story-stage\.webp/.test(rule[1]))?.[1] ?? '';
  assert.match(aboutRule, /radial-gradient/);
  assert.match(aboutRule, /story-stage\.webp/);
  assert.doesNotMatch(aboutRule, /grid-template-columns/);
});

test('keeps the midpoint title on one responsive line', () => {
  const titleRule = storyCss.match(/\.story-world__focus-title\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.match(titleRule, /white-space:\s*nowrap/);
  assert.match(titleRule, /font-size:\s*clamp\(/);
});

test('draws the larger vivid-red prologue title down a curved vertical path', () => {
  const titleRule = storyCss.match(/\.prologue-panel__intro h2\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  const charRule = storyCss.match(/\.prologue-panel__title-char\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.match(titleRule, /color:\s*#c74438/);
  assert.match(titleRule, /font-size:\s*clamp\(4\.8rem/);
  assert.match(charRule, /transform:\s*translateX\(var\(--char-x\)\)/);
  for (let index = 1; index <= 6; index += 1) {
    assert.match(storyCss, new RegExp(`\\.prologue-panel__title-char:nth-child\\(${index}\\)`));
  }
});

test('indents prologue paragraphs and styles the exact semantic emphasis and attribution', () => {
  const quoteRule = storyCss.match(/\.prologue-panel__quote p\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  const highlightRule = storyCss.match(/\.prologue-panel__highlight\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  const attributionRule = storyCss.match(/\.prologue-panel__attribution\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.match(quoteRule, /text-indent:\s*2em/);
  assert.match(highlightRule, /background:/);
  assert.match(highlightRule, /font-weight:\s*700/);
  assert.match(attributionRule, /text-align:\s*right/);
});

test('keeps the highlight inline, the vertical title separated, and the attribution early', () => {
  const titleRule = storyCss.match(/\.prologue-panel__intro h2\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  const highlightRule = storyCss.match(/\.prologue-panel__highlight\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.doesNotMatch(main, /prologue-panel__highlight-break/);
  assert.match(highlightRule, /box-decoration-break:\s*clone/);
  assert.match(titleRule, /line-height:\s*0\.98/);
  assert.match(
    storyMotion,
    /\.to\(prologueAttribution,\s*\{[\s\S]*?autoAlpha:\s*1[\s\S]*?\},\s*0\.53\)/,
  );
});

test('styles one continuous atmospheric stage and circular About portrait', () => {
  for (const selector of ['.journey-atmosphere', '.journey-cloud', '.journey-petals', '.journey-snow']) {
    assert.ok(storyCss.includes(selector), `missing ${selector}`);
  }
  const aboutRule = storyCss.match(/\.about-story\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.match(aboutRule, /position:\s*absolute/);
  assert.match(aboutRule, /inset:\s*0/);
  assert.match(storyCss, /\.about-story__portrait\s*\{/);
  assert.match(storyCss, /\.about-story__portrait img\s*\{/);
  const portraitRule = storyCss.match(/\.about-story__portrait\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  const portraitImageRule = storyCss.match(/\.about-story__portrait img\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.match(portraitRule, /border-radius:\s*50%/);
  assert.match(portraitImageRule, /height:\s*100%/);
  assert.match(storyCss, /@keyframes about-cloud-orbit/);
});

test('keeps the About name modest and centered beneath the portrait', () => {
  const nameRule = storyCss.match(/\.about-story__name\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.match(nameRule, /font-size:\s*clamp\(1\.35rem,\s*1\.8vw,\s*1\.8rem\)/);
  assert.match(nameRule, /text-align:\s*center/);
  assert.match(nameRule, /white-space:\s*nowrap/);
});

test('reveals four avatar portals on desktop hover and touch-only native open state', () => {
  for (const selector of [
    '.about-story__portal-disclosure.is-portals-visible .about-story__portals',
    '.about-story__portal-disclosure:has(.about-story__portrait:focus-visible) .about-story__portals',
    '.about-story__portal-disclosure:not(.is-hover-mode)[open] .about-story__portals',
  ]) {
    assert.ok(storyCss.includes(selector), `missing ${selector}`);
  }
  assert.match(main, /data-about-portals/);
  assert.match(main, /about-story__portal/);
  assert.match(main, /classList\.add\('is-hover-mode'\)/);
  assert.match(main, /disclosure\.open\s*=\s*true/);
  assert.match(main, /addEventListener\('click',\s*preventDesktopToggle\)/);
});

test('keeps the four larger corner portals visible for one second after avatar hover', () => {
  const disclosureRule = storyCss.match(/\.about-story__portal-disclosure\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  const portalRule = storyCss.match(/\.about-story__portal\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.match(disclosureRule, /width:\s*clamp\(7\.5rem,\s*9vw,\s*9rem\)/);
  assert.match(portalRule, /width:\s*clamp\(17rem,\s*27vw,\s*31rem\)/);
  assert.match(portalRule, /aspect-ratio:\s*16\s*\/\s*9/);
  assert.match(main, /ABOUT_PORTAL_VISIBLE_MS\s*=\s*1_000/);
  assert.match(main, /setTimeout\([\s\S]*ABOUT_PORTAL_VISIBLE_MS/);
  assert.match(main, /classList\.add\('is-portals-visible'\)/);
  assert.match(main, /classList\.remove\('is-portals-visible'\)/);
  assert.match(main, /addEventListener\('pointerenter',\s*showTimedPortals\)/);
});

test('gives visible desktop portals a slow looping drift instead of requiring a click', () => {
  assert.match(storyCss, /@keyframes about-portal-drift/);
  assert.match(
    storyCss,
    /\.about-story__portal-disclosure\.is-portals-visible \.about-story__portal[\s\S]*animation:\s*about-portal-drift/,
  );
  assert.match(storyCss, /--drift-duration:\s*8\.6s/);
  assert.match(storyCss, /--drift-duration:\s*10\.4s/);
});

test('links the centered profile to GitHub, Douban, and NetEase Cloud with icons only', () => {
  assert.match(html, /href="https:\/\/github\.com\/dying4ever"/);
  assert.match(html, /href="https:\/\/www\.douban\.com\/people\/244425591\/"/);
  assert.match(html, /href="https:\/\/music\.163\.com\/#\/user\/home\?id=1711653418"/);
  assert.doesNotMatch(html, /mailto:/);
  const socials = html.match(/<nav class="about-story__socials"[\s\S]*?<\/nav>/)?.[0] ?? '';
  assert.equal((socials.match(/<svg/g) ?? []).length, 3);
  for (const label of ['GitHub', '豆瓣', '网易云音乐']) {
    assert.match(socials, new RegExp(`aria-label="${label}"`));
  }
});

test('places two editable personal notes in the marked lower areas', () => {
  assert.match(html, /data-about-note="0"/);
  assert.match(html, /data-about-note="1"/);
  assert.match(main, /SITE_CONTENT\.aboutNotes/);
  assert.match(storyCss, /\.about-story__note--identity/);
  assert.match(storyCss, /\.about-story__note--site/);
});

test('copies the legacy portrait into the new project without bloating it', async () => {
  const portrait = await stat(new URL('../public/images/about-avatar.webp', import.meta.url));
  assert.ok(portrait.size > 0);
  assert.ok(portrait.size < 100_000, `about portrait is ${portrait.size} bytes`);
});

test('extends one scroll timeline through About and all atmospheric layers', () => {
  for (const query of [
    "querySelector('.about-story')",
    "querySelectorAll('.prologue-panel__title-char')",
    "querySelectorAll('.journey-cloud')",
    "querySelector('[data-atmosphere=\"petal\"]')",
    "querySelector('[data-atmosphere=\"snow\"]')",
  ]) {
    assert.ok(storyMotion.includes(query), `missing motion query ${query}`);
  }
  assert.match(storyMotion, /\.to\(aboutStory,\s*\{[\s\S]*?autoAlpha:\s*1[\s\S]*?\}/);
  assert.match(storyMotion, /\.to\(aboutStoryDetails,\s*\{[\s\S]*?stagger:/);
});

test('crossfades the prologue directly into About without flashing the old story world', () => {
  assert.doesNotMatch(
    storyMotion,
    /\.to\(storyWorld,\s*\{\s*autoAlpha:\s*1,\s*scale:\s*1,[\s\S]*?\},\s*0\.92\)/,
  );
  assert.match(storyMotion, /\.to\(prologuePanel,\s*\{[\s\S]*?autoAlpha:\s*0[\s\S]*?\},\s*'about-bridge'/);
  assert.match(storyMotion, /\.to\(aboutStory,\s*\{[\s\S]*?autoAlpha:\s*1[\s\S]*?\},\s*'about-bridge'/);
});

test('stacks all four scenes when reduced motion disables the cinematic timeline', () => {
  const storyRule = storyCss.match(/\.is-story-static \.scroll-story\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  const stickyRule = storyCss.match(/\.is-story-static \.scroll-story__sticky\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.match(storyRule, /height:\s*auto/);
  assert.match(stickyRule, /position:\s*relative/);
  assert.match(stickyRule, /overflow:\s*visible/);
  assert.match(storyCss, /\.is-story-static \.about-story/);
});
