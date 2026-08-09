import { prisma } from '../config/prismaClient.js';

// In-Memory Cache for Deployment Performance (5 min TTL)
let categoriesCache = { data: null, timestamp: 0 };
let schemesCacheMap = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

export const getCategories = async () => {
  const now = Date.now();
  if (categoriesCache.data && (now - categoriesCache.timestamp < CACHE_TTL_MS)) {
    return categoriesCache.data;
  }

  try {
    const result = await prisma.scheme.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });
    const categories = result.map(item => item.category);
    categoriesCache = { data: categories, timestamp: now };
    return categories;
  } catch (err) {
    console.warn('⚠️ getCategories DB error; using cached or fallback categories:', err.message);
    return categoriesCache.data || ['Housing', 'Food', 'Health', 'Farmer', 'Education', 'Women', 'Savings', 'Pension'];
  }
};

export const findSchemes = async ({ category, search, page = 1, limit = 20 }) => {
  const cacheKey = `${category || 'ALL'}_${search || ''}_${page}_${limit}`;
  const now = Date.now();

  const cached = schemesCacheMap.get(cacheKey);
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.result;
  }

  const skip = (page - 1) * limit;

  try {
    if (search && search.trim().length > 0) {
      const cleanSearch = search.trim();
      const pattern = `%${cleanSearch}%`;
      const selectedCategory = category && category.trim().length > 0 && category.toLowerCase() !== 'all' ? category.trim() : null;

      let schemes = [];
      let totalCount = 0;

      if (selectedCategory) {
        schemes = await prisma.$queryRaw`
          SELECT id, external_id AS "externalId", source, source_url AS "sourceUrl", source_last_updated AS "sourceLastUpdated",
                 title, category, tag, description, benefit, eligibility, is_active AS "isActive",
                 applications_count AS "applicationsCount", created_at AS "createdAt", updated_at AS "updatedAt"
          FROM schemes
          WHERE is_active = true
            AND LOWER(category) = LOWER(${selectedCategory})
            AND (
              to_tsvector('english', concat_ws(' ', title, category, tag, benefit, description, eligibility)) @@ plainto_tsquery('english', ${cleanSearch})
              OR title ILIKE ${pattern}
              OR category ILIKE ${pattern}
              OR tag ILIKE ${pattern}
              OR description ILIKE ${pattern}
              OR benefit ILIKE ${pattern}
              OR eligibility ILIKE ${pattern}
            )
          ORDER BY title ASC
          LIMIT ${limit} OFFSET ${skip};
        `;

        const countRes = await prisma.$queryRaw`
          SELECT COUNT(*)::int AS count
          FROM schemes
          WHERE is_active = true
            AND LOWER(category) = LOWER(${selectedCategory})
            AND (
              to_tsvector('english', concat_ws(' ', title, category, tag, benefit, description, eligibility)) @@ plainto_tsquery('english', ${cleanSearch})
              OR title ILIKE ${pattern}
              OR category ILIKE ${pattern}
              OR tag ILIKE ${pattern}
              OR description ILIKE ${pattern}
              OR benefit ILIKE ${pattern}
              OR eligibility ILIKE ${pattern}
            );
        `;
        totalCount = countRes[0]?.count || 0;
      } else {
        schemes = await prisma.$queryRaw`
          SELECT id, external_id AS "externalId", source, source_url AS "sourceUrl", source_last_updated AS "sourceLastUpdated",
                 title, category, tag, description, benefit, eligibility, is_active AS "isActive",
                 applications_count AS "applicationsCount", created_at AS "createdAt", updated_at AS "updatedAt"
          FROM schemes
          WHERE is_active = true
            AND (
              to_tsvector('english', concat_ws(' ', title, category, tag, benefit, description, eligibility)) @@ plainto_tsquery('english', ${cleanSearch})
              OR title ILIKE ${pattern}
              OR category ILIKE ${pattern}
              OR tag ILIKE ${pattern}
              OR description ILIKE ${pattern}
              OR benefit ILIKE ${pattern}
              OR eligibility ILIKE ${pattern}
            )
          ORDER BY title ASC
          LIMIT ${limit} OFFSET ${skip};
        `;

        const countRes = await prisma.$queryRaw`
          SELECT COUNT(*)::int AS count
          FROM schemes
          WHERE is_active = true
            AND (
              to_tsvector('english', concat_ws(' ', title, category, tag, benefit, description, eligibility)) @@ plainto_tsquery('english', ${cleanSearch})
              OR title ILIKE ${pattern}
              OR category ILIKE ${pattern}
              OR tag ILIKE ${pattern}
              OR description ILIKE ${pattern}
              OR benefit ILIKE ${pattern}
              OR eligibility ILIKE ${pattern}
            );
        `;
        totalCount = countRes[0]?.count || 0;
      }

      const resObj = { schemes, totalCount };
      schemesCacheMap.set(cacheKey, { result: resObj, timestamp: now });
      return resObj;
    }

    const whereClause = {
      isActive: true,
      ...(category && category.trim().length > 0 && category.toLowerCase() !== 'all'
        ? { category: { equals: category.trim(), mode: 'insensitive' } }
        : {})
    };

    const [schemes, totalCount] = await Promise.all([
      prisma.scheme.findMany({
        where: whereClause,
        take: limit,
        skip,
        orderBy: { title: 'asc' }
      }),
      prisma.scheme.count({ where: whereClause })
    ]);

    const resObj = { schemes, totalCount };
    schemesCacheMap.set(cacheKey, { result: resObj, timestamp: now });
    return resObj;
  } catch (err) {
    console.warn('⚠️ findSchemes DB error; returning fallback:', err.message);
    const cachedAny = Array.from(schemesCacheMap.values())[0];
    return cachedAny ? cachedAny.result : { schemes: [], totalCount: 0 };
  }
};

export const findSchemeById = async (id) => {
  try {
    return await prisma.scheme.findUnique({ where: { id } });
  } catch (err) {
    console.warn(`⚠️ findSchemeById error for ${id}:`, err.message);
    return null;
  }
};

export const createScheme = async (data) => {
  schemesCacheMap.clear();
  categoriesCache = { data: null, timestamp: 0 };
  return prisma.scheme.create({ data });
};

export const updateScheme = async (id, data) => {
  schemesCacheMap.clear();
  categoriesCache = { data: null, timestamp: 0 };
  return prisma.scheme.update({
    where: { id },
    data
  });
};
