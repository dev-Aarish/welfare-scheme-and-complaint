import { BaseSchemeAdapter } from './baseAdapter.js';
import axios from 'axios';
import { EXPANDED_GOVT_SCHEMES } from './expandedSchemesDataset.js';

/**
 * DataGovAdapter - Connects to Open Government Data (data.gov.in / Public Open Datasets)
 */
export class DataGovAdapter extends BaseSchemeAdapter {
  constructor() {
    super('dataGov');
    this.apiKey = process.env.DATA_GOV_API_KEY || null;
    this.resourceId = process.env.DATA_GOV_RESOURCE_ID || null;
  }

  async fetchSchemes() {
    // 1. If official data.gov.in API key and resource ID are provided in .env
    if (this.apiKey && this.resourceId) {
      const url = `https://api.data.gov.in/resource/${this.resourceId}?api-key=${this.apiKey}&format=json&limit=100`;
      console.log(`[${this.name}Adapter] Querying Official data.gov.in API...`);
      try {
        const response = await axios.get(url, { timeout: 8000 });
        const records = response.data?.records || [];
        console.log(`[${this.name}Adapter] Fetched ${records.length} records from data.gov.in API.`);
        if (records.length > 0) {
          return this.mapRecords(records);
        }
      } catch (err) {
        console.warn(`[${this.name}Adapter] data.gov.in API query warning:`, err.message);
      }
    }

    // 2. Open Public Indian Welfare Schemes Feed (100 real central & state schemes dataset)
    console.log(`[${this.name}Adapter] Ingesting 100+ Central & State Open Government Schemes...`);
    return EXPANDED_GOVT_SCHEMES.map(item => ({
      external_id: item.external_id,
      title: item.title,
      category: item.category,
      tag: item.tag || item.category,
      description: item.description,
      benefit: item.benefit,
      eligibility: item.eligibility,
      source_url: item.source_url,
      source_last_updated: new Date().toISOString()
    }));
  }

  mapRecords(records) {
    return records.map(item => ({
      external_id: item.id || item.scheme_id || item.title,
      title: item.title || item.scheme_name || item.name,
      category: item.category || item.sector || 'Social Security',
      tag: item.tag || item.category || 'General',
      description: item.description || item.details || item.objective || item.title,
      benefit: item.benefit || item.benefits || 'Financial assistance',
      eligibility: item.eligibility || item.eligibility_criteria || 'Eligible Citizens',
      source_url: item.url || item.website || 'https://data.gov.in',
      source_last_updated: item.updated_at || new Date().toISOString()
    }));
  }
}

export const dataGovAdapter = new DataGovAdapter();
