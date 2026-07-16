import { access, cp, mkdir, readdir, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const legacySource = path.resolve(projectRoot, '..', 'blog', 'source');
const contentRoot = path.join(projectRoot, 'content');
const notesTarget = path.join(contentRoot, 'notes');

async function exists(target) {
  try {
    await access(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function assertEmpty(target) {
  if (!(await exists(target))) return;
  const entries = await readdir(target);
  if (entries.length) {
    throw new Error(`Refusing to overwrite non-empty migration target: ${target}`);
  }
}

async function countMarkdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const counts = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return countMarkdown(target);
      return entry.isFile() && entry.name.endsWith('.md') ? 1 : 0;
    }),
  );
  return counts.reduce((total, count) => total + count, 0);
}

await assertEmpty(notesTarget);
await mkdir(contentRoot, { recursive: true });
await cp(path.join(legacySource, '_posts'), notesTarget, {
  recursive: true,
  force: false,
  errorOnExist: true,
});

for (const section of ['film', 'life', 'projects']) {
  const directory = path.join(contentRoot, section);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, '.gitkeep'), '', { flag: 'wx' }).catch((error) => {
    if (error.code !== 'EEXIST') throw error;
  });
}

const pagesTarget = path.join(contentRoot, 'pages');
await mkdir(pagesTarget, { recursive: true });
const pageSources = [
  ['about', path.join(legacySource, 'about', 'index.md')],
  ['friends', path.join(legacySource, 'friends', 'index.md')],
  ['projects', path.join(legacySource, 'projects', 'index.md')],
  ['changelog', path.join(legacySource, '_posts', '建站日志.md')],
];

for (const [name, source] of pageSources) {
  await cp(source, path.join(pagesTarget, `${name}.md`), {
    force: false,
    errorOnExist: true,
  });
}

const count = await countMarkdown(notesTarget);
if (count !== 131) {
  throw new Error(`Expected 131 migrated notes, received ${count}`);
}

process.stdout.write(`Migrated ${count} Markdown notes and ${pageSources.length} standalone pages.\n`);
