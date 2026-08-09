import { prisma } from '../config/prismaClient.js';
import { storageEnabled, supabaseAdmin } from '../config/supabaseClient.js';
import { saveMedia } from '../utils/fileStore.js';
import { saveDocumentToStorage, signDocumentUrl } from '../utils/storage.js';

/* The six document slots shown on the citizen verification page. The docType
   values are the stable keys the frontend checklist maps to labels/icons. */
export const DOC_TYPES = [
  'aadhaar',
  'voter_id',
  'income_certificate',
  'ration_card',
  'bank_passbook',
  'land_record',
];

/** How long the simulated records cross-check takes before a submitted
 *  document flips to VERIFIED. The real flow will run an actual official
 *  verification (or an officer approval queue) in its place. */
const CROSS_CHECK_DELAY_MS = 2500;

export async function listDocuments(req, res) {
  try {
    if (!req.user?.localUser) {
      return res.status(200).json({ success: true, data: [] });
    }
    const documents = await prisma.citizenDocument.findMany({
      where: { userId: req.user.localUser.id },
      orderBy: { createdAt: 'asc' },
    });
    return res.status(200).json({ success: true, data: documents });
  } catch (error) {
    console.error('Error listing documents:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load documents.',
    });
  }
}

export async function uploadDocument(req, res) {
  try {
    if (!req.user?.localUser) {
      return res.status(401).json({
        success: false,
        error: 'Sign in to upload documents.',
      });
    }

    const { docType, fileName, fileData } = req.body;
    if (!DOC_TYPES.includes(docType)) {
      return res.status(400).json({
        success: false,
        error: 'Unknown document type.',
      });
    }
    if (!fileData) {
      return res.status(400).json({
        success: false,
        error: 'Please choose a file to upload.',
      });
    }

    // Save the file into Supabase Storage (private bucket) when the
    // service-role key is configured; otherwise fall back to the local
    // uploads/ folder so development without the key keeps working.
    const fileUrl = storageEnabled
      ? await saveDocumentToStorage(fileData, docType)
      : await saveMedia(fileData, 'document');

    // One row per (user, doc type) — a re-upload replaces the previous file
    // and restarts the cross-check instead of stacking duplicates.
    const document = await prisma.citizenDocument.upsert({
      where: { userId_docType: { userId: req.user.localUser.id, docType } },
      create: {
        userId: req.user.localUser.id,
        docType,
        fileName: fileName?.trim() || 'document',
        fileUrl,
        status: 'PENDING',
        note: 'Awaiting records cross-check',
      },
      update: {
        fileName: fileName?.trim() || 'document',
        fileUrl,
        status: 'PENDING',
        note: 'Awaiting records cross-check',
      },
    });

    // Simulated official cross-check against government records. Keeping this
    // server-side means the citizen's verification status always comes from
    // the backend — the frontend just reflects what the database says.
    setTimeout(async () => {
      try {
        await prisma.citizenDocument.update({
          where: { id: document.id },
          data: {
            status: 'VERIFIED',
            note: 'Cross-checked against official records',
          },
        });
      } catch (error) {
        console.error('Document cross-check failed:', error);
      }
    }, CROSS_CHECK_DELAY_MS);

    return res.status(201).json({ success: true, data: document });
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload document.',
    });
  }
}

/**
 * GET /api/auth/documents/:id/file
 * Returns a time-limited URL for the document owner to view their upload.
 * Storage-backed documents get a signed URL; local-dev fallback files are
 * served from the static /uploads path.
 */
export async function getDocumentFile(req, res) {
  try {
    if (!req.user?.localUser) {
      return res.status(401).json({
        success: false,
        error: 'Sign in to view documents.',
      });
    }

    const document = await prisma.citizenDocument.findFirst({
      where: { id: req.params.id, userId: req.user.localUser.id },
    });
    if (!document || !document.fileUrl) {
      return res.status(404).json({
        success: false,
        error: 'Document not found.',
      });
    }

    const url = document.fileUrl.startsWith('citizen-documents/')
      ? await signDocumentUrl(document.fileUrl)
      : document.fileUrl;

    return res.status(200).json({ success: true, data: { url } });
  } catch (error) {
    console.error('Error signing document URL:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load document.',
    });
  }
}

export async function deleteDocument(req, res) {
  try {
    if (!req.user?.localUser) {
      return res.status(401).json({
        success: false,
        error: 'Sign in to delete documents.',
      });
    }

    const { docType } = req.params;
    const document = await prisma.citizenDocument.findFirst({
      where: {
        userId: req.user.localUser.id,
        OR: [{ docType }, { id: docType }],
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found.',
      });
    }

    if (storageEnabled && document.fileUrl?.startsWith('citizen-documents/')) {
      try {
        await supabaseAdmin.storage.from('citizen-documents').remove([document.fileUrl]);
      } catch (err) {
        console.error('Storage deletion error:', err);
      }
    }

    await prisma.citizenDocument.delete({
      where: { id: document.id },
    });

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete document.',
    });
  }
}
