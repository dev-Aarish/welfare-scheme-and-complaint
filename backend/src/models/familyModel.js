import { prisma } from '../config/prismaClient.js';

function calculateAgeFromDob(dobString) {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export const getFamilyMembers = async (userId) => {
  return prisma.familyMember.findMany({
    where: userId ? { userId } : {},
    orderBy: { createdAt: 'asc' }
  });
};

export const addFamilyMember = async (data) => {
  const computedAge = data.dob ? calculateAgeFromDob(data.dob) : (parseInt(data.age, 10) || 0);

  return prisma.familyMember.create({
    data: {
      userId: data.userId || null,
      fullName: data.fullName,
      relation: data.relation,
      dob: data.dob || null,
      age: computedAge,
      gender: data.gender || 'Male',
      occupation: data.occupation || 'Unemployed',
      annualIncome: parseFloat(data.annualIncome) || 0,
      isStudent: Boolean(data.isStudent),
      isDisability: Boolean(data.isDisability),
      landAcres: parseFloat(data.landAcres) || 0,
      notes: data.notes || null
    }
  });
};

export const updateFamilyMember = async (id, data) => {
  const computedAge = data.dob ? calculateAgeFromDob(data.dob) : (data.age !== undefined ? parseInt(data.age, 10) : undefined);

  return prisma.familyMember.update({
    where: { id },
    data: {
      fullName: data.fullName,
      relation: data.relation,
      dob: data.dob !== undefined ? data.dob : undefined,
      age: computedAge,
      gender: data.gender,
      occupation: data.occupation,
      annualIncome: data.annualIncome !== undefined ? parseFloat(data.annualIncome) : undefined,
      isStudent: data.isStudent !== undefined ? Boolean(data.isStudent) : undefined,
      isDisability: data.isDisability !== undefined ? Boolean(data.isDisability) : undefined,
      landAcres: data.landAcres !== undefined ? parseFloat(data.landAcres) : undefined,
      notes: data.notes
    }
  });
};

export const deleteFamilyMember = async (id) => {
  return prisma.familyMember.delete({
    where: { id }
  });
};
