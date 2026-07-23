import { access, cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { collectLocalReferences, renderMarkdownWithToc } from './markdown.js';
import { selectRecentEntries } from './recent.js';
import { renderArticlePage } from '../templates/article-page.js';
import { renderListPage } from '../templates/list-page.js';
import { escapeHtml, renderMasthead, renderSiteShell } from '../templates/site-shell.js';
import { renderStandalonePage } from '../templates/standalone-page.js';

const SECTION_COPY = Object.freeze({
  notes: ['NOTES', '笔记', '技术、课程、论文与持续发生的思考'],
  film: ['FILM', '光影', '电影、观看与仍然留下来的片段'],
  life: ['LIFE', '生活', '日常、行路与时间留下的纹理'],
  projects: ['SOME PROJECTS', '项目', '实践、实验与从想法走向现实的过程'],
});

function routeDirectory(outDir, route) {
  const clean = decodeURIComponent(route).replace(/^\/+|\/+$/g, '');
  return path.join(outDir, ...clean.split('/').filter(Boolean));
}

async function writeRoute(outDir, route, html) {
  const directory = routeDirectory(outDir, route);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), html, 'utf8');
}

async function canAccess(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

const assetIndexCache = new Map();

async function indexAssets(directory) {
  if (assetIndexCache.has(directory)) return assetIndexCache.get(directory);
  const index = new Map();

  const visit = async (current) => {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await visit(target);
      } else if (entry.isFile()) {
        const matches = index.get(entry.name) ?? [];
        matches.push(target);
        index.set(entry.name, matches);
      }
    }
  };

  await visit(directory);
  assetIndexCache.set(directory, index);
  return index;
}

async function resolveLocalAsset(sourceDirectory, pathOnly) {
  const exact = path.resolve(sourceDirectory, pathOnly);
  if (await canAccess(exact)) return exact;

  const index = await indexAssets(sourceDirectory);
  const candidates = index.get(path.basename(pathOnly)) ?? [];
  return candidates.length === 1 ? candidates[0] : null;
}

async function copyDocumentAssets(document, outDir, warnings) {
  const sourceDirectory = path.dirname(document.absolutePath);
  const destinationDirectory = routeDirectory(outDir, document.route);

  for (const reference of collectLocalReferences(document.body)) {
    let decoded = reference;
    try {
      decoded = decodeURIComponent(reference);
    } catch {
      // The missing asset warning below contains the original malformed value.
    }
    const pathOnly = decoded.split(/[?#]/)[0];
    const source = await resolveLocalAsset(sourceDirectory, pathOnly);
    if (!source) {
      warnings.push(`${document.sourcePath}: missing local asset ${reference}`);
      continue;
    }
    const info = await stat(source);
    if (!info.isFile()) continue;
    const destination = path.resolve(destinationDirectory, pathOnly);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(source, destination, { force: true });
  }
}

function taxonomyLinks(taxonomy, type) {
  return Object.entries(taxonomy)
    .sort(([left], [right]) => left.localeCompare(right, 'zh-CN'))
    .map(([name, documents]) => `<a class="taxonomy-card" href="/${type}/${encodeURIComponent(name)}/">
      <span>${String(documents.length).padStart(2, '0')}</span>
      <strong>${escapeHtml(name)}</strong>
    </a>`)
    .join('');
}

function renderTaxonomyRoot({ model, type }) {
  const isCategory = type === 'categories';
  const data = isCategory ? model.taxonomy.categories : model.taxonomy.tags;
  const title = isCategory ? '分类' : '标签';
  const masthead = renderMasthead({
    eyebrow: isCategory ? 'CATEGORIES' : 'TAGS',
    title,
    description: isCategory ? '原有分类全部收在 Notes 之下，路径与 Markdown 抬头保持一致。' : '从关键词重新进入文章。',
  });
  return renderSiteShell({
    title,
    description: `${title}索引`,
    route: `/${type}/`,
    masthead,
    content: `<section class="taxonomy-paper"><div class="taxonomy-grid">${taxonomyLinks(data, type)}</div></section>`,
    bodyClass: 'taxonomy-page',
  });
}

function renderArchives(model) {
  const groups = Object.entries(model.taxonomy.archives).sort(([left], [right]) => right.localeCompare(left));
  const body = groups.map(([month, documents]) => `<section class="archive-group">
    <h2>${month.replace('-', ' / ')}</h2>
    <ol>${documents.map((document) => `<li><time>${document.date.slice(5, 10)}</time><a href="${document.route}">${escapeHtml(document.title)}</a><span>${escapeHtml(document.section.toUpperCase())}</span></li>`).join('')}</ol>
  </section>`).join('');
  const masthead = renderMasthead({ eyebrow: 'ARCHIVES', title: '归档', description: `共 ${model.documents.length} 篇记录，沿时间回看。` });
  return renderSiteShell({
    title: '归档',
    description: '文章时间归档',
    route: '/archives/',
    masthead,
    content: `<section class="archive-paper">${body}</section>`,
    bodyClass: 'archive-page',
  });
}

function renderNotFound() {
  const masthead = renderMasthead({ eyebrow: '404', title: '山路到此暂断', description: '这一页不存在，或者已经被移动。' });
  return renderSiteShell({
    title: '页面不存在',
    route: '/404/',
    masthead,
    content: '<section class="empty-state"><a href="/">返回首页</a><a href="/archives/">查看归档</a></section>',
    bodyClass: 'not-found-page',
  });
}

export async function renderStaticPages(model, outDir) {
  const warnings = [];

  await writeFile(
    path.join(outDir, 'recent.json'),
    `${JSON.stringify(selectRecentEntries(model.documents), null, 2)}\n`,
    'utf8',
  );

  for (const [index, document] of model.documents.entries()) {
    const rendered = renderMarkdownWithToc(document.body, { assetBase: document.route });
    const html = renderArticlePage({
      document,
      rendered,
      previous: model.documents[index + 1] ?? null,
      next: model.documents[index - 1] ?? null,
    });
    await writeRoute(outDir, document.route, html);
    await copyDocumentAssets(document, outDir, warnings);
  }

  for (const [section, copy] of Object.entries(SECTION_COPY)) {
    const [title, eyebrow, description] = copy;
    const introPage = section === 'projects' ? model.pages.projects : null;
    const intro = introPage
      ? `<div class="section-intro markdown-body">${renderMarkdownWithToc(introPage.body, { assetBase: '/projects/' }).html}</div>`
      : '';
    await writeRoute(outDir, `/${section}/`, renderListPage({
      title,
      eyebrow,
      description,
      documents: model.taxonomy.sections[section],
      route: `/${section}/`,
      aside: intro,
    }));
  }

  await writeRoute(outDir, '/categories/', renderTaxonomyRoot({ model, type: 'categories' }));
  await writeRoute(outDir, '/tags/', renderTaxonomyRoot({ model, type: 'tags' }));

  for (const [name, documents] of Object.entries(model.taxonomy.categories)) {
    await writeRoute(outDir, `/categories/${encodeURIComponent(name)}/`, renderListPage({
      title: name,
      eyebrow: 'NOTES · CATEGORY',
      description: `${documents.length} 篇文章`,
      documents,
      route: `/categories/${encodeURIComponent(name)}/`,
    }));
  }
  for (const [name, documents] of Object.entries(model.taxonomy.tags)) {
    await writeRoute(outDir, `/tags/${encodeURIComponent(name)}/`, renderListPage({
      title: name,
      eyebrow: 'TAG',
      description: `${documents.length} 篇文章`,
      documents,
      route: `/tags/${encodeURIComponent(name)}/`,
    }));
  }

  await writeRoute(outDir, '/archives/', renderArchives(model));
  for (const name of ['about', 'friends', 'changelog']) {
    const document = model.pages[name];
    const rendered = renderMarkdownWithToc(document.body, { assetBase: document.route });
    await writeRoute(outDir, document.route, renderStandalonePage({
      document,
      rendered,
      eyebrow: name === 'about' ? 'ABOUT ME' : name === 'friends' ? 'FRIENDS' : 'BUILD LOG',
    }));
    await copyDocumentAssets(document, outDir, warnings);
  }

  await writeFile(path.join(outDir, '404.html'), renderNotFound(), 'utf8');
  return Object.freeze({ routeCount: model.documents.length + 11 + Object.keys(model.taxonomy.categories).length + Object.keys(model.taxonomy.tags).length, warnings });
}
