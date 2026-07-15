import { SITE_CONTENT, getBlogUrl, getPortalItems } from './content.js';

function portalTemplate(item, index) {
  return `
    <a
      class="portal portal--${item.id}"
      href="${item.href}"
      data-portal="${item.id}"
      style="--portal-image: url('${item.image}')"
    >
      <span class="portal__chrome" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="portal__index">0${index + 1}</span>
      <span class="portal__label">${item.label}</span>
      <span class="portal__zh">${item.zh}</span>
      <span class="portal__description">${item.description}</span>
      <span class="portal__arrow" aria-hidden="true">↗</span>
    </a>`;
}

export function renderPage({ blogBase = document.documentElement.dataset.blogBase } = {}) {
  document.querySelectorAll('[data-site-title]').forEach((node) => {
    node.textContent = SITE_CONTENT.title;
  });
  document.querySelector('[data-site-subtitle]').textContent = SITE_CONTENT.subtitle;
  document.querySelector('[data-site-statement]').textContent = SITE_CONTENT.statement;

  document.querySelectorAll('[data-blog-path]').forEach((link) => {
    link.href = getBlogUrl(link.dataset.blogPath, blogBase);
  });

  document.querySelector('#portal-grid').innerHTML = getPortalItems(blogBase)
    .map(portalTemplate)
    .join('');
}

renderPage();
