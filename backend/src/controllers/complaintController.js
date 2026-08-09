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

/** GET /api/complaints — the signed-in citizen's own complaints, newest
 *  first, with the relations needed to render a tracking list (department,
 *  officer, remarks, evidence and the status trail). Anonymous reports are
 *  never returned here: they have no linked identity, by design. */
export async function getMyComplaints(req, res) {
  try {
    const userId = req.user?.localUser?.id;
    if (!userId) {
      return res.status(200).json({ success: true, data: [] });
    }

    const complaints = await prisma.complaint.findMany({
      where: { userId },
      include: {
        assignedDepartment: { select: { id: true, name: true, code: true } },
        assignedOfficer: { select: { id: true, fullName: true, email: true } },
        evidence: { orderBy: { createdAt: 'desc' } },
        remarks: { orderBy: { createdAt: 'desc' } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    console.error('Error fetching my complaints:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch complaints.' });
  }
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
    // No signed-in user → the report is anonymous and no identity is stored.
    const anonymous = !req.user?.localUser;
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
        statusHistory: { create: { newStatus: 'OPEN', changedById: req.user?.localUser?.id ?? null, remark: anonymous ? 'Complaint filed anonymously (no account).' : 'Complaint filed by citizen.' } },
      },
      select: { id: true, ref: true, status: true, createdAt: true },
    });
    return res.status(201).json({ success: true, data: { ...complaint, merged: false } });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to file complaint.' });
  }
}
