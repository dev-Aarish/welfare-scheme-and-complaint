/**
 * Validates that a normalized scheme has all mandatory non-empty fields.
 * @param {object} scheme Normalized scheme object
 * @returns {boolean} True if valid, false otherwise
 */
export function validateScheme(scheme) {
  if (!scheme || typeof scheme !== 'object') return false;

  const requiredFields = ['title', 'category', 'description', 'benefit', 'eligibility'];

  for (const field of requiredFields) {
    if (!scheme[field] || typeof scheme[field] !== 'string' || scheme[field].trim().length === 0) {
      console.warn(`[schemeValidator] Invalid scheme rejected (missing or empty ${field}):`, scheme.title || scheme.externalId);
      return false;
    }
  }

  return true;
}
