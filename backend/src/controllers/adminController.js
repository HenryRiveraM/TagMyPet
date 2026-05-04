import { User } from '../models/User.js';
import { Pet } from '../models/Pet.js';
import { Adoption } from '../models/Adoption.js';
import { Clinic } from '../models/Clinic.js';
import { LostReport } from '../models/LostReport.js';
import { NfcTag } from '../models/NfcTag.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const stats = asyncHandler(async (_req, res) => {
  const [users, pets, lost, adoptions, premium, clinics, tags] = await Promise.all([
    User.countDocuments(),
    Pet.countDocuments(),
    LostReport.countDocuments({ estado: 'LOST' }),
    Adoption.countDocuments({ estado: 'OPEN' }),
    User.countDocuments({ plan: 'PREMIUM' }),
    Clinic.countDocuments(),
    NfcTag.countDocuments()
  ]);
  res.json({ users, pets, lost, adoptions, premium, clinics, tags });
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json(users);
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { estado: req.body.estado }, { new: true }).select('-password');
  res.json(user);
});
