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

/** GET /api/complaints — signed-in citizen's own complaints */
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
        assignedOfficer: { select: { id: true, fullName: true, role: true } },
        evidence: { orderBy: { createdAt: 'desc' } },
        remarks: { orderBy: { createdAt: 'desc' } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        inquiries: { include: { messages: { orderBy: { createdAt: 'asc' } } } }
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    console.error('Error fetching my complaints:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch complaints.' });
  }
}

/** POST /api/complaints — File a new complaint with generated Ref & Secret Tracking PIN */
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
        select: { id: true, ref: true, trackingPin: true, priority: true, photoUrl: true, videoUrl: true, latitude: true, longitude: true },
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
        select: { id: true, ref: true, trackingPin: true, priority: true, status: true, updatedAt: true },
      });
      return res.status(200).json({ success: true, data: { ...complaint, trackingPin: existingComplaint.trackingPin, merged: true } });
    }

    // Generate Reference ID (e.g. SR-8K29F4) and 6-digit PIN (e.g. 739421)
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ref = `SR-${randomChars}`;
    const trackingPin = Math.floor(100000 + Math.random() * 900000).toString();

    const location = parsedLatitude !== null && parsedLongitude !== null
      ? `Ward area (${parsedLatitude.toFixed(4)}, ${parsedLongitude.toFixed(4)})`
      : 'Uluberia Municipal Area';

    const anonymous = !req.user?.localUser;
    const complaint = await prisma.complaint.create({
      data: {
        ref,
        trackingPin,
        title: title.trim(),
        description: description.trim(),
        category: categoryValue,
        priority: priority.trim().toUpperCase(),
        location,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        photoUrl,
        videoUrl,
        status: 'SUBMITTED',
        evidence: {
          create: [
            ...(photoUrl ? [{ mediaUrl: photoUrl, mediaType: 'PHOTO' }] : []),
            ...(videoUrl ? [{ mediaUrl: videoUrl, mediaType: 'VIDEO' }] : []),
          ],
        },
        userId: req.user?.localUser?.id ?? null,
        statusHistory: { create: { newStatus: 'SUBMITTED', changedById: req.user?.localUser?.id ?? null, remark: anonymous ? 'Grievance submitted anonymously.' : 'Grievance submitted by citizen.' } },
      },
      select: { id: true, ref: true, trackingPin: true, status: true, createdAt: true },
    });

    return res.status(201).json({ success: true, data: { ...complaint, trackingPin, merged: false } });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to file complaint.' });
  }
}

/** POST /api/complaints/track — Secure anonymous/authenticated complaint lookup using Reference ID + Secret PIN */
export async function trackComplaintSecurely(req, res) {
  try {
    const { referenceId, trackingPin } = req.body;
    if (!referenceId?.trim()) {
      return res.status(400).json({ success: false, error: 'Reference ID is required.' });
    }

    const refQuery = referenceId.trim().toUpperCase();
    const dbComplaint = await prisma.complaint.findFirst({
      where: {
        OR: [
          { ref: refQuery },
          { id: referenceId.trim() }
        ]
      },
      include: {
        assignedDepartment: { select: { id: true, name: true, code: true, description: true } },
        assignedOfficer: { select: { id: true, role: true } },
        evidence: { orderBy: { createdAt: 'desc' } },
        remarks: { orderBy: { createdAt: 'desc' } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        inquiries: {
          include: {
            messages: { orderBy: { createdAt: 'asc' } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!dbComplaint) {
      return res.status(404).json({ success: false, error: 'No complaint found with this Reference ID.' });
    }

    // Security check: require matching PIN unless signed in as owner
    const isOwner = req.user?.localUser?.id && dbComplaint.userId === req.user.localUser.id;
    const isPinValid = dbComplaint.trackingPin && trackingPin && dbComplaint.trackingPin.trim() === trackingPin.trim();

    if (!isOwner && !isPinValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Secret Tracking PIN. Please verify your Reference ID and 6-digit PIN.'
      });
    }

    // Privacy Protection: Expose only citizen-safe information (no personal officer emails/phones)
    const sanitizedComplaint = {
      id: dbComplaint.id,
      ref: dbComplaint.ref,
      title: dbComplaint.title,
      description: dbComplaint.description,
      status: dbComplaint.status,
      category: dbComplaint.category,
      priority: dbComplaint.priority,
      location: dbComplaint.location,
      latitude: dbComplaint.latitude,
      longitude: dbComplaint.longitude,
      photoUrl: dbComplaint.photoUrl,
      videoUrl: dbComplaint.videoUrl,
      department: dbComplaint.assignedDepartment ? {
        id: dbComplaint.assignedDepartment.id,
        name: dbComplaint.assignedDepartment.name,
        code: dbComplaint.assignedDepartment.code,
        description: dbComplaint.assignedDepartment.description,
        helpline: '1800-120-4567 (Official Municipal Helpline)'
      } : null,
      officerDesignation: dbComplaint.assignedOfficer ? (dbComplaint.assignedOfficer.role || 'Municipal Grievance Officer') : 'Ward Officer',
      evidence: dbComplaint.evidence.map(e => ({
        id: e.id,
        mediaUrl: e.mediaUrl,
        mediaType: e.mediaType,
        createdAt: e.createdAt
      })),
      statusHistory: dbComplaint.statusHistory.map(h => ({
        id: h.id,
        previousStatus: h.previousStatus,
        newStatus: h.newStatus,
        remark: h.remark,
        createdAt: h.createdAt
      })),
      inquiries: dbComplaint.inquiries.map(inq => ({
        id: inq.id,
        subject: inq.subject,
        status: inq.status,
        messages: inq.messages.map(m => ({
          id: m.id,
          senderType: m.senderType,
          senderName: m.senderName,
          message: m.message,
          attachmentUrl: m.attachmentUrl,
          createdAt: m.createdAt
        }))
      })),
      createdAt: dbComplaint.createdAt,
      updatedAt: dbComplaint.updatedAt
    };

    return res.status(200).json({ success: true, complaint: sanitizedComplaint });
  } catch (error) {
    console.error('Error tracking complaint securely:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve tracking details.' });
  }
}

/** POST /api/complaints/:id/inquiries/:inquiryId/reply — Citizen replies to an Admin Inquiry */
export async function replyToInquiry(req, res) {
  try {
    const { id, inquiryId } = req.params;
    const { message, attachment, trackingPin } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, error: 'Reply message cannot be empty.' });
    }

    const dbComplaint = await prisma.complaint.findFirst({
      where: { OR: [{ id }, { ref: id }] },
      include: { inquiries: true }
    });

    if (!dbComplaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    const isOwner = req.user?.localUser?.id && dbComplaint.userId === req.user.localUser.id;
    const isPinValid = dbComplaint.trackingPin && trackingPin && dbComplaint.trackingPin.trim() === trackingPin.trim();

    if (!isOwner && !isPinValid) {
      return res.status(401).json({ success: false, error: 'Invalid Tracking PIN.' });
    }

    const inquiry = await prisma.complaintInquiry.findUnique({
      where: { id: inquiryId }
    });

    if (!inquiry) {
      return res.status(404).json({ success: false, error: 'Inquiry not found.' });
    }

    const attachmentUrl = attachment ? await saveMedia(attachment, 'photo') : null;

    const [replyMsg] = await prisma.$transaction([
      prisma.complaintInquiryMessage.create({
        data: {
          inquiryId: inquiry.id,
          senderType: 'CITIZEN',
          senderName: 'Citizen',
          message: message.trim(),
          attachmentUrl
        }
      }),
      prisma.notification.create({
        data: {
          complaintId: dbComplaint.id,
          targetType: 'ADMIN',
          type: 'INQUIRY_REPLIED',
          title: 'Citizen Reply Received',
          message: `Citizen submitted reply for grievance ${dbComplaint.ref}: ${message.trim().slice(0, 100)}`
        }
      })
    ]);

    return res.status(201).json({ success: true, message: 'Reply sent successfully.', data: replyMsg });
  } catch (error) {
    console.error('Error replying to inquiry:', error);
    return res.status(500).json({ success: false, error: 'Failed to send reply.' });
  }
}

/** POST /api/complaints/:id/resolution — Citizen confirms resolution (CLOSE) or REOPENS complaint */
export async function confirmResolution(req, res) {
  try {
    const { id } = req.params;
    const { action, trackingPin, feedback } = req.body; // action: 'CLOSE' | 'REOPEN'

    if (!action || !['CLOSE', 'REOPEN'].includes(action.toUpperCase())) {
      return res.status(400).json({ success: false, error: 'Invalid action. Expected CLOSE or REOPEN.' });
    }

    const dbComplaint = await prisma.complaint.findFirst({
      where: { OR: [{ id }, { ref: id }] }
    });

    if (!dbComplaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    const isOwner = req.user?.localUser?.id && dbComplaint.userId === req.user.localUser.id;
    const isPinValid = dbComplaint.trackingPin && trackingPin && dbComplaint.trackingPin.trim() === trackingPin.trim();

    if (!isOwner && !isPinValid) {
      return res.status(401).json({ success: false, error: 'Invalid Tracking PIN.' });
    }

    const newStatus = action.toUpperCase() === 'CLOSE' ? 'CLOSED' : 'REOPENED';
    const remarkText = action.toUpperCase() === 'CLOSE'
      ? `Citizen confirmed resolution and closed the grievance. Feedback: "${feedback || 'Satisfied'}"`
      : `Citizen marked issue as unresolved and reopened the complaint. Reason: "${feedback || 'Not fixed yet'}"`;

    await prisma.$transaction([
      prisma.complaint.update({
        where: { id: dbComplaint.id },
        data: { status: newStatus }
      }),
      prisma.complaintStatusHistory.create({
        data: {
          complaintId: dbComplaint.id,
          previousStatus: dbComplaint.status,
          newStatus,
          remark: remarkText
        }
      }),
      prisma.notification.create({
        data: {
          complaintId: dbComplaint.id,
          targetType: 'ADMIN',
          type: 'RESOLUTION_CONFIRMED',
          title: newStatus === 'CLOSED' ? 'Grievance Closed by Citizen' : 'Grievance Reopened by Citizen',
          message: `Citizen marked grievance ${dbComplaint.ref} as ${newStatus}. ${feedback ? `Feedback: ${feedback}` : ''}`
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      status: newStatus,
      message: newStatus === 'CLOSED' ? 'Thank you! Your grievance is now officially closed.' : 'Your grievance has been reopened for department review.'
    });
  } catch (error) {
    console.error('Error in confirmResolution:', error);
    return res.status(500).json({ success: false, error: 'Failed to process resolution response.' });
  }
}
