import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import schemeRoutes from './routes/schemeRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { prisma } from './config/prismaClient.js';
import { initEscalationScheduler } from './services/escalationService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5100;

app.use(cors());
// 10mb so the voice button's base64 audio fits (the default 100kb would
// reject even a short voice query).
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL Database via Prisma 6 ORM!');
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
