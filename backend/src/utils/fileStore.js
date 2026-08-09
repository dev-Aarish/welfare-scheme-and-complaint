import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { supabaseAdmin } from '../config/supabaseClient.js';

const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');
const MAX_FILE_BYTES = 8 * 1024 * 1024;

/* Evidence media lives in the Supabase Storage 'evidence' bucket (shared by
   every environment that talks to the same database) and its public URL is
   persisted — so images keep loading no matter which machine serves them.
   The local uploads/ folder is only used when Supabase is not configured
   at all (pure local development). */
const EVIDENCE_BUCKET = 'evidence';

const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'application/pdf': 'pdf',
};

/** Parses a `data:<mime>;base64,...` URL into a buffer + extension, or throws
 *  when the format is unsupported or the payload exceeds the 8 MB limit. */
export function parseMedia(dataUrl, type) {
  if (!dataUrl) return null;
  const match = /^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match || !MIME_EXTENSIONS[match[1]]) {
    throw new Error(`Unsupported ${type} format.`);
  }
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length || buffer.length > MAX_FILE_BYTES) {
    throw new Error(`${type} must be smaller than 8 MB.`);
  }
  return { buffer, extension: MIME_EXTENSIONS[match[1]], mime: match[1] };
}

/** Writes a data-URL file into Supabase Storage (preferred) or the local
 *  uploads folder, and returns a URL that resolves in any environment.
 *  Returns null when no data URL was supplied. */
export async function saveMedia(dataUrl, type) {
  const media = parseMedia(dataUrl, type);
  if (!media) return null;
  const filename = `${randomUUID()}.${media.extension}`;

  if (supabaseAdmin) {
    try {
      // Create the bucket on demand so the very first upload works even on a
      // freshly provisioned Supabase project. If it already exists, make sure
      // it is public — otherwise getPublicUrl returns a URL nobody can load.
      const { error: bucketError } = await supabaseAdmin.storage
        .createBucket(EVIDENCE_BUCKET, { public: true });
      if (bucketError) {
        if (!/already exists/i.test(bucketError.message)) {
          throw new Error(`Failed to create storage bucket: ${bucketError.message}`);
        }
        const { data: existing, error: infoErr } = await supabaseAdmin.storage
          .getBucket(EVIDENCE_BUCKET);
        if (!infoErr && existing && existing.public !== true) {
          const { error: updateErr } = await supabaseAdmin.storage
            .updateBucket(EVIDENCE_BUCKET, { public: true });
          if (updateErr) {
            throw new Error(`Failed to make bucket public: ${updateErr.message}`);
          }
        }
      }

      const { error: uploadError } = await supabaseAdmin.storage
        .from(EVIDENCE_BUCKET)
        .upload(filename, media.buffer, { contentType: media.mime, upsert: true });
      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(EVIDENCE_BUCKET)
        .getPublicUrl(filename);

      if (!publicUrlData?.publicUrl) {
        throw new Error('Storage returned no public URL for the uploaded file');
      }
      return publicUrlData.publicUrl;
    } catch (supaErr) {
      // Do NOT silently persist a local /uploads path when storage is
      // configured: the database is shared across environments, so that file
      // would 404 for every other machine. Fail the request loudly instead.
      throw new Error(`Evidence storage failed: ${supaErr.message}`);
    }
  }

  // Pure local development without Supabase credentials — write to disk.
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), media.buffer);
  return `/uploads/${filename}`;
}
