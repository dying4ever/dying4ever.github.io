import { SITE_CONTENT, getBlogUrl, getPortalItems } from './content.js';
import { initMotion } from './motion.js';
import { initScrollStory } from './scroll-story.js';
import './styles/tokens.css';
import './styles/base.css';
import './styles/cover.css';
import './styles/home.css';
import './styles/responsive.css';
import './styles/scroll-story.css';

const ABOUT_PORTAL_VISIBLE_MS = 1_000;

function portalTemplate(item, index) {
  return `
    <a
      class="about-story__portal about-story__portal--${item.id}"
      href="${item.href}"
      data-portal="${item.id}"
      style="--portal-image: url('${item.image}')"
    >
      <span class="about-story__portal-index">0${index + 1}</span>
      <strong>${item.label}</strong>
      <span>${item.zh} · ${item.description}</span>
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

export function renderProloguePart(node, text, highlight) {
  const matchIndex = text.indexOf(highlight);
  if (matchIndex < 0) {
    node.textContent = text;
    return;
  }

  const document = node.ownerDocument;
  const mark = document.createElement('mark');
  mark.className = 'prologue-panel__highlight';
  mark.textContent = highlight;
  const before = text.slice(0, matchIndex);
  const nodes = [document.createTextNode(before)];
  nodes.push(mark, document.createTextNode(text.slice(matchIndex + highlight.length)));
  node.replaceChildren(...nodes);
}

export function renderRecentEntries(list, entries, resolvedBlogBase) {
  if (!entries.length) {
    const status = list.ownerDocument.createElement('li');
    status.className = 'home-recent__status';
    status.textContent = '这里正在等候新的文字。';
    list.replaceChildren(status);
    return;
  }

  const items = entries.map((entry) => {
    const item = list.ownerDocument.createElement('li');
    const link = list.ownerDocument.createElement('a');
    const title = list.ownerDocument.createElement('span');
    const time = list.ownerDocument.createElement('time');
    link.href = getBlogUrl(entry.route, resolvedBlogBase);
    title.textContent = entry.title;
    time.dateTime = entry.date;
    time.textContent = entry.date.slice(0, 10).replaceAll('-', '.');
    link.append(title, time);
    item.append(link);
    return item;
  });
  list.replaceChildren(...items);
}

async function hydrateRecentEntries(list, resolvedBlogBase) {
  if (!list) return;
  try {
    const response = await fetch(new URL('recent.json', resolvedBlogBase));
    if (!response.ok) throw new Error(`recent feed returned ${response.status}`);
    renderRecentEntries(list, await response.json(), resolvedBlogBase);
  } catch {
    renderRecentEntries(list, [], resolvedBlogBase);
  }
}

export function initAboutPortalTimer({
  root = document,
  duration = ABOUT_PORTAL_VISIBLE_MS,
} = {}) {
  const disclosure = root.querySelector('.about-story__portal-disclosure');
  const portrait = root.querySelector('.about-story__portrait');
  const aboutStory = root.querySelector('.about-story');
  const view = root.defaultView ?? window;
  if (!disclosure || !portrait || !aboutStory) return { destroy() {} };

  const usesHover = !view.matchMedia?.('(pointer: coarse)').matches;
  if (usesHover) {
    disclosure.classList.add('is-hover-mode');
    disclosure.open = true;
  }

  let closeTimer = 0;
  const isTouchOpen = () => !usesHover && disclosure.open;
  const hideTimedPortals = () => {
    disclosure.classList.remove('is-portals-visible');
    aboutStory.classList.toggle('is-portals-visible', isTouchOpen());
  };
  const showTimedPortals = () => {
    if (!usesHover) return;
    view.clearTimeout(closeTimer);
    disclosure.classList.add('is-portals-visible');
    aboutStory.classList.add('is-portals-visible');
    closeTimer = view.setTimeout(hideTimedPortals, duration);
  };
  const syncOpenState = () => {
    aboutStory.classList.toggle('is-portals-visible', isTouchOpen());
  };
  const preventDesktopToggle = (event) => {
    if (usesHover) event.preventDefault();
  };

  portrait.addEventListener('pointerenter', showTimedPortals);
  portrait.addEventListener('click', preventDesktopToggle);
  disclosure.addEventListener('toggle', syncOpenState);
  return {
    destroy() {
      view.clearTimeout(closeTimer);
      portrait.removeEventListener('pointerenter', showTimedPortals);
      portrait.removeEventListener('click', preventDesktopToggle);
      disclosure.removeEventListener('toggle', syncOpenState);
    },
  };
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

  hydrateRecentEntries(document.querySelector('[data-recent-list]'), resolvedBlogBase);
  document.querySelector('[data-about-portals]').innerHTML = getPortalItems(resolvedBlogBase)
    .map(portalTemplate)
    .join('');

  document.querySelector('[data-about-summary]').textContent = SITE_CONTENT.aboutSummary;
  document.querySelectorAll('[data-prologue-part]').forEach((node, index) => {
    renderProloguePart(
      node,
      SITE_CONTENT.prologueParts[index] ?? '',
      SITE_CONTENT.prologueHighlight,
    );
  });
  document.querySelector('[data-prologue-attribution]').textContent = SITE_CONTENT.prologueAttribution;
  document.querySelectorAll('[data-about-note]').forEach((node, index) => {
    node.textContent = SITE_CONTENT.aboutNotes[index] ?? '';
  });
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
initAboutPortalTimer({ duration: ABOUT_PORTAL_VISIBLE_MS });

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
