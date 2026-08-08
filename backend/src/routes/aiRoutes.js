import { Router } from 'express';
import { matchSchemesPipeline } from '../services/aiSchemeMatcher.js';
import { parseNaturalLanguageProfile } from '../services/aiProfileParser.js';
import { classifyComplaintWithGemini } from '../services/complaintClassifierService.js';
import { generateAiChatReply } from '../services/aiChatService.js';
import { transcribeAudio } from '../services/speechToTextService.js';

const router = Router();

/* ── Minimal in-memory rate limiter ─────────────────────────
   Protects paid/free-tier API quotas (Groq/Gemini/Sarvam) from
   runaway traffic. Per-IP sliding window; generous for real use. */
const rateBuckets = new Map();

function createRateLimiter(limit, windowMs) {
  return function consume(ip) {
    const now = Date.now();
    // Prune dead buckets occasionally so the map doesn't grow unbounded.
    if (rateBuckets.size > 500) {
      for (const [key, times] of rateBuckets) {
        if (!times.some((t) => now - t < windowMs)) rateBuckets.delete(key);
      }
    }
    const recent = (rateBuckets.get(ip) || []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      rateBuckets.set(ip, recent);
      return false;
    }
    recent.push(now);
    rateBuckets.set(ip, recent);
    return true;
  };
}

const consumeChatQuota = createRateLimiter(8, 60 * 1000); // chat requests per minute
const consumeVoiceQuota = createRateLimiter(6, 60 * 1000); // voice transcriptions per minute

function clientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown'
  );
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

  const ip = clientIp(req);
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

// POST /api/ai/transcribe
// Voice button → text for the Sahayak chat (Sarvam AI STT). Transcribes in
// the chat's selected language (bn-IN / hi-IN / en-IN) so Bengali and Hindi
// voice queries work as well as English ones. `available: false` means the
// server has no SARVAM_API_KEY — the frontend then falls back to the
// browser's built-in (English-only) speech recognition.
router.post('/transcribe', async (req, res) => {
  const { audio, mimeType, language } = req.body || {};
  // A real recording is a few KB of base64 at minimum; anything shorter is
  // garbage and would only waste a paid Sarvam call.
  if (!audio || typeof audio !== 'string' || audio.length < 64) {
    return res.status(400).json({ success: false, error: 'audio (base64) is required' });
  }

  const ip = clientIp(req);
  if (!consumeVoiceQuota(ip)) {
    return res.status(429).json({ success: false, error: 'Too many voice messages — please wait a moment.' });
  }

  try {
    const result = await transcribeAudio({ audioBase64: audio, mimeType, language });
    if (!result.available) {
      return res.status(200).json({
        success: false,
        available: false,
        error: 'Voice transcription is not configured (SARVAM_API_KEY missing).',
      });
    }
    return res.status(200).json({
      success: true,
      available: true,
      transcript: result.transcript,
    });
  } catch (error) {
    console.error('Error in /api/ai/transcribe:', error);
    // Pass a short, safe slice of the reason through so the chat can show
    // something actionable instead of a generic "could not hear" message.
    const reason = error?.message ? String(error.message).slice(0, 160) : 'Failed to transcribe audio';
    return res.status(500).json({
      success: false,
      available: true,
      error: `Voice service error: ${reason}`,
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
