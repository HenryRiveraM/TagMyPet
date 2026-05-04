import { MedicalRecord } from '../models/MedicalRecord.js';
import { Pet } from '../models/Pet.js';
import { PetAccess } from '../models/PetAccess.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function assertPetAccess(user, petId, write = false) {
  const pet = await Pet.findById(petId);
  if (!pet) throw new ApiError('Mascota no encontrada', 404);
  const owner = pet.propietario.toString() === user._id.toString();
  if (owner || user.rol === 'ADMIN') return pet;
  if (user.rol === 'VETERINARIO') {
    const approved = await PetAccess.exists({ pet: pet._id, veterinarian: user._id, status: 'APPROVED' });
    if (approved) return pet;
  }
  throw new ApiError('Sin acceso médico autorizado', 403);
}

export const listMedicalRecords = asyncHandler(async (req, res) => {
  await assertPetAccess(req.user, req.params.petId);
  const records = await MedicalRecord.find({ pet: req.params.petId }).sort('-fecha').populate('registradoPor', 'nombre apellido rol');
  res.json(records);
});

export const createMedicalRecord = asyncHandler(async (req, res) => {
  await assertPetAccess(req.user, req.body.pet, true);
  const record = await MedicalRecord.create({ ...req.body, registradoPor: req.user._id });
  res.status(201).json(record);
});

export const deleteMedicalRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id);
  if (!record) throw new ApiError('Registro no encontrado', 404);
  await assertPetAccess(req.user, record.pet);
  await record.deleteOne();
  res.status(204).send();
});
