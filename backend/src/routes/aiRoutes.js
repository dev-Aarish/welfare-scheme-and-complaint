import { Router } from 'express';
import { matchSchemesPipeline } from '../services/aiSchemeMatcher.js';
import { parseNaturalLanguageProfile } from '../services/aiProfileParser.js';
import { classifyComplaintWithGemini } from '../services/complaintClassifierService.js';

const router = Router();

// POST /api/ai/match
router.post('/match', async (req, res) => {
  try {
    const { rawPrompt, structuredProfile } = req.body;
    const result = await matchSchemesPipeline({ rawPrompt, structuredProfile });
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error in /api/ai/match:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process AI scheme matching',
    });
  }
});

// POST /api/ai/parse-profile
router.post('/parse-profile', async (req, res) => {
  try {
    const { prompt } = req.body;
    const profile = await parseNaturalLanguageProfile(prompt);
    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error in /api/ai/parse-profile:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to parse natural language profile',
    });
  }
});

// POST /api/ai/classify-complaint — Gemini when configured; the frontend has a local fallback.
router.post('/classify-complaint', async (req, res) => {
  const { title, description, additionalInformation } = req.body;
  if (!title?.trim() || !description?.trim()) {
    return res.status(400).json({ success: false, error: 'Title and description are required.' });
  }
  const data = await classifyComplaintWithGemini({ title, description, additionalInformation });
  return res.status(200).json({ success: true, data, source: data ? 'gemini' : 'local-fallback' });
});

export default router;
