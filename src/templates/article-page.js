import { escapeHtml, renderMasthead, renderSiteShell } from './site-shell.js';

function encodeSegment(value) {
  return encodeURIComponent(value).replaceAll('%2F', '/');
}

function renderTaxonomy(items, base) {
  return items.map((item) => `<a href="/${base}/${encodeSegment(item)}/">${escapeHtml(item)}</a>`).join('');
}

function renderToc(items) {
  if (!items.length) return '';
  return `<aside class="article-toc" aria-label="文章目录">
    <button type="button" aria-expanded="false">目录</button>
    <ol>${items.map((item) => `<li class="article-toc__level-${item.level}"><a href="#${item.id}">${escapeHtml(item.text)}</a></li>`).join('')}</ol>
  </aside>`;
}

function renderNeighbor(document, label) {
  if (!document) return '<span></span>';
  return `<a href="${document.route}"><small>${label}</small><strong>${escapeHtml(document.title)}</strong></a>`;
}

export function renderArticlePage({ document, rendered, previous, next }) {
  const categories = renderTaxonomy(document.categories, 'categories');
  const tags = renderTaxonomy(document.tags, 'tags');
  const meta = `<div class="content-meta">
    <time datetime="${document.date.replace(' ', 'T')}">${document.date.slice(0, 10)}</time>
    ${categories ? `<span class="content-meta__categories">${categories}</span>` : ''}
    ${tags ? `<span class="content-meta__tags">${tags}</span>` : ''}
  </div>`;
  const masthead = renderMasthead({
    eyebrow: document.section.toUpperCase(),
    title: document.title,
    description: document.desc,
    meta,
  });
  const content = `<div class="article-layout">
    ${renderToc(rendered.toc)}
    <article class="article-paper">
      <div class="markdown-body">${rendered.html}</div>
      <nav class="article-neighbors" aria-label="相邻文章">
        ${renderNeighbor(previous, '上一篇')}
        ${renderNeighbor(next, '下一篇')}
      </nav>
    </article>
  </div>`;

  return renderSiteShell({
    title: document.title,
    description: document.desc || document.title,
    route: document.route,
    masthead,
    content,
    bodyClass: 'article-page',
  });
}
