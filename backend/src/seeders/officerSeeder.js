import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { prisma } from '../config/prismaClient.js';
import { supabaseAdmin } from '../config/supabaseClient.js';

dotenv.config();

/**
 * Default sample officers — mirrors SAMPLE_OFFICERS in
 * backend/src/controllers/adminComplaintController.js so the admin portal's
 * officer-assignment dropdown reads real database rows (not just the in-memory
 * fallback) and officer-only endpoints have users to authenticate.
 *
 * Designation is kept for display/consistency, but the User model has no
 * dedicated designation column — the admin dropdown derives "Officer" from
 * the role, and the officer front-end pages render from frontend/src/data.ts.
 */
export const SAMPLE_OFFICERS = [
  {
    email: 'rajiv.das@sevanest.gov.in',
    fullName: 'Rajiv Das',
    designation: 'Block Officer · Uluberia-I',
    block: 'Uluberia-I',
    district: 'Howrah',
    state: 'WEST_BENGAL',
  },
  {
    email: 'ananya.s@sevanest.gov.in',
    fullName: 'Ananya Sharma',
    designation: 'Assistant Engineer · Public Works',
    block: 'Uluberia-I',
    district: 'Howrah',
    state: 'WEST_BENGAL',
  },
  {
    email: 'bikramjit.r@sevanest.gov.in',
    fullName: 'Bikramjit Roy',
    designation: 'Sanitation Inspector',
    block: 'Uluberia-I',
    district: 'Howrah',
    state: 'WEST_BENGAL',
  },
  {
    email: 'sunita.p@sevanest.gov.in',
    fullName: 'Sunita Paul',
    designation: 'Public Health Officer',
    block: 'Uluberia-I',
    district: 'Howrah',
    state: 'WEST_BENGAL',
  },
];

export const DEFAULT_OFFICER_PASSWORD = 'Officer@123!';

/**
 * Creates or repairs the sample officer users (role: OFFICER) with a valid
 * bcrypt hash. Safe to call on every startup — it fixes rows that were seeded
 * without a password_hash and forces the OFFICER role so the admin workflow
 * dropdown and officer routes always have real users to work with.
 */
export async function ensureOfficerUsers() {
  const passwordHash = await bcrypt.hash(DEFAULT_OFFICER_PASSWORD, 10);

  for (const officer of SAMPLE_OFFICERS) {
    const baseData = {
      role: 'OFFICER',
      passwordHash,
      block: officer.block,
      district: officer.district,
      state: officer.state,
    };

    const existingOfficer = await prisma.user.findUnique({
      where: { email: officer.email },
    });

    if (!existingOfficer) {
      await prisma.user.create({
        data: {
          email: officer.email,
          fullName: officer.fullName,
          ...baseData,
        },
      });
      console.log(`✅ Officer user created successfully: ${officer.email} (${officer.designation})`);
    } else {
      // Ensure the row keeps the OFFICER role and a usable password hash
      await prisma.user.update({
        where: { email: officer.email },
        data: baseData,
      });
      console.log(`ℹ️ Officer user already exists. Verified OFFICER role and credentials: ${officer.email}`);
    }
  }
}

/**
 * Ensures a matching Supabase auth user exists for each seeded officer, so the
 * frontend officer sign-in form (supabase.auth.signInWithPassword) can
 * authenticate. Only runs when SUPABASE_SERVICE_ROLE_KEY is configured; skips
 * silently otherwise so local dev without the key keeps working.
 */
export async function ensureSupabaseOfficerUsers() {
  if (!supabaseAdmin) {
    console.log('ℹ️ Supabase service-role key not configured — skipping Supabase auth user sync.');
    return;
  }

  // Resolve existing auth users once (this auth-js version has no
  // getUserByEmail — listUsers + local filter instead). Single page of up to
  // 1000 users is plenty for this project's scale.
  const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    console.warn('⚠️ Could not list Supabase auth users:', listError.message);
    return;
  }

  const byEmail = new Map((listData?.users ?? []).map((u) => [u.email, u]));

  for (const officer of SAMPLE_OFFICERS) {
    const existing = byEmail.get(officer.email);

    if (existing) {
      // Keep the officer role metadata stamped so the app gates on it.
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        user_metadata: { role: 'officer', fullName: officer.fullName },
      });
      if (updateError) {
        console.warn(`⚠️ Could not update Supabase auth user ${officer.email}:`, updateError.message);
        continue;
      }
      console.log(`ℹ️ Supabase auth user already exists: ${officer.email}`);
      continue;
    }

    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: officer.email,
      password: DEFAULT_OFFICER_PASSWORD,
      email_confirm: true,
      user_metadata: { role: 'officer', fullName: officer.fullName },
    });

    if (createError) {
      console.warn(`⚠️ Could not create Supabase auth user ${officer.email}:`, createError.message);
    } else {
      console.log(`✅ Supabase auth user created: ${officer.email} / ${DEFAULT_OFFICER_PASSWORD}`);
    }
  }
}

/** Combined bootstrap — Prisma rows + Supabase auth users, safe to call on
 *  every startup (mirrors ensureAdminUser). */
export async function ensureOfficers() {
  await ensureOfficerUsers();
  await ensureSupabaseOfficerUsers();
}

export async function seedOfficers() {
  console.log('🌱 Seeding Officer Users...');
  try {
    await ensureOfficers();
    console.log('🎉 Officer seeding completed successfully!');
  } catch (error) {
    console.warn('⚠️ Could not connect to PostgreSQL database server for seeding:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute directly if run via CLI
if (process.argv[1].endsWith('officerSeeder.js')) {
  seedOfficers();
}
