import mongoose from 'mongoose';

const lostReportSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ciudad: { type: String, required: true, trim: true },
  zona: { type: String, trim: true },
  descripcion: { type: String, trim: true },
  contactoPublico: { type: String, required: true, trim: true },
  estado: { type: String, enum: ['LOST', 'FOUND'], default: 'LOST' },
  fechaReporte: { type: Date, default: Date.now }
}, { timestamps: true });

export const LostReport = mongoose.model('LostReport', lostReportSchema);
