import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const appRoot = new URL('../', import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, appRoot), 'utf8');
}

test('keeps every homepage portal on the standalone origin', async () => {
  const html = await read('index.html');
  const content = await read('src/content.js');
  assert.match(html, /href="\/about\/"/);
  assert.match(html, /href="\/categories\/"/);
  assert.match(html, /href="\/archives\/"/);
  assert.match(html, /href="\/legacy\/"/);
  assert.match(content, /getBlogUrl\('projects'/);
  assert.doesNotMatch(`${html}\n${content}`, /localhost:5000|data-blog-base="http/);
});

test('offers the preserved Hexo site from every navigation', async () => {
  const html = await read('index.html');
  const shell = await read('src/templates/site-shell.js');
  assert.match(html, />旧版<\/a>/);
  assert.match(shell, /\['旧版', '\/legacy\/'\]/);
});

test('uses a standalone build and never invokes Hexo', async () => {
  const packageJson = JSON.parse(await read('package.json'));
  assert.equal(packageJson.scripts.build, 'node scripts/build-site.mjs');
  assert.equal(packageJson.scripts.dev, 'node scripts/dev-site.mjs');
  await access(new URL('scripts/build-site.mjs', appRoot));
  const script = await read('scripts/build-site.mjs');
  assert.match(script, /renderStaticPages/);
  assert.match(script, /vite/);
  assert.doesNotMatch(`${JSON.stringify(packageJson.scripts)}\n${script}`, /hexo|blogRoot|\.\.\/blog/i);
});

test('development config has no Hexo proxy', async () => {
  const config = await read('vite.config.js');
  assert.doesNotMatch(config, /127\.0\.0\.1:5000|proxyToHexo|hexoTarget/);
});

test('serializes live Markdown rebuilds so preview routes cannot be partially deleted', async () => {
  const script = await read('scripts/dev-site.mjs');
  assert.match(script, /let rebuildQueue\s*=\s*Promise\.resolve\(\)/);
  assert.match(script, /rebuildQueue\s*=\s*rebuildQueue\.then\(rebuildContent\)/);
});

test('documents the independent Markdown workflow and keeps the custom domain in production', async () => {
  const readme = await read('README.md');
  const cname = await read('public/CNAME');
  assert.match(readme, /content\/notes/);
  assert.match(readme, /content\/film/);
  assert.match(readme, /原日期路由/);
  assert.doesNotMatch(readme, /正文仍由.*Hexo/);
  assert.equal(cname.trim(), 'www.dying4ever.cyou');
});
