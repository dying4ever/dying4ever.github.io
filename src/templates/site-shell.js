const NAVIGATION = Object.freeze([
  ['关于我', '/about/'],
  ['分类', '/categories/'],
  ['友链', '/friends/'],
  ['归档', '/archives/'],
  ['旧版', '/legacy/'],
]);

export function escapeHtml(value) {
  return `${value ?? ''}`
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderSiteShell({ title, description = '', route = '/', masthead = '', content = '', bodyClass = '' }) {
  const navigation = NAVIGATION.map(([label, href]) => {
    const active = route === href || (href !== '/' && route.startsWith(href));
    return `<a href="${href}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('');

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="theme-color" content="#17130f" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="/assets/content-site.css" />
    <title>${escapeHtml(title)} · 终南山下，活死人墓</title>
  </head>
  <body class="content-site ${escapeHtml(bodyClass)}">
    <a class="skip-link" href="#content-main">跳到正文</a>
    <header class="content-nav">
      <a class="content-brand" href="/" aria-label="返回首页">
        <span aria-hidden="true">山</span><strong>DYING4EVER</strong>
      </a>
      <button class="content-menu" type="button" aria-expanded="false" aria-controls="content-navigation">菜单</button>
      <nav id="content-navigation" aria-label="主要导航">${navigation}</nav>
    </header>
    ${masthead}
    <main id="content-main" tabindex="-1">${content}</main>
    <footer class="content-footer">
      <p>终南山下，活死人墓</p>
      <a href="/changelog/">建站日志</a>
    </footer>
    <script src="/assets/content-site.js" defer></script>
  </body>
</html>`;
}

export function renderMasthead({ eyebrow, title, description = '', meta = '' }) {
  const details = [
    description ? `<div class="content-masthead__description">${escapeHtml(description)}</div>` : '',
    meta,
  ].filter(Boolean);

  return `<section class="content-masthead">
    <div class="content-masthead__landscape" aria-hidden="true"></div>
    <div class="content-masthead__ink" aria-hidden="true"></div>
    <div class="content-masthead__copy">
      <p>${escapeHtml(eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>${details.length ? `\n      ${details.join('\n      ')}` : ''}
    </div>
  </section>`;
}
