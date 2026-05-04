import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  nit: { type: String, trim: true },
  telefono: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  ciudad: { type: String, required: true, trim: true },
  direccion: { type: String, required: true, trim: true },
  estado: { type: String, enum: ['PENDING', 'ACTIVE', 'SUSPENDED'], default: 'PENDING' },
  administradores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  veterinarios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export const Clinic = mongoose.model('Clinic', clinicSchema);
