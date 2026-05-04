import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: { type: String, enum: ['VACUNA', 'TRATAMIENTO', 'CIRUGIA', 'ALERGIA', 'CONTROL'], required: true },
  titulo: { type: String, required: true, trim: true },
  descripcion: { type: String, trim: true },
  fecha: { type: Date, required: true },
  proximaFecha: { type: Date },
  archivos: [{ type: String }]
}, { timestamps: true });

export const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
