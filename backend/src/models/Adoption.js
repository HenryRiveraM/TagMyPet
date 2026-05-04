import mongoose from 'mongoose';

const adoptionSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  descripcion: { type: String, required: true, trim: true },
  requisitos: [{ type: String, trim: true }],
  ciudad: { type: String, required: true, trim: true },
  estado: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' }
}, { timestamps: true });

const adoptionApplicationSchema = new mongoose.Schema({
  adoption: { type: mongoose.Schema.Types.ObjectId, ref: 'Adoption', required: true },
  adoptante: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cuestionario: {
    espacio: { type: String, required: true },
    experiencia: { type: String, required: true },
    recursos: { type: String, required: true },
    compromiso: { type: String, required: true }
  },
  firmaDigital: { type: String, required: true },
  estado: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

export const Adoption = mongoose.model('Adoption', adoptionSchema);
export const AdoptionApplication = mongoose.model('AdoptionApplication', adoptionApplicationSchema);
