import { cp, mkdir, readFile, rm, stat, watch } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createServer } from 'vite';

import { loadContent } from '../src/content/load-content.js';
import { renderStaticPages } from '../src/content/render-pages.js';
import { prepareLegacySnapshot } from '../src/content/legacy.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = path.join(projectRoot, 'content');
const staticRoot = path.join(projectRoot, '.content-dev');
const legacyRoot = path.join(projectRoot, '.legacy-source');
const mimeTypes = Object.freeze({
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml',
});

async function rebuildContent() {
  await rm(staticRoot, { recursive: true, force: true });
  await mkdir(staticRoot, { recursive: true });
  const model = await loadContent(contentRoot);
  const result = await renderStaticPages(model, staticRoot);
  const assets = path.join(staticRoot, 'assets');
  await mkdir(assets, { recursive: true });
  await cp(path.join(projectRoot, 'src/styles/content-site.css'), path.join(assets, 'content-site.css'));
  await cp(path.join(projectRoot, 'src/content-site.js'), path.join(assets, 'content-site.js'));
  try {
    await stat(path.join(legacyRoot, 'index.html'));
    await prepareLegacySnapshot(legacyRoot, path.join(staticRoot, 'legacy'));
  } catch {
    // The source branch can still run without the optional preserved snapshot.
  }
  process.stdout.write(`[content] ${model.documents.length} notes, ${result.routeCount} routes\n`);
}

async function fileForRequest(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  if (pathname === '/') return null;
  const candidate = path.join(staticRoot, pathname.replace(/^\/+/, ''));
  try {
    const info = await stat(candidate);
    if (info.isFile()) return candidate;
    if (info.isDirectory()) return path.join(candidate, 'index.html');
  } catch {
    if (!path.extname(candidate)) {
      const indexFile = path.join(candidate, 'index.html');
      try {
        if ((await stat(indexFile)).isFile()) return indexFile;
      } catch {
        return null;
      }
    }
  }
  return null;
}

await rebuildContent();
const staticContentPlugin = {
  name: 'standalone-markdown-content',
  configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      const target = await fileForRequest(request.url ?? '/');
      if (!target) return next();
      try {
        const body = await readFile(target);
        response.statusCode = 200;
        response.setHeader('Content-Type', mimeTypes[path.extname(target).toLowerCase()] ?? 'application/octet-stream');
        response.end(body);
      } catch {
        next();
      }
    });
  },
};

const server = await createServer({
  root: projectRoot,
  configFile: path.join(projectRoot, 'vite.config.js'),
  plugins: [staticContentPlugin],
  server: { host: '127.0.0.1', port: 4173 },
});
await server.listen();
server.printUrls();

let rebuildTimer;
let rebuildQueue = Promise.resolve();

function queueContentRebuild() {
  rebuildQueue = rebuildQueue.then(rebuildContent)
    .then(() => server.ws.send({ type: 'full-reload' }))
    .catch((error) => console.error('[content]', error));
}

const watcher = watch(contentRoot, { recursive: true });
(async () => {
  for await (const _event of watcher) {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(queueContentRebuild, 160);
  }
})();

async function close() {
  watcher.close();
  await server.close();
  process.exit(0);
}
process.once('SIGINT', close);
process.once('SIGTERM', close);
