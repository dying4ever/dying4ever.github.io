import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function readHtml() {
  return readFile(new URL('../index.html', import.meta.url), 'utf8');
}

test('contains all three scenes and an accessible entry control', async () => {
  const html = await readHtml();
  for (const id of ['cover', 'home', 'overview', 'portal-grid', 'replay-opening']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /aria-label="进入博客主页"/);
});

test('contains static fallback routes', async () => {
  const html = await readHtml();
  for (const route of ['/about/', '/categories/', '/archives/', '/projects/']) {
    assert.ok(html.includes(route), `missing ${route}`);
  }
});
