import { SITE_CONTENT, getBlogUrl, getPortalItems } from './content.js';
import { initMotion } from './motion.js';
import { initScrollStory } from './scroll-story.js';
import './styles/tokens.css';
import './styles/base.css';
import './styles/cover.css';
import './styles/home.css';
import './styles/responsive.css';
import './styles/scroll-story.css';

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

export function renderSiteTitle(node, lines) {
  const titleLines = lines.map((text) => {
    const line = node.ownerDocument.createElement('span');
    line.className = 'site-title__line';
    line.textContent = text;
    return line;
  });
  node.replaceChildren(...titleLines);
}

export function renderPage({
  blogBase = document.documentElement.dataset.blogBase,
  blogOrigin = window.location.origin,
} = {}) {
  const resolvedBlogBase = new URL(blogBase || '/', blogOrigin).href;

  document.querySelectorAll('[data-site-title]').forEach((node) => {
    renderSiteTitle(node, SITE_CONTENT.titleLines);
  });
  document.querySelector('[data-site-subtitle]').textContent = SITE_CONTENT.subtitle;
  document.querySelector('[data-site-statement]').textContent = SITE_CONTENT.statement;

  document.querySelectorAll('[data-blog-path]').forEach((link) => {
    link.href = getBlogUrl(link.dataset.blogPath, resolvedBlogBase);
  });

  document.querySelector('#portal-grid').innerHTML = getPortalItems(resolvedBlogBase)
    .map(portalTemplate)
    .join('');

  document.querySelector('[data-about-summary]').textContent = SITE_CONTENT.aboutSummary;
  document.querySelectorAll('[data-prologue-part]').forEach((node, index) => {
    node.textContent = SITE_CONTENT.prologueParts[index] ?? '';
  });
  document.querySelector('[data-prologue-attribution]').textContent = SITE_CONTENT.prologueAttribution;
  document.querySelector('[data-about-story]').textContent = SITE_CONTENT.aboutStory;
  document.querySelector('[data-log-list]').innerHTML = SITE_CONTENT.logEntries
    .map(
      (entry) => `
        <li>
          <time>${entry.date}</time>
          <strong>${entry.title}</strong>
          <span>${entry.description}</span>
        </li>`,
    )
    .join('');

  document.querySelector('[data-category-list]').innerHTML = SITE_CONTENT.categories
    .map((item, index) => {
      const route = item.id === 'projects' ? 'projects' : 'categories';
      return `
        <a class="category-mini" href="${getBlogUrl(route, resolvedBlogBase)}">
          <span class="category-mini__index">0${index + 1}</span>
          <span class="category-mini__label">${item.label}</span>
          <span class="category-mini__detail">${item.zh} · ${item.detail}</span>
        </a>`;
    })
    .join('');
}

renderPage();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

initMotion({ reducedMotion });
initScrollStory({ reducedMotion });

if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  let pointerFrame = 0;
  window.addEventListener('pointermove', (event) => {
    if (pointerFrame) return;
    pointerFrame = window.requestAnimationFrame(() => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      document.documentElement.style.setProperty('--scene-x', x.toFixed(3));
      document.documentElement.style.setProperty('--scene-y', y.toFixed(3));
      document.querySelectorAll('[data-portal]').forEach((portal, index) => {
        const direction = index % 2 ? -1 : 1;
        portal.style.setProperty('--pointer-x', (x * direction).toFixed(3));
        portal.style.setProperty('--pointer-y', (y * direction).toFixed(3));
      });
      pointerFrame = 0;
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.16 },
);

document.querySelectorAll('.reveal-on-scroll').forEach((node) => revealObserver.observe(node));
