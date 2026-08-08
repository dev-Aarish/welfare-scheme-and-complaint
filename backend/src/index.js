import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import schemeRoutes from './routes/schemeRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { prisma } from './config/prismaClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/schemes', schemeRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/ai', aiRoutes);

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL Database via Prisma 6 ORM!');
  } catch (error) {
    console.warn('⚠️ PostgreSQL Connection Warning:', error.message);
    console.warn('💡 Tip: Update DATABASE_URL in backend/.env with your local PostgreSQL password.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Welfare Schemes Backend Server running on http://localhost:${PORT}`);
  });
}

startServer();
