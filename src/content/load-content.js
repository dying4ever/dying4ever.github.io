import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { parseDocument } from './frontmatter.js';
import { collectTaxonomy, getArticleRoute } from './routes.js';

const SECTIONS = Object.freeze(['notes', 'film', 'life', 'projects']);
const PAGE_ROUTES = Object.freeze({
  about: '/about/',
  friends: '/friends/',
  changelog: '/changelog/',
  projects: '/projects/',
});

async function walkMarkdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkMarkdown(target);
    return entry.isFile() && entry.name.toLowerCase().endsWith('.md') ? [target] : [];
  }));
  return files.flat();
}

async function loadFile(filePath, section, contentRoot) {
  const source = await readFile(filePath, 'utf8');
  const relativePath = path.relative(path.dirname(contentRoot), filePath).replaceAll('\\', '/');
  const document = parseDocument(source, relativePath, section);
  return Object.freeze({
    ...document,
    absolutePath: filePath,
    route: getArticleRoute(document),
  });
}

export async function loadContent(contentRoot) {
  const sectionDocuments = await Promise.all(SECTIONS.map(async (section) => {
    const sectionRoot = path.join(contentRoot, section);
    const files = await walkMarkdown(sectionRoot);
    return Promise.all(files.map((filePath) => loadFile(filePath, section, contentRoot)));
  }));
  const documents = sectionDocuments.flat();
  const taxonomy = collectTaxonomy(documents);

  const pagesRoot = path.join(contentRoot, 'pages');
  const pageFiles = await walkMarkdown(pagesRoot);
  const pageEntries = await Promise.all(pageFiles.map(async (filePath) => {
    const name = path.basename(filePath, '.md');
    const source = await readFile(filePath, 'utf8');
    const relativePath = path.relative(path.dirname(contentRoot), filePath).replaceAll('\\', '/');
    const parsed = parseDocument(source, relativePath, 'pages');
    return [name, Object.freeze({
      ...parsed,
      absolutePath: filePath,
      route: PAGE_ROUTES[name] ?? `/${name}/`,
    })];
  }));

  return Object.freeze({
    documents: Object.freeze([...documents].sort((left, right) => right.timestamp - left.timestamp)),
    pages: Object.freeze(Object.fromEntries(pageEntries)),
    taxonomy,
  });
}
