import test from 'node:test';
import assert from 'node:assert/strict';
import { SITE_CONTENT, getBlogUrl, getPortalItems } from '../src/content.js';

test('uses the approved Chinese identity', () => {
  assert.equal(SITE_CONTENT.title, '终南山下，活死人墓');
  assert.equal(SITE_CONTENT.subtitle, '山云开卷，风雨入页');
  assert.deepEqual(SITE_CONTENT.titleLines, ['终南山下，', '活死人墓']);
});

test('exposes four real blog portals', () => {
  const portals = getPortalItems('http://localhost:4173');
  assert.deepEqual(portals.map((item) => item.id), [
    'notes',
    'film',
    'life',
    'projects',
  ]);
  assert.deepEqual(portals.map((item) => new URL(item.href).pathname), [
    '/notes/',
    '/film/',
    '/life/',
    '/projects/',
  ]);
});

test('normalizes blog paths', () => {
  assert.equal(
    getBlogUrl('about', 'http://localhost:5000/'),
    'http://localhost:5000/about/',
  );
  assert.equal(
    getBlogUrl('archives', '/', 'https://www.dying4ever.cyou/'),
    'https://www.dying4ever.cyou/archives/',
  );
});

test('uses standalone Markdown overview content', () => {
  assert.match(SITE_CONTENT.aboutSummary, /曾阿牛/);
  assert.equal(SITE_CONTENT.logEntries.length, 3);
  assert.equal(SITE_CONTENT.logEntries[0].date, '2026.07.16');
  assert.match(SITE_CONTENT.logEntries[0].title, /独立|Markdown/);
  assert.deepEqual(
    SITE_CONTENT.categories.map((item) => item.id),
    ['notes', 'film', 'life', 'projects'],
  );
});

test('exposes the exact prologue emphasis and concise About points', () => {
  assert.equal(
    SITE_CONTENT.prologueHighlight,
    '呵，出名要趁早呀！来得太晚的话，快乐也不那么痛快。',
  );
  assert.equal(SITE_CONTENT.aboutPoints.length, 2);
  assert.match(SITE_CONTENT.aboutPoints[0], /曾阿牛/);
  assert.match(SITE_CONTENT.aboutPoints[1], /蛛儿/);
});

test('keeps all four category definitions available for the avatar disclosure', () => {
  assert.deepEqual(
    getPortalItems('http://localhost:4173/').map(({ id, label }) => ({ id, label })),
    [
      { id: 'notes', label: 'NOTES' },
      { id: 'film', label: 'FILM' },
      { id: 'life', label: 'LIFE' },
      { id: 'projects', label: 'SOME PROJECTS' },
    ],
  );
});

test('keeps two editable About notes for the quiet background state', () => {
  assert.equal(SITE_CONTENT.aboutNotes.length, 2);
  assert.match(SITE_CONTENT.aboutNotes[0], /曾阿牛/);
  assert.match(SITE_CONTENT.aboutNotes[1], /记录|博客|文字/);
});
