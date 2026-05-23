import mongoose from 'mongoose';

const premiumRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['PREMIUM'], default: 'PREMIUM' },
  price: { type: Number, default: 70 },
  currency: { type: String, default: 'BOB' },
  paymentReference: { type: String, required: true, trim: true },
  notes: { type: String, trim: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, { timestamps: true });

export const PremiumRequest = mongoose.model('PremiumRequest', premiumRequestSchema);
