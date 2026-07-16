import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { prepareLegacySnapshot, rewriteLegacyText } from '../src/content/legacy.js';

test('rewrites root-relative legacy HTML and CSS paths under /legacy/', () => {
  const html = '<a href="/about/">About</a><script src="/js/app.js"></script><a href="https://example.com">x</a>';
  assert.equal(
    rewriteLegacyText(html, '.html'),
    '<a href="/legacy/about/">About</a><script src="/legacy/js/app.js"></script><a href="https://example.com">x</a>',
  );
  assert.equal(rewriteLegacyText('body{background:url("/images/bg.webp")}', '.css'), 'body{background:url("/legacy/images/bg.webp")}');
});

test('copies a legacy snapshot without its Git metadata', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'legacy-site-'));
  const source = path.join(temp, 'source');
  const output = path.join(temp, 'output');
  await mkdir(path.join(source, '.git'), { recursive: true });
  await mkdir(path.join(source, 'css'), { recursive: true });
  await writeFile(path.join(source, 'index.html'), '<a href="/archives/">Archive</a>');
  await writeFile(path.join(source, 'css', 'site.css'), 'url(/images/paper.png)');
  await writeFile(path.join(source, '.git', 'config'), 'secret');

  await prepareLegacySnapshot(source, output);

  assert.match(await readFile(path.join(output, 'index.html'), 'utf8'), /\/legacy\/archives\//);
  assert.match(await readFile(path.join(output, 'css', 'site.css'), 'utf8'), /\/legacy\/images\/paper\.png/);
  await assert.rejects(readFile(path.join(output, '.git', 'config')));
  await rm(temp, { recursive: true, force: true });
});
