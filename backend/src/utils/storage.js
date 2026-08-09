import { randomUUID } from 'node:crypto';
import { supabaseAdmin } from '../config/supabaseClient.js';
import { parseMedia } from './fileStore.js';

/* Private bucket for citizen verification documents. Objects are only ever
   fetched through short-lived signed URLs issued to the document's owner. */
export const DOCUMENT_BUCKET = 'citizen-documents';

const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

async function ensureBucket() {
  const { error } = await supabaseAdmin.storage.createBucket(DOCUMENT_BUCKET, {
    public: false,
  });
  // Creating an existing bucket is a no-op — swallow the duplicate error.
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`Failed to create storage bucket: ${error.message}`);
  }
}

/** Uploads a document data URL into the private bucket and returns its object
 *  path (e.g. citizen-documents/ration_card-<uuid>.jpg). Callers store that
 *  path in the DB; the signed-URL endpoint serves the actual file. */
export async function saveDocumentToStorage(dataUrl, docType) {
  const media = parseMedia(dataUrl, 'document');
  if (!media) return null;

  await ensureBucket();
  const objectPath = `${DOCUMENT_BUCKET}/${docType}-${randomUUID()}.${media.extension}`;
  const { error } = await supabaseAdmin.storage
    .from(DOCUMENT_BUCKET)
    .upload(objectPath, media.buffer, { contentType: media.mime });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return objectPath;
}

/** Returns a time-limited URL that can fetch a private storage object. */
export async function signDocumentUrl(objectPath, expiresInSeconds = SEVEN_DAYS_SECONDS) {
  const { data, error } = await supabaseAdmin.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(objectPath, expiresInSeconds);
  if (error) throw new Error(`Failed to sign document URL: ${error.message}`);
  return data.signedUrl;
}
