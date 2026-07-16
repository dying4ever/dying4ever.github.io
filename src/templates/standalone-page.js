import { renderMasthead, renderSiteShell } from './site-shell.js';

export function renderStandalonePage({ document, rendered, eyebrow }) {
  const masthead = renderMasthead({
    eyebrow,
    title: document.title,
    description: document.desc,
  });
  const content = `<section class="standalone-paper">
    <article class="article-paper">
      <div class="markdown-body">${rendered.html}</div>
    </article>
  </section>`;

  return renderSiteShell({
    title: document.title,
    description: document.desc || document.title,
    route: document.route,
    masthead,
    content,
    bodyClass: `standalone-page standalone-page--${document.slug}`,
  });
}
