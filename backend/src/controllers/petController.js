import crypto from 'crypto';
import cloudinary from '../config/cloudinary.js';
import { NfcTag } from '../models/NfcTag.js';
import { Pet } from '../models/Pet.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function uploadImage(buffer) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'demo') {
    throw new ApiError('Cloudinary no está configurado para subir imágenes', 503);
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'tagmypet/pets' }, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
    stream.end(buffer);
  });
}

const canManagePet = (user, pet) => user.rol === 'ADMIN' || pet.propietario.toString() === user._id.toString();

export const listPets = asyncHandler(async (req, res) => {
  const query = req.user.rol === 'ADMIN' ? {} : { propietario: req.user._id };
  const pets = await Pet.find(query).populate('propietario', 'nombre apellido email telefono ciudad');
  res.json(pets);
});

export const createPet = asyncHandler(async (req, res) => {
  if (req.user.rol === 'OWNER' && req.user.plan === 'FREE') {
    const count = await Pet.countDocuments({ propietario: req.user._id });
    if (count >= 2) throw new ApiError('El plan FREE permite hasta 2 mascotas', 402);
  }

  const data = { ...req.body, propietario: req.user._id, codigoNFC: req.body.codigoNFC || crypto.randomUUID() };
  if (req.file) data.foto = await uploadImage(req.file.buffer);

  const pet = await Pet.create(data);
  const tag = await NfcTag.findOne({ code: pet.codigoNFC.toUpperCase(), status: { $in: ['AVAILABLE', 'SOLD'] } });
  if (tag) {
    tag.status = 'ASSIGNED';
    tag.pet = pet._id;
    tag.owner = pet.propietario;
    tag.assignedAt = new Date();
    await tag.save();
  }
  res.status(201).json(pet);
});

export const getPet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id).populate('propietario', 'nombre apellido email telefono ciudad');
  if (!pet) throw new ApiError('Mascota no encontrada', 404);
  if (!canManagePet(req.user, pet) && !['VETERINARIO'].includes(req.user.rol)) throw new ApiError('Sin acceso', 403);
  res.json(pet);
});

export const updatePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) throw new ApiError('Mascota no encontrada', 404);
  if (!canManagePet(req.user, pet)) throw new ApiError('Sin acceso', 403);

  Object.assign(pet, req.body);
  if (req.file) pet.foto = await uploadImage(req.file.buffer);
  await pet.save();
  res.json(pet);
});

export const deletePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) throw new ApiError('Mascota no encontrada', 404);
  if (!canManagePet(req.user, pet)) throw new ApiError('Sin acceso', 403);
  await MedicalRecord.deleteMany({ pet: pet._id });
  await pet.deleteOne();
  res.status(204).send();
});

export const publicNfcProfile = asyncHandler(async (req, res) => {
  const pet = await Pet.findOne({ codigoNFC: req.params.nfcCode })
    .populate('propietario', 'nombre telefono ciudad');
  if (!pet || pet.estado === 'INACTIVE') throw new ApiError('Perfil no encontrado', 404);

  res.json({
    nombre: pet.nombre,
    especie: pet.especie,
    raza: pet.raza,
    color: pet.color,
    foto: pet.foto,
    alergias: pet.alergias,
    medicacion: pet.medicacion,
    enfermedades: pet.enfermedades,
    estado: pet.estado,
    contacto: {
      nombre: pet.propietario.nombre,
      telefono: pet.propietario.telefono,
      ciudad: pet.propietario.ciudad
    }
  });
});
