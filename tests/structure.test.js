import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function readHtml() {
  return readFile(new URL('../index.html', import.meta.url), 'utf8');
}

test('contains all three scenes and an accessible entry control', async () => {
  const html = await readHtml();
  for (const id of ['cover', 'home', 'overview', 'recent', 'replay-opening']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /aria-label="进入博客主页"/);
});

test('replaces the first-screen category collage with a recent article list', async () => {
  const html = await readHtml();
  const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
  const heroStart = html.indexOf('class="home-hero"');
  const heroEnd = html.indexOf('class="story-world"');
  const hero = html.slice(heroStart, heroEnd);
  assert.match(hero, /<h3[^>]*>最近<\/h3>/);
  assert.match(hero, /data-recent-list/);
  assert.doesNotMatch(hero, /id="portal-grid"/);
  assert.match(main, /recent\.json/);
  assert.match(main, /createElement\('time'\)/);
});

test('contains static fallback routes', async () => {
  const html = await readHtml();
  for (const route of ['/about/', '/categories/', '/archives/', '/projects/']) {
    assert.ok(html.includes(route), `missing ${route}`);
  }
});

test('contains shared transition layers between cover and homepage', async () => {
  const html = await readHtml();
  assert.match(html, /data-transition-title/);
  assert.match(html, /data-cover-landscape/);
  assert.match(html, /home-fog--back/);
  assert.match(html, /home-fog--front/);
});

test('renders every display title as the same two fixed lines', async () => {
  const html = await readHtml();
  assert.equal((html.match(/class="site-title(?:\s|")/g) ?? []).length, 3);
  assert.equal((html.match(/class="site-title__line"/g) ?? []).length, 6);
});

test('uses a native avatar disclosure so categories work beyond mouse hover', async () => {
  const html = await readHtml();
  assert.match(html, /<details class="about-story__portal-disclosure"/);
  assert.match(html, /<summary class="about-story__portrait"/);
  assert.match(html, /<nav[^>]*data-about-portals/);
});
