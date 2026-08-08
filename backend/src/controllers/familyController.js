import * as FamilyModel from '../models/familyModel.js';

export const fetchFamilyMembers = async (req, res) => {
  try {
    // Authenticated sessions are always scoped to the signed-in user;
    // ?userId is kept for demo/guest mode where no session exists.
    const userId = req.user?.localUser?.id ?? req.query.userId ?? null;
    const members = await FamilyModel.getFamilyMembers(userId ? String(userId) : null);
    return res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error('Error fetching family members:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch family members'
    });
  }
};

export const createFamilyMember = async (req, res) => {
  try {
    const { fullName, relation, dob, age } = req.body;

    if (!fullName || !relation || (age === undefined && !dob)) {
      return res.status(400).json({
        success: false,
        error: 'Full name, relation, and Date of Birth (or age) are required.'
      });
    }

    const payload = req.user?.localUser?.id
      ? { ...req.body, userId: req.user.localUser.id }
      : req.body;
    const member = await FamilyModel.addFamilyMember(payload);
    return res.status(201).json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Error creating family member:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create family member'
    });
  }
};

export const updateFamilyMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await FamilyModel.updateFamilyMember(id, req.body);
    return res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error(`Error updating family member ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update family member'
    });
  }
};

export const removeFamilyMember = async (req, res) => {
  try {
    const { id } = req.params;
    await FamilyModel.deleteFamilyMember(id);
    return res.status(200).json({
      success: true,
      message: 'Family member removed successfully'
    });
  } catch (error) {
    console.error(`Error deleting family member ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete family member'
    });
  }
};
