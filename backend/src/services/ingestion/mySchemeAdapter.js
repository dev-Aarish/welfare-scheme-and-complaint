import { BaseSchemeAdapter } from './baseAdapter.js';

export class MySchemeAdapter extends BaseSchemeAdapter {
  constructor() {
    super('myScheme');
    this.endpoint = process.env.MYSCHEME_API_URL || null;
  }

  async fetchSchemes() {
    // If endpoint is defined and confirmed, fetch from API.
    // Otherwise, return empty array to prevent failure.
    if (!this.endpoint) {
      console.log(`[${this.name}Adapter] No verified remote endpoint configured; skipping external HTTP fetch.`);
      return [];
    }

    try {
      const response = await fetch(this.endpoint);
      const data = await response.json();
      return Array.isArray(data) ? data : (data.schemes || []);
    } catch (err) {
      console.error(`[${this.name}Adapter] Error fetching remote endpoint:`, err.message);
      return [];
    }
  }
}

export const mySchemeAdapter = new MySchemeAdapter();
