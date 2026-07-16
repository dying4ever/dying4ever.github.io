import { access, cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { build as viteBuild } from 'vite';

import { loadContent } from '../src/content/load-content.js';
import { renderStaticPages } from '../src/content/render-pages.js';
import { prepareLegacySnapshot } from '../src/content/legacy.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = path.join(projectRoot, 'content');
const outDir = path.join(projectRoot, 'dist');
const homepageDir = path.join(projectRoot, '.vite-homepage');
const legacyRoot = path.join(projectRoot, '.legacy-source');

await rm(outDir, { recursive: true, force: true });
await rm(homepageDir, { recursive: true, force: true });

await viteBuild({
  root: projectRoot,
  configFile: path.join(projectRoot, 'vite.config.js'),
  build: { outDir: homepageDir, emptyOutDir: true },
});

await cp(homepageDir, outDir, { recursive: true, force: true });
await rm(homepageDir, { recursive: true, force: true });

const model = await loadContent(contentRoot);
const result = await renderStaticPages(model, outDir);

const assetDir = path.join(outDir, 'assets');
await mkdir(assetDir, { recursive: true });
await cp(path.join(projectRoot, 'src', 'styles', 'content-site.css'), path.join(assetDir, 'content-site.css'), { force: true });
await cp(path.join(projectRoot, 'src', 'content-site.js'), path.join(assetDir, 'content-site.js'), { force: true });

try {
  await access(path.join(legacyRoot, 'index.html'));
  await prepareLegacySnapshot(legacyRoot, path.join(outDir, 'legacy'));
  process.stdout.write('[legacy] preserved snapshot generated at /legacy/.\n');
} catch {
  process.stdout.write('[legacy] source snapshot absent; skipped /legacy/.\n');
}

process.stdout.write(`\n[standalone] ${model.documents.length} Markdown notes, ${result.routeCount} generated routes.\n`);
for (const warning of result.warnings) process.stderr.write(`[standalone warning] ${warning}\n`);
