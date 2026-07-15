import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const files = await Promise.all([
  readFile(new URL('../src/styles/tokens.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/base.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/cover.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/home.css', import.meta.url), 'utf8'),
]);
const css = files.join('\n');

test('defines the approved palette and curtain easing', () => {
  for (const value of ['#0d0d0c', '#243746', '#b79a68', '#ddd4c0', '#8f2f28']) {
    assert.ok(css.includes(value), `missing ${value}`);
  }
  assert.match(css, /--ease-curtain:/);
});

test('styles the opening layers and visible scene states', () => {
  for (const selector of ['.cover__panel', '.fog--back', '.rain', '.curtain--left', '.is-open']) {
    assert.ok(css.includes(selector), `missing ${selector}`);
  }
});

test('keeps cover and home in one visual space during the transition', () => {
  for (const selector of ['.cover__landscape', '.transition-title', '.home-fog', '.is-transitioning']) {
    assert.ok(css.includes(selector), `missing ${selector}`);
  }
  assert.ok(css.includes('/images/mountain-cover.webp'));
  assert.ok(!css.includes('/images/mountain-cover.png'));
});
