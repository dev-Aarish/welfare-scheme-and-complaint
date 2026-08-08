import { BaseSchemeAdapter } from './baseAdapter.js';

export class LocalCatalogAdapter extends BaseSchemeAdapter {
  constructor() {
    super('localCatalog');
  }

  async fetchSchemes() {
    return [
      {
        external_id: 'pmay',
        title: 'PM Awas Yojana',
        category: 'Housing',
        tag: 'Housing',
        description: 'Build or upgrade a permanent house for your family with a central grant.',
        benefit: '₹2.5L housing grant',
        eligibility: 'Rural · income under ₹3L',
        source_url: 'https://pmaymis.gov.in',
        source_last_updated: '2026-01-01T00:00:00.000Z'
      },
      {
        external_id: 'nfsa',
        title: 'Ration Card (NFSA)',
        category: 'Food',
        tag: 'Food security',
        description: 'Subsidised grain for every family member, delivered at your local depot.',
        benefit: '30 kg grain / month',
        eligibility: 'BPL households',
        source_url: 'https://nfsa.gov.in',
        source_last_updated: '2026-01-01T00:00:00.000Z'
      },
      {
        external_id: 'pmkisan',
        title: 'PM-Kisan Samman Nidhi',
        category: 'Farmer',
        tag: 'Farmer support',
        description: 'Direct income support for landholding farmers, credited to your bank account.',
        benefit: '₹6,000 / year',
        eligibility: 'Owns farmland',
        source_url: 'https://pmkisan.gov.in',
        source_last_updated: '2026-01-01T00:00:00.000Z'
      },
      {
        external_id: 'ayushman',
        title: 'Ayushman Bharat',
        category: 'Health',
        tag: 'Health cover',
        description: 'Cashless hospital cover for the whole family at empanelled hospitals.',
        benefit: '₹5L health cover',
        eligibility: 'Rural · income-linked',
        source_url: 'https://pmjay.gov.in',
        source_last_updated: '2026-01-01T00:00:00.000Z'
      },
      {
        external_id: 'kanyashree',
        title: 'Kanyashree Prakalpa',
        category: 'Education',
        tag: 'Girl child',
        description: 'Annual scholarship to keep girls in school until they turn 18.',
        benefit: '₹25,000 scholarship',
        eligibility: 'Girl child · school-going',
        source_url: 'https://wbkanyashree.gov.in',
        source_last_updated: '2026-01-01T00:00:00.000Z'
      },
      {
        external_id: 'sukanya',
        title: 'Sukanya Samriddhi',
        category: 'Savings',
        tag: 'Savings',
        description: 'A high-interest savings account for your daughter’s education and marriage.',
        benefit: '8.2% p.a. interest',
        eligibility: 'Girl child under 10',
        source_url: 'https://www.indiapost.gov.in',
        source_last_updated: '2026-01-01T00:00:00.000Z'
      },
      {
        external_id: 'ujjwala',
        title: 'PM Ujjwala Yojana',
        category: 'Women',
        tag: 'Clean cooking',
        description: 'Free LPG connection for women in BPL households — cleaner, safer cooking.',
        benefit: 'Free LPG connection',
        eligibility: 'Women · BPL',
        source_url: 'https://www.pmuy.gov.in',
        source_last_updated: '2026-01-01T00:00:00.000Z'
      },
      {
        external_id: 'mgnrega',
        title: 'MGNREGA',
        category: 'Farmer',
        tag: 'Employment',
        description: 'Guaranteed 100 days of wage work per year for rural households.',
        benefit: '100 days of work',
        eligibility: 'Rural adult · 18+',
        source_url: 'https://nrega.nic.in',
        source_last_updated: '2026-01-01T00:00:00.000Z'
      },
      {
        external_id: 'jandhan',
        title: 'PM Jan Dhan Yojana',
        category: 'Savings',
        tag: 'Banking',
        description: 'A zero-balance bank account with accident cover and insurance benefits.',
        benefit: 'Zero-balance account + ₹2L cover',
        eligibility: 'All adults',
        source_url: 'https://pmjdy.gov.in',
        source_last_updated: '2026-01-01T00:00:00.000Z'
      },
      {
        external_id: 'matru',
        title: 'Matru Vandana Yojana',
        category: 'Women',
        tag: 'Maternity',
        description: 'Maternity benefit for the first child, paid in cash instalments.',
        benefit: '₹5,000 maternity benefit',
        eligibility: 'First pregnancy · 19+',
        source_url: 'https://wcd.nic.in',
        source_last_updated: '2026-01-01T00:00:00.000Z'
      },
      {
        external_id: 'fasal',
        title: 'PM Fasal Bima Yojana',
        category: 'Farmer',
        tag: 'Crop insurance',
        description: 'Crop insurance against drought, flood, pests and other natural risks.',
        benefit: 'Subsidised crop cover',
        eligibility: 'Cultivating farmers',
        source_url: 'https://pmfby.gov.in',
        source_last_updated: '2026-01-01T00:00:00.000Z'
      },
      {
        external_id: 'ignoaps',
        title: 'Old Age Pension (IGNOAPS)',
        category: 'Pension',
        tag: 'Senior care',
        description: 'Monthly pension for senior citizens aged 60+ without other income.',
        benefit: '₹1,000 / month',
        eligibility: 'Age 60+ · BPL',
        source_url: 'https://nsap.nic.in',
        source_last_updated: '2026-01-01T00:00:00.000Z'
      }
    ];
  }
}

export const localCatalogAdapter = new LocalCatalogAdapter();
