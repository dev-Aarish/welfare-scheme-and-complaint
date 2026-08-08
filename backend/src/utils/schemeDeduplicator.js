/**
 * Standardizes scheme title for canonical matching.
 */
function getCanonicalKey(scheme) {
  const cleanTitle = scheme.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return `${scheme.source}:${cleanTitle}`;
}

/**
 * Deduplicates a list of normalized and validated scheme objects.
 * @param {Array<object>} schemes Array of normalized schemes
 * @returns {Array<object>} Deduplicated scheme array
 */
export function deduplicateSchemes(schemes) {
  const seen = new Map();

  for (const scheme of schemes) {
    const key = getCanonicalKey(scheme);
    if (!seen.has(key)) {
      seen.set(key, scheme);
    } else {
      // Merge / prefer existing or update timestamp
      const existing = seen.get(key);
      if (scheme.sourceLastUpdated > existing.sourceLastUpdated) {
        seen.set(key, scheme);
      }
    }
  }

  return Array.from(seen.values());
}
