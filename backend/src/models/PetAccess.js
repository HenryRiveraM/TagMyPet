import mongoose from 'mongoose';

const petAccessSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  veterinarian: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'REVOKED'], default: 'PENDING' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedAt: { type: Date }
}, { timestamps: true });

petAccessSchema.index({ pet: 1, veterinarian: 1 }, { unique: true });

export const PetAccess = mongoose.model('PetAccess', petAccessSchema);
