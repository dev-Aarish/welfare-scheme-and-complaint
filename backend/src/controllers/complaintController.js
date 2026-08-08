import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { prisma } from '../config/prismaClient.js';

const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const DUPLICATE_RADIUS_METRES = 200;
const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

function parseMedia(dataUrl, type) {
  if (!dataUrl) return null;
  const match = /^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match || !MIME_EXTENSIONS[match[1]]) {
    throw new Error(`Unsupported ${type} format.`);
  }
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length || buffer.length > MAX_FILE_BYTES) {
    throw new Error(`${type} must be smaller than 8 MB.`);
  }
  return { buffer, extension: MIME_EXTENSIONS[match[1]] };
}

async function saveMedia(dataUrl, type) {
  const media = parseMedia(dataUrl, type);
  if (!media) return null;
  await mkdir(uploadsDir, { recursive: true });
  const filename = `${randomUUID()}.${media.extension}`;
  await writeFile(path.join(uploadsDir, filename), media.buffer);
  return `/uploads/${filename}`;
}

function distanceInMetres(latitudeA, longitudeA, latitudeB, longitudeB) {
  const earthRadius = 6371000;
  const toRadians = (value) => value * Math.PI / 180;
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const area = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(latitudeA)) * Math.cos(toRadians(latitudeB)) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(area), Math.sqrt(1 - area));
}

function raisePriority(priority) {
  const levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const currentIndex = levels.indexOf(String(priority).toUpperCase());
  return levels[Math.min(Math.max(currentIndex, 0) + 1, levels.length - 1)];
}

export async function createComplaint(req, res) {
  try {
    const { title, description, category, priority, latitude, longitude, photo, video } = req.body;
    if (!title?.trim() || !description?.trim() || !category?.trim() || !priority?.trim()) {
      return res.status(400).json({ success: false, error: 'Title, description, category, and priority are required.' });
    }
    const parsedLatitude = latitude === '' || latitude === undefined ? null : Number(latitude);
    const parsedLongitude = longitude === '' || longitude === undefined ? null : Number(longitude);
    if ((parsedLatitude !== null && !Number.isFinite(parsedLatitude)) || (parsedLongitude !== null && !Number.isFinite(parsedLongitude))) {
      return res.status(400).json({ success: false, error: 'Location coordinates are invalid.' });
    }

    const categoryValue = category.trim().toUpperCase().replace(/-/g, '_');
    let existingComplaint = null;
    if (parsedLatitude !== null && parsedLongitude !== null) {
      const candidates = await prisma.complaint.findMany({
        where: { category: categoryValue, status: { notIn: ['RESOLVED', 'CLOSED'] }, latitude: { not: null }, longitude: { not: null } },
        select: { id: true, ref: true, priority: true, photoUrl: true, videoUrl: true, latitude: true, longitude: true },
        orderBy: { createdAt: 'desc' },
      });
      existingComplaint = candidates.find((candidate) => distanceInMetres(
        parsedLatitude,
        parsedLongitude,
        candidate.latitude,
        candidate.longitude,
      ) <= DUPLICATE_RADIUS_METRES) || null;
    }

    const [photoUrl, videoUrl] = await Promise.all([saveMedia(photo, 'photo'), saveMedia(video, 'video')]);

    if (existingComplaint) {
      const complaint = await prisma.complaint.update({
        where: { id: existingComplaint.id },
        data: {
          priority: raisePriority(existingComplaint.priority),
          photoUrl: existingComplaint.photoUrl || photoUrl,
          videoUrl: existingComplaint.videoUrl || videoUrl,
          evidence: {
            create: [
              ...(photoUrl ? [{ mediaUrl: photoUrl, mediaType: 'PHOTO' }] : []),
              ...(videoUrl ? [{ mediaUrl: videoUrl, mediaType: 'VIDEO' }] : []),
            ],
          },
          remarks: { create: { remark: 'A matching anonymous report was received from the same area. Priority increased automatically.' } },
        },
        select: { id: true, ref: true, priority: true, status: true, updatedAt: true },
      });
      return res.status(200).json({ success: true, data: { ...complaint, merged: true } });
    }

    const ref = `SR-${Date.now().toString().slice(-7)}-${Math.floor(Math.random() * 90 + 10)}`;
    const location = parsedLatitude !== null && parsedLongitude !== null
      ? `${parsedLatitude.toFixed(6)}, ${parsedLongitude.toFixed(6)}`
      : 'Location not shared';
    const complaint = await prisma.complaint.create({
      data: {
        ref,
        title: title.trim(),
        description: description.trim(),
        category: categoryValue,
        priority: priority.trim().toUpperCase(),
        location,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        photoUrl,
        videoUrl,
        evidence: {
          create: [
            ...(photoUrl ? [{ mediaUrl: photoUrl, mediaType: 'PHOTO' }] : []),
            ...(videoUrl ? [{ mediaUrl: videoUrl, mediaType: 'VIDEO' }] : []),
          ],
        },
        userId: req.user?.localUser?.id ?? null,
        statusHistory: { create: { newStatus: 'OPEN', changedById: req.user?.localUser?.id ?? null, remark: 'Complaint filed by citizen.' } },
      },
      select: { id: true, ref: true, status: true, createdAt: true },
    });
    return res.status(201).json({ success: true, data: { ...complaint, merged: false } });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to file complaint.' });
  }
}
