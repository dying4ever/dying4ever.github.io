import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const project = new URL('../', import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, project), 'utf8');
}

test('provides standalone Markdown-backed About, Projects, Friends and changelog pages', async () => {
  const pages = new Map([
    ['content/pages/about.md', '关于我'],
    ['content/pages/projects.md', 'Projects'],
    ['content/pages/friends.md', '友链'],
    ['content/pages/changelog.md', '建站日志'],
  ]);

  for (const [path, title] of pages) {
    const markdown = await read(path);
    assert.match(markdown, /^---[\s\S]*?---/);
    assert.match(markdown, new RegExp(`title:\\s*${title}`, 'i'));
  }
});

test('preserves the personal About source and readable Chinese sections', async () => {
  const about = await read('content/pages/about.md');
  assert.match(about, /以前我一直这样想着/);
  assert.match(about, /曾阿牛/);
  assert.match(about, /自此，我要写技术，我要写电影/);
  assert.match(about, /^# 关于我$/m);
  assert.match(about, /^## 关于这个博客$/m);
});

test('keeps useful project and friend content in the new project', async () => {
  const projects = await read('content/pages/projects.md');
  const friends = await read('content/pages/friends.md');
  assert.match(projects, /Robotics/);
  assert.match(projects, /Blog System/);
  assert.match(friends, /^# 友链$/m);
  assert.match(friends, /GitHub|邮箱|Email/);
});

test('records the standalone Markdown release in the local changelog', async () => {
  const buildLog = await read('content/pages/changelog.md');
  assert.match(buildLog, /^# 2026-07-16$/m);
  assert.match(buildLog, /独立 Markdown/);
  assert.match(buildLog, /131 篇/);
  assert.match(buildLog, /分类|归档/);
});

test('uses FangSong for reading text while preserving the display font for large headings', async () => {
  const styles = await read('src/styles/content-site.css');
  assert.match(styles, /--content-serif:\s*"STFangsong"/);
  assert.match(styles, /font-family:\s*var\(--content-serif\)/);
  assert.match(styles, /--content-display:\s*"Archive Display"/);
  assert.match(styles, /\.content-masthead h1[\s\S]*font-family:\s*var\(--content-display\)/);
  assert.match(styles, /\.markdown-body h1,[\s\S]*font-family:\s*var\(--content-serif\)/);
});
