import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: { type: String, enum: ['VACUNA', 'MEDICACION', 'CONTROL'], required: true },
  titulo: { type: String, required: true },
  fecha: { type: Date, required: true },
  completado: { type: Boolean, default: false },
  notifyByEmail: { type: Boolean, default: true },
  notificationSentAt: { type: Date }
}, { timestamps: true });

export const Reminder = mongoose.model('Reminder', reminderSchema);
