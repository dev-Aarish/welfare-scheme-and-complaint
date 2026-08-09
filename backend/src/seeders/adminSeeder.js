import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { prisma } from '../config/prismaClient.js';

dotenv.config();

/**
 * Creates or repairs the default admin user (admin@sevanest.gov.in / Admin@123!)
 * with a valid bcrypt hash and ADMIN role. Safe to call on every startup — it
 * fixes rows that were seeded without a password_hash (which previously locked
 * the admin out of the portal with a permanent "Invalid email or password").
 */
export async function ensureAdminUser() {
  const adminEmail = 'admin@sevanest.gov.in';
  const rawPassword = 'Admin@123!';
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: 'System Administrator',
        passwordHash: passwordHash,
        role: 'ADMIN',
        phone: '+91-9876543210',
        state: 'WEST_BENGAL',
        casteCategory: 'General',
        annualIncome: 500000,
      },
    });
    console.log('✅ Admin user created successfully:', adminUser.email);
  } else {
    // Ensure admin has role ADMIN and password hash updated
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: 'ADMIN',
        passwordHash: passwordHash,
      },
    });
    console.log('ℹ️ Admin user already exists. Verified credentials and ADMIN role.');
  }
}

export async function seedAdmin() {
  console.log('🌱 Seeding Admin User and Initial Complaint Data...');
  try {
    await ensureAdminUser();

    // Seed sample complaints if table is empty
    const complaintCount = await prisma.complaint.count();
    if (complaintCount === 0) {
      console.log('🌱 Seeding initial sample complaint statistics...');
      const sampleComplaints = [
        { ref: 'SR-1001', title: 'Water Supply Disruption', location: 'Ward 12, Durganagar', status: 'PENDING' },
        { ref: 'SR-1002', title: 'Street Light Outage', location: 'College Road, Block B', status: 'PENDING' },
        { ref: 'SR-1003', title: 'Pothole Repair Request', location: 'Station Road Ward 4', status: 'IN_PROGRESS' },
        { ref: 'SR-1004', title: 'Garbage Collection Delay', location: 'Market Complex Area', status: 'IN_PROGRESS' },
        { ref: 'SR-1005', title: 'Drainage Overflow Concern', location: 'Purba Para Ward 8', status: 'IN_PROGRESS' },
        { ref: 'SR-1006', title: 'Ration Shop Non-availability', location: 'Fair Price Shop 14', status: 'RESOLVED' },
        { ref: 'SR-1007', title: 'Mid-day Meal Quality Inquiry', location: 'Primary School Ward 2', status: 'RESOLVED' },
        { ref: 'SR-1008', title: 'Pipeline Leakage Urgent', location: 'Hospital Gate Ward 5', status: 'ESCALATED' },
      ];

      for (const comp of sampleComplaints) {
        await prisma.complaint.create({
          data: comp,
        });
      }
      console.log(`✅ Seeded ${sampleComplaints.length} initial sample complaints.`);
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.warn('⚠️ Could not connect to PostgreSQL database server for seeding:', error.message);
    console.log('💡 Note: The admin auth endpoint and dashboard statistics are configured with default fallback data for development/offline mode.');
  } finally {
    await prisma.$disconnect();
  }
}

// Execute directly if run via CLI
if (process.argv[1].endsWith('adminSeeder.js')) {
  seedAdmin();
}
