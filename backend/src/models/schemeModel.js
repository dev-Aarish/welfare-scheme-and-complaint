import { prisma } from '../config/prismaClient.js';

export const getCategories = async () => {
  const result = await prisma.scheme.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' }
  });
  return result.map(item => item.category);
};

export const findSchemes = async ({ category, search, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  if (search && search.trim().length > 0) {
    const cleanSearch = search.trim();
    const pattern = `%${cleanSearch}%`;
    const selectedCategory = category && category.trim().length > 0 && category.toLowerCase() !== 'all' ? category.trim() : null;

    if (selectedCategory) {
      const schemes = await prisma.$queryRaw`
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
      const totalCount = countRes[0]?.count || 0;

      return { schemes, totalCount };
    } else {
      const schemes = await prisma.$queryRaw`
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
      const totalCount = countRes[0]?.count || 0;

      return { schemes, totalCount };
    }
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

  return { schemes, totalCount };
};

export const findSchemeById = async (id) => {
  return prisma.scheme.findUnique({
    where: { id }
  });
};

export const createScheme = async (data) => {
  return prisma.scheme.create({
    data
  });
};

export const updateScheme = async (id, data) => {
  return prisma.scheme.update({
    where: { id },
    data
  });
};
