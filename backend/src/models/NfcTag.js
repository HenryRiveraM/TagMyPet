import mongoose from 'mongoose';

const nfcTagSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  batch: { type: String, trim: true },
  status: {
    type: String,
    enum: ['AVAILABLE', 'ASSIGNED', 'SOLD', 'DEFECTIVE', 'DISABLED'],
    default: 'AVAILABLE'
  },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publicUrl: { type: String, trim: true },
  notes: { type: String, trim: true },
  manufacturedAt: { type: Date, default: Date.now },
  assignedAt: { type: Date }
}, { timestamps: true });

export const NfcTag = mongoose.model('NfcTag', nfcTagSchema);
