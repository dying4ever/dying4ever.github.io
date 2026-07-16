import { escapeHtml, renderMasthead, renderSiteShell } from './site-shell.js';

function renderDocument(document) {
  const categories = document.categories.map((item) => `<span>${escapeHtml(item)}</span>`).join('');
  return `<article class="entry-card">
    <a href="${document.route}">
      <time datetime="${document.date.replace(' ', 'T')}">${document.date.slice(0, 10)}</time>
      <h2>${escapeHtml(document.title)}</h2>
      ${document.desc ? `<p>${escapeHtml(document.desc)}</p>` : ''}
      <div class="entry-card__categories">${categories}</div>
      <span class="entry-card__arrow" aria-hidden="true">→</span>
    </a>
  </article>`;
}

export function renderListPage({ title, eyebrow, description, documents, route, aside = '' }) {
  const masthead = renderMasthead({ eyebrow, title, description });
  const entries = documents.length
    ? `<div class="entry-grid">${documents.map(renderDocument).join('')}</div>`
    : `<div class="empty-state"><span>一页留白</span><h2>此页正在等待第一篇记录</h2><p>把 Markdown 放进对应目录，下一次构建时它会出现在这里。</p></div>`;
  const content = `<section class="listing-paper">${aside}${entries}</section>`;

  return renderSiteShell({
    title,
    description,
    route,
    masthead,
    content,
    bodyClass: 'listing-page',
  });
}
