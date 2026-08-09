import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');
const MAX_FILE_BYTES = 8 * 1024 * 1024;

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

import { supabaseAdmin } from '../config/supabaseClient.js';

/** Writes a data-URL file into Supabase Storage or local uploads folder and returns its public URL */
export async function saveMedia(dataUrl, type) {
  const media = parseMedia(dataUrl, type);
  if (!media) return null;
  const filename = `${randomUUID()}.${media.extension}`;

  if (supabaseAdmin) {
    try {
      const bucketName = 'evidence';
      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(filename, media.buffer, { contentType: media.mime, upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from(bucketName)
          .getPublicUrl(filename);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (supaErr) {
      console.warn('⚠️ Supabase storage upload fallback to local disk:', supaErr.message);
    }
  }

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), media.buffer);
  return `/uploads/${filename}`;
}
