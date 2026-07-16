import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const TEXT_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.xml']);

export function rewriteLegacyText(source, extension) {
  let text = source;

  if (extension === '.css') {
    return text.replace(/url\(\s*(["']?)\/(?!\/|legacy\/)/g, 'url($1/legacy/');
  }

  text = text.replace(/(["'])\/(?!\/|legacy\/)([^"'\s<>]*)\1/g, '$1/legacy/$2$1');
  text = text.replace(/\b(root|statics):\s*(["'])\/\2/g, '$1:$2/legacy/$2');
  return text;
}

async function copyTree(sourceRoot, outputRoot, relative = '') {
  const sourceDir = path.join(sourceRoot, relative);
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === '.git') continue;
    const childRelative = path.join(relative, entry.name);
    const sourcePath = path.join(sourceRoot, childRelative);
    const outputPath = path.join(outputRoot, childRelative);

    if (entry.isDirectory()) {
      await mkdir(outputPath, { recursive: true });
      await copyTree(sourceRoot, outputRoot, childRelative);
      continue;
    }

    if (!entry.isFile()) continue;
    const extension = path.extname(entry.name).toLowerCase();
    if (TEXT_EXTENSIONS.has(extension)) {
      const source = await readFile(sourcePath, 'utf8');
      await writeFile(outputPath, rewriteLegacyText(source, extension));
    } else {
      await copyFile(sourcePath, outputPath);
    }
  }
}

export async function prepareLegacySnapshot(sourceRoot, outputRoot) {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  await copyTree(sourceRoot, outputRoot);
}
