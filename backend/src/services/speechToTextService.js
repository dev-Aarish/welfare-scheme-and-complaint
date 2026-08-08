/**
 * Speech-to-text service — powers the voice button in the Sahayak chat.
 *
 * The browser's Web Speech API only transcribes English reliably, so
 * Bengali/Hindi voice queries are sent here instead, where the Sarvam AI
 * speech-to-text model (saarika) transcribes them natively.
 *
 * Requires `SARVAM_API_KEY` in backend/.env. When the key is missing the
 * service reports `available: false` and the frontend gracefully falls back
 * to the browser's built-in speech recognition.
 */

const SARVAM_STT_URL = 'https://api.sarvam.ai/speech-to-text';

/** Chat language id → Sarvam language code (matches the app's bn/hi/en). */
const LANGUAGE_CODE_MAP = {
  bn: 'bn-IN',
  hi: 'hi-IN',
  en: 'en-IN',
};

/**
 * Transcribes a short spoken query.
 *
 * @param {object} opts
 * @param {string} opts.audioBase64  Raw audio bytes, base64-encoded.
 * @param {string} [opts.mimeType]   e.g. 'audio/wav' (default 'audio/wav').
 * @param {string} [opts.language]   'bn' | 'hi' | 'en' (default 'en').
 * @returns {Promise<{available: boolean, transcript: string|null}>}
 *   `available: false` when SARVAM_API_KEY is not configured — callers should
 *   fall back to another transcription path.
 */
export async function transcribeAudio({ audioBase64, mimeType = 'audio/wav', language = 'en' }) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return { available: false, transcript: null };
  }

  const languageCode = LANGUAGE_CODE_MAP[language] || 'en-IN';
  // saarika:v1 was retired by Sarvam — v2.5 is the current model.
  const model = process.env.SARVAM_STT_MODEL || 'saarika:v2.5';
  const extension = (String(mimeType).split('/')[1] || 'wav').replace('x-', '');

  const form = new FormData();
  form.append(
    'file',
    new Blob([Buffer.from(audioBase64, 'base64')], { type: mimeType }),
    `sevanest-voice-${Date.now()}.${extension}`,
  );
  form.append('model', model);
  form.append('language_code', languageCode);

  const response = await fetch(SARVAM_STT_URL, {
    method: 'POST',
    headers: { 'api-subscription-key': apiKey },
    body: form,
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sarvam STT error ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = await response.json();
  const transcript = data?.transcript;
  return {
    available: true,
    transcript: typeof transcript === 'string' && transcript.trim() ? transcript.trim() : null,
  };
}
