import cloudinary from '../config/cloudinary.js';
import { PremiumRequest } from '../models/PremiumRequest.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const PREMIUM_PRICE_YEARLY = 840;
const PREMIUM_MONTHS = 12;

function uploadPrivateReceipt(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: 'tagmypet/premium-receipts',
      resource_type: 'raw',
      type: 'private',
      format: 'pdf'
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(file.buffer);
  });
}

export const listMyPremiumRequests = asyncHandler(async (req, res) => {
  const requests = await PremiumRequest.find({ user: req.user._id }).select('-receipt.publicId -receipt.format').sort('-createdAt');
  res.json(requests);
});

export const createPremiumRequest = asyncHandler(async (req, res) => {
  if (req.user.plan === 'PREMIUM') throw new ApiError('Tu cuenta ya tiene Premium activo', 409);
  const pending = await PremiumRequest.exists({ user: req.user._id, status: 'PENDING' });
  if (pending) throw new ApiError('Ya tienes una solicitud Premium pendiente', 409);
  if (!req.file) throw new ApiError('Adjunta el comprobante de pago en PDF', 400);
  const uploadedReceipt = await uploadPrivateReceipt(req.file);
  const request = await PremiumRequest.create({
    user: req.user._id,
    price: PREMIUM_PRICE_YEARLY,
    durationMonths: PREMIUM_MONTHS,
    paymentReference: req.body.paymentReference,
    notes: req.body.notes,
    receipt: {
      publicId: uploadedReceipt.public_id,
      format: 'pdf',
      originalName: req.file.originalname,
      bytes: req.file.size
    }
  });
  const response = request.toObject();
  delete response.receipt.publicId;
  delete response.receipt.format;
  res.status(201).json(response);
});

export const listPremiumRequests = asyncHandler(async (_req, res) => {
  const requests = await PremiumRequest.find()
    .populate('user', 'nombre apellido email plan')
    .populate('reviewedBy', 'nombre apellido')
    .sort('-createdAt');
  res.json(requests);
});

export const getPremiumReceiptLink = asyncHandler(async (req, res) => {
  const request = await PremiumRequest.findById(req.params.id);
  if (!request?.receipt?.publicId) throw new ApiError('Esta solicitud no tiene comprobante PDF', 404);
  const url = cloudinary.utils.private_download_url(request.receipt.publicId, request.receipt.format || 'pdf', {
    resource_type: 'raw',
    type: 'private',
    expires_at: Math.floor(Date.now() / 1000) + 5 * 60,
    attachment: false
  });
  res.json({ url, expiresInSeconds: 300 });
});

export const decidePremiumRequest = asyncHandler(async (req, res) => {
  const request = await PremiumRequest.findById(req.params.id);
  if (!request) throw new ApiError('Solicitud Premium no encontrada', 404);
  if (request.status !== 'PENDING') throw new ApiError('La solicitud ya fue revisada', 409);
  if (req.body.status === 'APPROVED' && !request.receipt?.publicId) {
    throw new ApiError('No se puede activar Premium sin comprobante PDF', 400);
  }
  request.status = req.body.status;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  if (request.status === 'APPROVED') {
    request.activatedAt = new Date();
    request.expiresAt = new Date(request.activatedAt);
    request.expiresAt.setMonth(request.expiresAt.getMonth() + (request.durationMonths || PREMIUM_MONTHS));
  }
  await request.save();
  if (request.status === 'APPROVED') {
    await User.findByIdAndUpdate(request.user, {
      plan: 'PREMIUM',
      premiumStartedAt: request.activatedAt,
      premiumExpiresAt: request.expiresAt
    });
  }
  res.json(request);
});
