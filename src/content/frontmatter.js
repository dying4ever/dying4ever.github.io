import path from 'node:path';

import matter from 'gray-matter';

const DATE_PATTERN = /^date:\s*["']?(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/m;

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => `${item}`.trim()).filter(Boolean);
  }
  if (value === undefined || value === null || value === '') return [];
  return [`${value}`.trim()].filter(Boolean);
}

function readDate(source, filePath) {
  const match = source.match(DATE_PATTERN);
  if (!match) {
    throw new Error(`${filePath}: required front matter field "date" is missing or invalid`);
  }

  const [, year, rawMonth, rawDay, rawHour, rawMinute, rawSecond] = match;
  const month = rawMonth.padStart(2, '0');
  const day = rawDay.padStart(2, '0');
  const hasTime = rawHour !== undefined;
  const hour = (rawHour ?? '0').padStart(2, '0');
  const minute = rawMinute ?? '00';
  const second = rawSecond ?? '00';

  return {
    text: hasTime ? `${year}-${month}-${day} ${hour}:${minute}:${second}` : `${year}-${month}-${day}`,
    parts: Object.freeze({ year, month, day, hour, minute, second }),
    timestamp: Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)),
  };
}

export function parseDocument(source, filePath, parentSection) {
  const sourcePath = `${filePath}`.replaceAll('\\', '/');
  const parsed = matter(source);
  const title = `${parsed.data.title ?? ''}`.trim();

  if (!title) {
    throw new Error(`${sourcePath}: required front matter field "title" is missing`);
  }

  const date = readDate(source, sourcePath);
  const fileName = path.posix.basename(sourcePath);
  const slug = fileName.replace(/\.md$/i, '');

  return Object.freeze({
    title,
    date: date.text,
    dateParts: date.parts,
    timestamp: date.timestamp,
    categories: Object.freeze(normalizeList(parsed.data.categories)),
    tags: Object.freeze(normalizeList(parsed.data.tags)),
    sticky: Number(parsed.data.sticky ?? 0) || 0,
    desc: `${parsed.data.desc ?? ''}`.trim(),
    body: parsed.content.trim(),
    sourcePath,
    section: `${parentSection}`.toLowerCase(),
    slug,
  });
}
