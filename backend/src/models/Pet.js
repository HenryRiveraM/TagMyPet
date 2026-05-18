import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  especie: { type: String, required: true, trim: true },
  raza: { type: String, trim: true },
  edad: { type: Number, min: 0, default: 0 },
  sexo: { type: String, enum: ['MACHO', 'HEMBRA', 'DESCONOCIDO'], default: 'DESCONOCIDO' },
  color: { type: String, trim: true },
  foto: { type: String },
  fotos: [{ type: String }],
  enfermedades: [{ type: String, trim: true }],
  alergias: [{ type: String, trim: true }],
  medicacion: [{ type: String, trim: true }],
  esterilizado: { type: Boolean, default: false },
  codigoNFC: { type: String, unique: true, index: true, required: true },
  propietario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  estado: { type: String, enum: ['ACTIVE', 'LOST', 'ADOPTION', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

export const Pet = mongoose.model('Pet', petSchema);
