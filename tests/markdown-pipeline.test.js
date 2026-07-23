import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { parseDocument } from '../src/content/frontmatter.js';
import { collectTaxonomy, getArticleRoute } from '../src/content/routes.js';

const recentModuleUrl = new URL('../src/content/recent.js', import.meta.url);
const recentSource = await readFile(recentModuleUrl, 'utf8').catch(() => '');

test('preserves original front matter and builds the dated route', () => {
  const doc = parseDocument(
    `---
title: 示例
date: 2025-07-17 19:41:51
sticky: 1
categories:
  - cpp
tags:
  - cpp
desc: 示例简介
disableNunjucks: true
---
正文`,
    'content/notes/cpp/chrono.md',
    'notes',
  );

  assert.equal(doc.title, '示例');
  assert.equal(doc.date, '2025-07-17 19:41:51');
  assert.equal(doc.sticky, 1);
  assert.deepEqual(doc.categories, ['cpp']);
  assert.deepEqual(doc.tags, ['cpp']);
  assert.equal(doc.desc, '示例简介');
  assert.equal(doc.section, 'notes');
  assert.equal(doc.body, '正文');
  assert.equal(getArticleRoute(doc), '/2025/07/17/chrono/');
});

test('groups original categories beneath their content sections', () => {
  const documents = [
    parseDocument(
      '---\ntitle: A\ndate: 2025-01-01\ncategories: [cpp]\ntags: [C++]\n---\nA',
      'content/notes/cpp/a.md',
      'notes',
    ),
    parseDocument(
      '---\ntitle: B\ndate: 2025-02-01\ncategories: [影评]\ntags: [电影]\n---\nB',
      'content/film/b.md',
      'film',
    ),
  ];

  const taxonomy = collectTaxonomy(documents);

  assert.equal(taxonomy.sections.notes.length, 1);
  assert.equal(taxonomy.sections.film.length, 1);
  assert.equal(taxonomy.sections.life.length, 0);
  assert.equal(taxonomy.categories.cpp.length, 1);
  assert.equal(taxonomy.tags['C++'].length, 1);
  assert.equal(taxonomy.archives['2025-02'].length, 1);
});

test('reports the source file when required front matter is missing', () => {
  assert.throws(
    () => parseDocument('---\ntitle: 缺少日期\n---\n正文', 'content/notes/broken.md', 'notes'),
    /content\/notes\/broken\.md.*date/i,
  );
});

test('selects newest recent entries only from film, life, and projects', async () => {
  assert.notEqual(recentSource, '', 'recent content selector is missing');
  const { selectRecentEntries } = await import(recentModuleUrl);
  const documents = [
    { title: '笔记', section: 'notes', timestamp: 50, date: '2026-07-17', route: '/notes/' },
    { title: '电影二', section: 'film', timestamp: 40, date: '2026-07-16', route: '/film-2/' },
    { title: '生活', section: 'life', timestamp: 30, date: '2026-07-15', route: '/life/' },
    { title: '项目', section: 'projects', timestamp: 20, date: '2026-07-14', route: '/project/' },
    { title: '电影一', section: 'film', timestamp: 10, date: '2026-07-13', route: '/film-1/' },
  ];

  assert.deepEqual(selectRecentEntries(documents, 3), [
    { title: '电影二', section: 'film', date: '2026-07-16', route: '/film-2/' },
    { title: '生活', section: 'life', date: '2026-07-15', route: '/life/' },
    { title: '项目', section: 'projects', date: '2026-07-14', route: '/project/' },
  ]);
});
