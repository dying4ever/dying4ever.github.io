import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import taskLists from 'markdown-it-task-lists';
import hljs from 'highlight.js/lib/common';

function escapeHtml(value) {
  return `${value}`
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function isRelativeAsset(source) {
  return !/^(?:[a-z]+:|\/|#|data:)/i.test(source);
}

function decodedReference(source) {
  const normalized = source.replace(/^<|>$/g, '');
  try {
    return decodeURIComponent(normalized);
  } catch {
    return normalized;
  }
}

export function createMarkdownRenderer() {
  const renderer = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: false,
    highlight(code, language) {
      const knownLanguage = language && hljs.getLanguage(language) ? language : 'plaintext';
      const highlighted = hljs.highlight(code, { language: knownLanguage }).value;
      return `<pre class="code-frame"><code class="hljs language-${escapeHtml(knownLanguage)}">${highlighted}</code></pre>`;
    },
  });

  renderer.use(anchor, {
    slugify: (text) => encodeURIComponent(text.trim().toLowerCase().replace(/\s+/g, '-')),
  });
  renderer.use(taskLists, { enabled: true, label: true });

  const defaultImage = renderer.renderer.rules.image;
  renderer.renderer.rules.image = (tokens, index, options, env, self) => {
    const token = tokens[index];
    const source = token.attrGet('src') ?? '';
    if (isRelativeAsset(source)) {
      const base = `${env.assetBase ?? '/'}`.replace(/\/?$/, '/');
      let decodedSource = source;
      try {
        decodedSource = decodeURIComponent(source);
      } catch {
        // Keep malformed legacy URLs intact so the build can report the missing asset later.
      }
      token.attrSet('src', `${base}${decodedSource.replace(/^\.\//, '').replaceAll('\\', '/')}`);
    }
    token.attrSet('loading', 'lazy');
    token.attrSet('decoding', 'async');
    return defaultImage(tokens, index, options, env, self);
  };

  const defaultLinkOpen = renderer.renderer.rules.link_open
    ?? ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options));
  renderer.renderer.rules.link_open = (tokens, index, options, env, self) => {
    const href = tokens[index].attrGet('href') ?? '';
    if (/^https?:\/\//i.test(href)) {
      tokens[index].attrSet('target', '_blank');
      tokens[index].attrSet('rel', 'noreferrer noopener');
    }
    return defaultLinkOpen(tokens, index, options, env, self);
  };

  return renderer;
}

export function collectLocalReferences(source) {
  const renderer = createMarkdownRenderer();
  const references = [];

  const visit = (tokens) => {
    for (const token of tokens) {
      const target = token.type === 'image'
        ? token.attrGet('src')
        : token.type === 'link_open'
          ? token.attrGet('href')
          : null;
      if (target && isRelativeAsset(target)) references.push(decodedReference(target));
      if (token.children) visit(token.children);
    }
  };

  visit(renderer.parse(source, {}));
  return [...new Set(references)];
}

function visibleInlineText(token) {
  const visible = (token?.children ?? [])
    .filter((child) => ['text', 'code_inline', 'image'].includes(child.type))
    .map((child) => child.content)
    .join(' ')
    .replaceAll('\u00a0', ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return visible || (token?.content ?? '').replace(/<[^>]*>/g, '').trim();
}

export function renderMarkdownWithToc(source, { assetBase = '/' } = {}) {
  const renderer = createMarkdownRenderer();
  const env = { assetBase };
  const tokens = renderer.parse(source, env);
  const toc = [];

  tokens.forEach((token, index) => {
    if (token.type !== 'heading_open') return;
    const level = Number(token.tag.slice(1));
    if (level < 1 || level > 3) return;
    const inline = tokens[index + 1];
    toc.push({
      level,
      id: token.attrGet('id') ?? '',
      text: visibleInlineText(inline),
    });
  });

  return Object.freeze({
    html: renderer.renderer.render(tokens, renderer.options, env),
    toc: Object.freeze(toc),
  });
}
