import { prisma } from '../config/prismaClient.js';
import { saveMedia } from '../utils/fileStore.js';

const DUPLICATE_RADIUS_METRES = 200;

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
