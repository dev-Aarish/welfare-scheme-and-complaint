import { prisma } from '../config/prismaClient.js';

/**
 * GET /api/admin/dashboard
 * Protected admin dashboard statistics endpoint
 */
const DEMO_STATS = {
  totalComplaints: 8,
  pendingComplaints: 2,
  inProgressComplaints: 3,
  resolvedComplaints: 2,
  escalatedComplaints: 1,
  resolutionRate: 25,
  categoryCounts: {
    WATER_SUPPLY: 2,
    ELECTRICITY: 1,
    ROADS: 1,
    SANITATION: 2,
    FOOD_RATION: 1,
    PUBLIC_HEALTH: 1,
    OTHER: 0,
  },
  priorityCounts: {
    HIGH: 5,
    CRITICAL: 0,
    MEDIUM: 3,
    LOW: 0,
  },
  recentComplaints: [
    { id: 'c-1001', ref: 'SR-1001', title: 'Water Supply Disruption in Ward 12', location: 'Ward 12, Durganagar', status: 'OPEN', category: 'WATER_SUPPLY', priority: 'HIGH', createdAt: '2026-08-08T09:15:00.000Z' },
    { id: 'c-1002', ref: 'SR-1002', title: 'Street Light Outage on College Road', location: 'College Road, Block B', status: 'ASSIGNED', category: 'ELECTRICITY', priority: 'MEDIUM', createdAt: '2026-08-07T18:40:00.000Z' },
    { id: 'c-1003', ref: 'SR-1003', title: 'Pothole Repair Request near Station Road', location: 'Station Road, Ward 4', status: 'IN_PROGRESS', category: 'ROADS', priority: 'HIGH', createdAt: '2026-08-06T14:20:00.000Z' },
  ],
};

export async function getDashboardStats(req, res) {
  try {
    let stats;

    if (req.query.demo === '1') {
      stats = DEMO_STATS;
    } else {
      try {
        const [
          totalComplaints,
          openCount,
          pendingCount,
          assignedCount,
          inProgressCount,
          resolvedCount,
          closedCount,
          escalatedCount,
          allComplaints,
        ] = await Promise.all([
          prisma.complaint.count(),
          prisma.complaint.count({ where: { status: 'OPEN' } }),
          prisma.complaint.count({ where: { status: 'PENDING' } }),
          prisma.complaint.count({ where: { status: 'ASSIGNED' } }),
          prisma.complaint.count({ where: { status: 'IN_PROGRESS' } }),
          prisma.complaint.count({ where: { status: 'RESOLVED' } }),
          prisma.complaint.count({ where: { status: 'CLOSED' } }),
          prisma.complaint.count({ where: { status: 'ESCALATED' } }),
          prisma.complaint.findMany({
            select: { id: true, ref: true, title: true, location: true, status: true, category: true, priority: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 100,
          }),
        ]);

        const pendingTotal = openCount + pendingCount;
        const activeTotal = assignedCount + inProgressCount;
        const resolvedTotal = resolvedCount + closedCount;
        const resolutionRate = totalComplaints > 0 ? Math.round((resolvedTotal / totalComplaints) * 100) : 0;

        const categoryCounts = {
          WATER_SUPPLY: 0,
          ELECTRICITY: 0,
          ROADS: 0,
          SANITATION: 0,
          FOOD_RATION: 0,
          PUBLIC_HEALTH: 0,
          OTHER: 0,
        };

        const priorityCounts = {
          HIGH: 0,
          CRITICAL: 0,
          MEDIUM: 0,
          LOW: 0,
        };

        allComplaints.forEach((c) => {
          const cat = c.category ? c.category.toUpperCase().replace(/-/g, '_') : 'OTHER';
          if (categoryCounts[cat] !== undefined) categoryCounts[cat]++;
          else categoryCounts.OTHER++;

          const prio = c.priority ? c.priority.toUpperCase() : 'MEDIUM';
          if (priorityCounts[prio] !== undefined) priorityCounts[prio]++;
          else priorityCounts.MEDIUM++;
        });

        stats = {
          totalComplaints,
          pendingComplaints: pendingTotal,
          inProgressComplaints: activeTotal,
          resolvedComplaints: resolvedTotal,
          escalatedComplaints: escalatedCount,
          resolutionRate,
          categoryCounts,
          priorityCounts,
          recentComplaints: allComplaints.slice(0, 5),
        };
      } catch (dbErr) {
        console.warn('⚠️ Database query warning (using fallback metrics):', dbErr.message);
        stats = DEMO_STATS;
      }
    }

    return res.status(200).json({
      admin: {
        id: req.user.id,
        name: req.user.name || req.user.fullName || 'System Administrator',
        email: req.user.email,
        role: req.user.role,
      },
      stats,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard statistics',
    });
  }
}
