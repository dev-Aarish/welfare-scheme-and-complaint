import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import schemeRoutes from './routes/schemeRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import { prisma } from './config/prismaClient.js';
import { initEscalationScheduler } from './services/escalationService.js';
import { seedDepartments } from './seeders/departmentSeeder.js';
import { ensureAdminUser } from './seeders/adminSeeder.js';
import { ensureOfficers } from './seeders/officerSeeder.js';

const app = express();
const PORT = process.env.PORT || 5100;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  // Production Vercel frontend — set FRONTEND_URL env var on Render
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  // Allow all *.vercel.app subdomains for preview deployments
  /^https:\/\/.*\.vercel\.app$/,
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser requests (Postman, mobile)
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    callback(null, allowed ? origin : false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use('/uploads', express.static('uploads'));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/complaints', complaintRoutes);

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL Database via Prisma 6 ORM!');
    await seedDepartments();
    // Bootstrap/repair the default admin credentials on every start so a
    // freshly deployed or partially-seeded database can never lock the
    // admin out of the portal.
    await ensureAdminUser();
    // Bootstrap/repair the sample officer users (Prisma rows + Supabase auth)
    // on every start so the admin officer-assignment dropdown, officer routes
    // and the officer sign-in form all have real users to work with.
    await ensureOfficers();
  } catch (error) {
    console.warn('⚠️ PostgreSQL Connection Warning:', error.message);
    console.warn('💡 Tip: Update DATABASE_URL in backend/.env with your local PostgreSQL password.');
  }

  // Initialize Escalation System background scheduler
  initEscalationScheduler();

  app.listen(PORT, () => {
    console.log(`🚀 Welfare Schemes Backend Server running on http://localhost:${PORT}`);
  });
}

startServer();
