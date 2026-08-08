/**
 * Normalizes raw scheme payload objects into standard backend schema.
 * @param {object} raw Raw scheme object from adapter
 * @returns {object} Normalized scheme object
 */
export function normalizeScheme(raw) {
  return {
    externalId: String(raw.external_id || raw.id || raw.code || raw.title || '').trim(),
    source: String(raw.source || raw._sourceName || 'system').trim(),
    sourceUrl: raw.source_url || raw.sourceUrl || raw.url || null,
    sourceLastUpdated: raw.source_last_updated ? new Date(raw.source_last_updated) : new Date(),
    title: String(raw.title || raw.name || '').trim(),
    category: String(raw.category || raw.domain || 'General').trim(),
    tag: raw.tag ? String(raw.tag).trim() : String(raw.category || 'General').trim(),
    description: String(raw.description || raw.details || raw.summary || '').trim(),
    benefit: String(raw.benefit || raw.benefits || raw.financialBenefit || 'Benefits available').trim(),
    eligibility: String(raw.eligibility || raw.criteria || raw.eligibilityCriteria || 'General eligibility').trim(),
    isActive: raw.isActive !== undefined ? Boolean(raw.isActive) : true,
    applicationsCount: Number(raw.applicationsCount || raw.applications_count || 0)
  };
}
