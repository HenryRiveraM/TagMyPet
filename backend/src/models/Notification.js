import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['CLINIC', 'ADOPTION', 'REMINDER', 'PREMIUM', 'NFC_SCAN', 'ACCOUNT', 'LOST'],
    required: true
  },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  link: { type: String, trim: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  readAt: { type: Date }
}, { timestamps: true });

notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
