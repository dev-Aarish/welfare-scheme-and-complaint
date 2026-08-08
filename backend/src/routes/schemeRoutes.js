import { Router } from 'express';
import {
  fetchCategories,
  fetchSchemes,
  fetchSchemeById,
  addScheme,
  triggerSync
} from '../controllers/schemeController.js';

const router = Router();

// GET /api/schemes/categories - Dynamic list of distinct scheme categories
router.get('/categories', fetchCategories);

// GET /api/schemes - Dynamic search & category catalog retrieval
router.get('/', fetchSchemes);

// GET /api/schemes/:id - Single scheme detail
router.get('/:id', fetchSchemeById);

// POST /api/schemes - Admin creation endpoint
router.post('/', addScheme);

// POST /api/schemes/sync - Trigger open data ingestion sync
router.post('/sync', triggerSync);

export default router;
