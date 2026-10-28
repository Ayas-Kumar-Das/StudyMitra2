export const LIBRARY_LEVELS = ["semester", "subject", "doc_type"];
export const groupValue = (value) => String(value ?? "").trim();
export function documentsAtPath(documents, path) {
  return documents.filter((document) =>
    path.every((part, i) => groupValue(document[LIBRARY_LEVELS[i]]) === part),
  );
}
export function groupsAtPath(documents, path) {
  const key = LIBRARY_LEVELS[path.length];
  if (!key) return [];
  const groups = new Map();
  for (const document of documentsAtPath(documents, path)) {
    const value = groupValue(document[key]);
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(document);
  }
  return [...groups]
    .map(([value, items]) => ({ value, items }))
    .sort((a, b) => {
      if (!a.value) return 1;
      if (!b.value) return -1;
      return a.value.localeCompare(b.value, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
}
