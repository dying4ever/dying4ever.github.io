import test from 'node:test';
import assert from 'node:assert/strict';
import { SITE_CONTENT, getBlogUrl, getPortalItems } from '../src/content.js';

test('uses the approved Chinese identity', () => {
  assert.equal(SITE_CONTENT.title, '终南山下，活死人墓');
  assert.equal(SITE_CONTENT.subtitle, '山云开卷，风雨入页');
});

test('exposes four real blog portals', () => {
  assert.deepEqual(getPortalItems('http://localhost:5000').map((item) => item.id), [
    'notes',
    'film',
    'life',
    'projects',
  ]);
  assert.equal(
    getPortalItems('http://localhost:5000')[3].href,
    'http://localhost:5000/projects/',
  );
});

test('normalizes blog paths', () => {
  assert.equal(
    getBlogUrl('about', 'http://localhost:5000/'),
    'http://localhost:5000/about/',
  );
});

test('uses real Hexo-derived overview content', () => {
  assert.match(SITE_CONTENT.aboutSummary, /曾阿牛/);
  assert.equal(SITE_CONTENT.logEntries.length, 3);
  assert.deepEqual(
    SITE_CONTENT.categories.map((item) => item.id),
    ['notes', 'film', 'life', 'projects'],
  );
});
