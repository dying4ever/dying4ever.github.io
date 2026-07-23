const RECENT_SECTIONS = new Set(['film', 'life', 'projects']);

export function selectRecentEntries(documents, limit = 6) {
  return documents
    .filter((document) => RECENT_SECTIONS.has(document.section))
    .sort((left, right) => right.timestamp - left.timestamp)
    .slice(0, limit)
    .map(({ title, section, date, route }) => Object.freeze({
      title,
      section,
      date,
      route,
    }));
}
