const SECTION_IDS = Object.freeze(['notes', 'film', 'life', 'projects']);

function byNewest(left, right) {
  return right.timestamp - left.timestamp || right.sticky - left.sticky || left.title.localeCompare(right.title, 'zh-CN');
}

function addToBucket(bucket, key, document) {
  if (!bucket[key]) bucket[key] = [];
  bucket[key].push(document);
}

export function getArticleRoute(document) {
  const { year, month, day } = document.dateParts;
  return `/${year}/${month}/${day}/${document.slug}/`;
}

export function collectTaxonomy(documents) {
  const sections = Object.fromEntries(SECTION_IDS.map((section) => [section, []]));
  const categories = Object.create(null);
  const tags = Object.create(null);
  const archives = Object.create(null);
  const routes = new Map();

  documents.forEach((document) => {
    const route = getArticleRoute(document);
    if (routes.has(route)) {
      throw new Error(`Duplicate article route ${route}: ${routes.get(route)} and ${document.sourcePath}`);
    }
    routes.set(route, document.sourcePath);

    if (!sections[document.section]) sections[document.section] = [];
    sections[document.section].push(document);
    document.categories.forEach((category) => addToBucket(categories, category, document));
    document.tags.forEach((tag) => addToBucket(tags, tag, document));
    addToBucket(archives, `${document.dateParts.year}-${document.dateParts.month}`, document);
  });

  Object.values(sections).forEach((items) => items.sort(byNewest));
  Object.values(categories).forEach((items) => items.sort(byNewest));
  Object.values(tags).forEach((items) => items.sort(byNewest));
  Object.values(archives).forEach((items) => items.sort(byNewest));

  return Object.freeze({ sections, categories, tags, archives });
}
