import { BaseSchemeAdapter } from './baseAdapter.js';
import { CENTRAL_SCHEMES } from './centralSchemesDataset.js';
import { CENTRAL_SCHEMES_PART2 } from './centralSchemesDatasetPart2.js';
import { WB_SCHEMES } from './wbSchemesDataset.js';
import { WB_SCHEMES_PART2 } from './wbSchemesDatasetPart2.js';
import { OTHER_STATE_SCHEMES } from './otherStateSchemesDataset.js';
import { SUPPLEMENTARY_SCHEMES } from './supplementarySchemesDataset.js';

const ALL_STATE_SCHEMES = [
  ...CENTRAL_SCHEMES,
  ...CENTRAL_SCHEMES_PART2,
  ...WB_SCHEMES,
  ...WB_SCHEMES_PART2,
  ...OTHER_STATE_SCHEMES,
  ...SUPPLEMENTARY_SCHEMES
];

/**
 * Maps compact tuple entries [external_id, title, category, tag, description,
 * benefit, eligibility, source_url] to the standard scheme payload format.
 */
function mapTuple(entry) {
  const [external_id, title, category, tag, description, benefit, eligibility, source_url] = entry;
  return {
    external_id,
    title,
    category,
    tag,
    description,
    benefit,
    eligibility,
    source_url,
    source_last_updated: new Date().toISOString()
  };
}

export class StateSchemesAdapter extends BaseSchemeAdapter {
  constructor() {
    super('stateSchemes');
  }

  async fetchSchemes() {
    return ALL_STATE_SCHEMES.map(mapTuple);
  }
}

export const stateSchemesAdapter = new StateSchemesAdapter();
