import { prisma } from '../config/prismaClient.js';
import { localCatalogAdapter } from '../services/ingestion/localCatalogAdapter.js';
import { mySchemeAdapter } from '../services/ingestion/mySchemeAdapter.js';
import { dataGovAdapter } from '../services/ingestion/dataGovAdapter.js';
import { normalizeScheme } from '../utils/schemeNormalizer.js';
import { validateScheme } from '../utils/schemeValidator.js';
import { deduplicateSchemes } from '../utils/schemeDeduplicator.js';

export const runSchemeSync = async () => {
  console.log('🚀 Starting Welfare Schemes Ingestion Pipeline...');
  const sources = [localCatalogAdapter, mySchemeAdapter, dataGovAdapter];
  let allRawSchemes = [];

  for (const source of sources) {
    try {
      console.log(`📡 Fetching from source adapter: ${source.name}...`);
      const raw = await source.fetchSchemes();
      const tagged = raw.map(item => ({ ...item, _sourceName: source.name }));
      allRawSchemes.push(...tagged);
    } catch (err) {
      console.error(`❌ Adapter error [${source.name}]:`, err.message);
    }
  }

  // 1. Normalize
  const normalized = allRawSchemes.map(normalizeScheme);
  // 2. Validate
  const validSchemes = normalized.filter(validateScheme);
  // 3. Deduplicate
  const deduplicated = deduplicateSchemes(validSchemes);

  console.log(`⚙️ Ingestion pipeline processed: ${allRawSchemes.length} raw -> ${validSchemes.length} valid -> ${deduplicated.length} deduplicated schemes.`);

  // 4. Prisma 6 Upsert
  let upsertCount = 0;
  for (const scheme of deduplicated) {
    try {
      await prisma.scheme.upsert({
        where: {
          source_external_id: {
            source: scheme.source,
            externalId: scheme.externalId
          }
        },
        update: {
          title: scheme.title,
          category: scheme.category,
          tag: scheme.tag,
          description: scheme.description,
          benefit: scheme.benefit,
          eligibility: scheme.eligibility,
          sourceUrl: scheme.sourceUrl,
          sourceLastUpdated: scheme.sourceLastUpdated,
          isActive: scheme.isActive
        },
        create: scheme
      });
      upsertCount++;
    } catch (err) {
      console.error(`❌ Error upserting scheme "${scheme.title}":`, err.message);
    }
  }

  console.log(`✅ Welfare Schemes Ingestion complete! Successfully upserted ${upsertCount} schemes into PostgreSQL.`);
  return upsertCount;
};
