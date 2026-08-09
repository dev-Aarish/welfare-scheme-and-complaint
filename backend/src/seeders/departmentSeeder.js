import { prisma } from '../config/prismaClient.js';

export const OFFICIAL_DEPARTMENTS = [
  {
    id: 'dept-sanitation',
    name: 'Sanitation & Waste Management',
    code: 'SAN-WASTE',
    description: 'Responsible for garbage collection, public sanitation, street cleaning, and solid waste processing.'
  },
  {
    id: 'dept-roads',
    name: 'Public Works & Roads',
    code: 'PWD-ROADS',
    description: 'Maintains block roads, potholes, street infrastructure, bridges, and public construction.'
  },
  {
    id: 'dept-water',
    name: 'Water Supply & Drainage',
    code: 'WATER-DRAIN',
    description: 'Manages drinking water supply pipelines, tube-wells, drainage clearance, and flood mitigation.'
  },
  {
    id: 'dept-electricity',
    name: 'Electricity & Lighting',
    code: 'ELEC-LIGHT',
    description: 'Handles streetlights, electrical transformers, power distribution grid, and municipal lighting.'
  },
  {
    id: 'dept-ration',
    name: 'Food & Civil Supplies',
    code: 'FOOD-SUPPLY',
    description: 'Manages ration card distribution, PDS shops, fair price shops, and essential food items.'
  },
  {
    id: 'dept-health',
    name: 'Public Health & Sanitation',
    code: 'HEALTH-MED',
    description: 'Oversees block health centres, vector control, anti-mosquito drives, and immunization.'
  },
  {
    id: 'dept-education',
    name: 'Primary & Secondary Education',
    code: 'EDU-SCHOOL',
    description: 'Manages government schools, mid-day meal schemes, and school infrastructure.'
  },
  {
    id: 'dept-wcd',
    name: 'Women & Child Development',
    code: 'WCD-ANG',
    description: 'Oversees Anganwadi centres, child nutrition schemes, and women empowerment initiatives.'
  },
  {
    id: 'dept-transport',
    name: 'Transport & Traffic',
    code: 'TRANS-TRAFF',
    description: 'Handles local bus transit, rickshaw routes, passenger safety, and traffic management.'
  },
  {
    id: 'dept-housing',
    name: 'Housing & Municipal Affairs',
    code: 'HOUS-MUNI',
    description: 'Manages housing schemes (PMAY), building permits, and municipal governance.'
  }
];

export async function seedDepartments() {
  console.log('🌱 Seeding municipal departments into PostgreSQL...');
  for (const dept of OFFICIAL_DEPARTMENTS) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {
        code: dept.code,
        description: dept.description
      },
      create: {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        description: dept.description
      }
    });
  }
  console.log(`✅ Successfully seeded ${OFFICIAL_DEPARTMENTS.length} municipal departments into PostgreSQL!`);
}

if (process.argv[1]?.endsWith('departmentSeeder.js')) {
  seedDepartments()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
