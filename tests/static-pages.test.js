import test from 'node:test';
import assert from 'node:assert/strict';

import { collectLocalReferences, renderMarkdownWithToc } from '../src/content/markdown.js';
import { renderArticlePage } from '../src/templates/article-page.js';
import { renderListPage } from '../src/templates/list-page.js';

const fixtureDocument = Object.freeze({
  title: '山中一页',
  date: '2025-07-17 19:41:51',
  dateParts: { year: '2025', month: '07', day: '17' },
  timestamp: Date.UTC(2025, 6, 17, 19, 41, 51),
  categories: ['cpp'],
  tags: ['记录'],
  sticky: 0,
  desc: '一篇测试文章',
  body: '# 第一章\n\n![](山中一页.assets/a.png)\n\n```js\nconst answer = 42;\n```',
  sourcePath: 'content/notes/cpp/山中一页.md',
  section: 'notes',
  slug: '山中一页',
  route: '/2025/07/17/山中一页/',
});

test('rewrites sibling assets, adds lazy loading and highlights code', () => {
  const result = renderMarkdownWithToc(fixtureDocument.body, {
    assetBase: fixtureDocument.route,
  });

  assert.match(result.html, /src="\/2025\/07\/17\/山中一页\/山中一页\.assets\/a\.png"/);
  assert.match(result.html, /loading="lazy"/);
  assert.match(result.html, /class="hljs language-js"/);
  assert.deepEqual(result.toc.map((item) => item.text), ['第一章']);
});

test('article template contains masthead metadata, TOC and parchment body', () => {
  const rendered = renderMarkdownWithToc(fixtureDocument.body, {
    assetBase: fixtureDocument.route,
  });
  const html = renderArticlePage({
    document: fixtureDocument,
    rendered,
    previous: null,
    next: null,
  });

  assert.match(html, /class="content-masthead"/);
  assert.match(html, /class="content-nav"/);
  assert.match(html, /class="article-toc"/);
  assert.match(html, /class="article-paper"/);
  assert.match(html, /<time[^>]*>2025-07-17/);
  assert.match(html, /href="\/categories\/cpp\/"/);
});

test('section template renders an intentional empty state', () => {
  const html = renderListPage({
    title: 'FILM',
    eyebrow: '光影',
    description: '电影与观看记录',
    documents: [],
    route: '/film/',
  });

  assert.match(html, /class="content-masthead"/);
  assert.match(html, /class="empty-state"/);
  assert.match(html, /此页正在等待第一篇记录/);
});

test('collects balanced local asset paths while ignoring fenced examples', () => {
  const markdown = [
    '![](图像处理(2-1_几何变换).assets/结果图.png)',
    '[附件](./资料/说明.pdf)',
    '```md',
    '![](文章名.assets/图片名)',
    '```',
    '[远程链接](https://example.com/file.pdf)',
  ].join('\n');

  assert.deepEqual(collectLocalReferences(markdown), [
    '图像处理(2-1_几何变换).assets/结果图.png',
    './资料/说明.pdf',
  ]);
});

test('uses visible heading text in the TOC instead of exposing legacy HTML tags', () => {
  const result = renderMarkdownWithToc(
    '# <span style="color: red"><span>π0: A Vision-Language-Action Flow Model</span></span>',
  );

  assert.deepEqual(result.toc.map((item) => item.text), [
    'π0: A Vision-Language-Action Flow Model',
  ]);
  assert.doesNotMatch(result.toc[0].text, /<span/);
});
