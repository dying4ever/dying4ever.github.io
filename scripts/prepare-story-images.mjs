import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const names = ['story-path.webp', 'story-river.webp', 'story-stage.webp'];
const sources = process.argv.slice(2);

if (sources.length !== names.length) {
  throw new Error('Usage: node scripts/prepare-story-images.mjs <path> <river> <stage>');
}

await Promise.all(sources.map((source, index) => sharp(source)
  .resize({ width: 1920, withoutEnlargement: true })
  .webp({ quality: 82, effort: 6, smartSubsample: true })
  .toFile(path.join(projectRoot, 'public', 'images', names[index]))));

process.stdout.write(`Prepared ${names.join(', ')}\n`);
