import { runSchemeSync } from '../jobs/schemeSyncJob.js';
import { prisma } from '../config/prismaClient.js';

async function seed() {
  console.log('🌱 Starting Database Seeding...');
  try {
    await runSchemeSync();
    console.log('🌱 Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
