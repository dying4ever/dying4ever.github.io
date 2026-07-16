import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');

async function walkMarkdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return walkMarkdown(fullPath);
      return entry.isFile() && entry.name.endsWith('.md') ? [fullPath] : [];
    }),
  );
  return nested.flat();
}

test('contains all 131 migrated notes', async () => {
  const files = await walkMarkdown(path.join(projectRoot, 'content', 'notes'));
  assert.equal(files.length, 131);
});

test('creates standalone page Markdown and future section folders', async () => {
  const required = [
    'content/pages/about.md',
    'content/pages/friends.md',
    'content/pages/changelog.md',
    'content/pages/projects.md',
    'content/film/.gitkeep',
    'content/life/.gitkeep',
    'content/projects/.gitkeep',
  ];

  await Promise.all(required.map((relativePath) => access(path.join(projectRoot, relativePath))));
  const about = await readFile(path.join(projectRoot, 'content/pages/about.md'), 'utf8');
  assert.match(about, /title:\s*关于我/);
  assert.match(about, /曾阿牛/);
});

test('keeps article-side asset folders next to migrated Markdown', async () => {
  const markdownPath = path.join(projectRoot, 'content/notes/ai视频/围攻光明顶.md');
  const source = await readFile(markdownPath, 'utf8');
  const relativeImage = source.match(/!\[[^\]]*\]\(([^)]+)\)/)?.[1];
  assert.ok(relativeImage, 'expected a relative Markdown image');
  await access(path.resolve(path.dirname(markdownPath), relativeImage));
});
