import { Router } from 'express';
import { matchSchemesPipeline } from '../services/aiSchemeMatcher.js';
import { parseNaturalLanguageProfile } from '../services/aiProfileParser.js';
import { generateAiChatReply } from '../services/aiChatService.js';

const router = Router();

/* ── Minimal in-memory rate limiter ─────────────────────────
   Protects the LLM free-tier quota (Groq/Gemini) from runaway
   chat traffic. Per-IP sliding window; generous for real use. */
const rateBuckets = new Map();
const CHAT_RATE_LIMIT = 8; // requests per window
const CHAT_RATE_WINDOW_MS = 60 * 1000;

function consumeChatQuota(ip) {
  const now = Date.now();
  // Prune dead buckets occasionally so the map doesn't grow unbounded.
  if (rateBuckets.size > 500) {
    for (const [key, times] of rateBuckets) {
      if (!times.some((t) => now - t < CHAT_RATE_WINDOW_MS)) rateBuckets.delete(key);
    }
  }
  const recent = (rateBuckets.get(ip) || []).filter((t) => now - t < CHAT_RATE_WINDOW_MS);
  if (recent.length >= CHAT_RATE_LIMIT) {
    rateBuckets.set(ip, recent);
    return false;
  }
  recent.push(now);
  rateBuckets.set(ip, recent);
  return true;
}

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

// POST /api/ai/chat
// Multilingual Sahayak chat — website knowledge + live scheme catalog.
router.post('/chat', async (req, res) => {
  const { messages, role, language, profile } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, error: 'messages are required' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  if (!consumeChatQuota(ip)) {
    return res.status(429).json({ success: false, error: 'Too many messages — please wait a moment.' });
  }

  try {
    const reply = await generateAiChatReply({ messages, role, language, profile });
    if (!reply) {
      return res.status(200).json({ success: false, error: 'AI is not configured on this server.' });
    }
    return res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error('Error in /api/ai/chat:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate chat reply' });
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

export default router;
