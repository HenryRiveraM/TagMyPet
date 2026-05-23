import { PremiumRequest } from '../models/PremiumRequest.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listMyPremiumRequests = asyncHandler(async (req, res) => {
  const requests = await PremiumRequest.find({ user: req.user._id }).sort('-createdAt');
  res.json(requests);
});

export const createPremiumRequest = asyncHandler(async (req, res) => {
  if (req.user.plan === 'PREMIUM') throw new ApiError('Tu cuenta ya tiene Premium activo', 409);
  const pending = await PremiumRequest.exists({ user: req.user._id, status: 'PENDING' });
  if (pending) throw new ApiError('Ya tienes una solicitud Premium pendiente', 409);
  const request = await PremiumRequest.create({
    user: req.user._id,
    paymentReference: req.body.paymentReference,
    notes: req.body.notes
  });
  res.status(201).json(request);
});

export const listPremiumRequests = asyncHandler(async (_req, res) => {
  const requests = await PremiumRequest.find()
    .populate('user', 'nombre apellido email plan')
    .populate('reviewedBy', 'nombre apellido')
    .sort('-createdAt');
  res.json(requests);
});

export const decidePremiumRequest = asyncHandler(async (req, res) => {
  const request = await PremiumRequest.findById(req.params.id);
  if (!request) throw new ApiError('Solicitud Premium no encontrada', 404);
  if (request.status !== 'PENDING') throw new ApiError('La solicitud ya fue revisada', 409);
  request.status = req.body.status;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();
  if (request.status === 'APPROVED') await User.findByIdAndUpdate(request.user, { plan: 'PREMIUM' });
  res.json(request);
});
