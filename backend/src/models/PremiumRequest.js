import mongoose from 'mongoose';

const premiumRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['PREMIUM'], default: 'PREMIUM' },
  billingPeriod: { type: String, enum: ['YEARLY'], default: 'YEARLY' },
  durationMonths: { type: Number, default: 12 },
  price: { type: Number, default: 840 },
  currency: { type: String, default: 'BOB' },
  paymentReference: { type: String, required: true, trim: true },
  receipt: {
    publicId: { type: String, trim: true },
    format: { type: String, default: 'pdf' },
    originalName: { type: String, trim: true },
    bytes: { type: Number }
  },
  notes: { type: String, trim: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  activatedAt: { type: Date },
  expiresAt: { type: Date }
}, { timestamps: true });

export const PremiumRequest = mongoose.model('PremiumRequest', premiumRequestSchema);
