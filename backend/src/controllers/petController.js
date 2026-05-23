import crypto from 'crypto';
import cloudinary from '../config/cloudinary.js';
import { NfcTag } from '../models/NfcTag.js';
import { Pet } from '../models/Pet.js';
import { PetAccess } from '../models/PetAccess.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { Reminder } from '../models/Reminder.js';
import { LostReport } from '../models/LostReport.js';
import { Adoption, AdoptionApplication } from '../models/Adoption.js';
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

async function uploadImages(files = []) {
  const selected = files.slice(0, 5);
  return Promise.all(selected.map((file) => uploadImage(file.buffer)));
}

function selectedUploadedPhoto(photos, requestedIndex) {
  const index = Number(requestedIndex);
  return Number.isInteger(index) && index >= 0 && index < photos.length ? photos[index] : photos[0];
}

const canManagePet = (user, pet) => user.rol === 'ADMIN' || pet.propietario.toString() === user._id.toString();

export const listPets = asyncHandler(async (req, res) => {
  let query = req.user.rol === 'ADMIN' ? {} : { propietario: req.user._id };
  if (req.user.rol === 'VETERINARIO') {
    const accesses = await PetAccess.find({ veterinarian: req.user._id, status: 'APPROVED' }).select('pet');
    query = { _id: { $in: accesses.map((access) => access.pet) } };
  }
  const pets = await Pet.find(query).populate('propietario', 'nombre apellido email telefono ciudad');
  res.json(pets);
});

export const createPet = asyncHandler(async (req, res) => {
  if (req.user.rol === 'OWNER' && req.user.plan === 'FREE') {
    const count = await Pet.countDocuments({ propietario: req.user._id });
    if (count >= 2) throw new ApiError('El plan FREE permite hasta 2 mascotas', 402);
  }
  if (String(req.body.consentimientoPerfilPublico) !== 'true') {
    throw new ApiError('Debes autorizar la publicación de foto y contacto en el perfil NFC', 400);
  }

  const data = { ...req.body, propietario: req.user._id };
  delete data.codigoNFC;
  delete data.fotoPrincipal;
  delete data.foto;
  delete data.fotos;
  data.codigoNFC = crypto.randomUUID();
  data.consentimientoPerfilPublico = true;
  data.fechaConsentimiento = new Date();
  const photos = await uploadImages(req.files || []);
  if (photos.length) {
    data.fotos = photos;
    data.foto = selectedUploadedPhoto(photos, data.fotoPrincipalIndice);
  }
  delete data.fotoPrincipalIndice;

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
  if (!canManagePet(req.user, pet)) {
    const approvedAccess = req.user.rol === 'VETERINARIO' &&
      await PetAccess.exists({ pet: pet._id, veterinarian: req.user._id, status: 'APPROVED' });
    if (!approvedAccess) throw new ApiError('Sin acceso autorizado a esta mascota', 403);
  }
  res.json(pet);
});

export const updatePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) throw new ApiError('Mascota no encontrada', 404);
  if (!canManagePet(req.user, pet)) throw new ApiError('Sin acceso', 403);

  const data = { ...req.body };
  delete data.codigoNFC;
  const selectedExistingPhoto = data.fotoPrincipal;
  const selectedNewPhotoIndex = data.fotoPrincipalIndice;
  delete data.fotoPrincipal;
  delete data.fotoPrincipalIndice;
  delete data.foto;
  delete data.fotos;
  if (!pet.consentimientoPerfilPublico && String(data.consentimientoPerfilPublico) === 'true') {
    pet.consentimientoPerfilPublico = true;
    pet.fechaConsentimiento = new Date();
  }
  delete data.consentimientoPerfilPublico;
  delete data.fechaConsentimiento;
  Object.assign(pet, data);
  const photos = await uploadImages(req.files || []);
  if (photos.length) {
    pet.fotos = photos;
    pet.foto = selectedUploadedPhoto(photos, selectedNewPhotoIndex);
  } else if (selectedExistingPhoto && ((pet.fotos || []).includes(selectedExistingPhoto) || pet.foto === selectedExistingPhoto)) {
    pet.foto = selectedExistingPhoto;
  }
  await pet.save();
  res.json(pet);
});

export const deletePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) throw new ApiError('Mascota no encontrada', 404);
  if (!canManagePet(req.user, pet)) throw new ApiError('Sin acceso', 403);
  await MedicalRecord.deleteMany({ pet: pet._id });
  await Reminder.deleteMany({ pet: pet._id });
  await LostReport.deleteMany({ pet: pet._id });
  const adoptions = await Adoption.find({ pet: pet._id }).select('_id');
  await AdoptionApplication.deleteMany({ adoption: { $in: adoptions.map((adoption) => adoption._id) } });
  await Adoption.deleteMany({ pet: pet._id });
  await PetAccess.deleteMany({ pet: pet._id });
  await NfcTag.updateMany({ pet: pet._id }, { $unset: { pet: 1, owner: 1 }, status: 'DISABLED' });
  await pet.deleteOne();
  res.status(204).send();
});

export const publicNfcProfile = asyncHandler(async (req, res) => {
  const pet = await Pet.findOne({ codigoNFC: req.params.nfcCode })
    .populate('propietario', 'nombre telefono ciudad');
  if (!pet || pet.estado === 'INACTIVE' || !pet.consentimientoPerfilPublico) {
    throw new ApiError('Perfil no encontrado', 404);
  }

  res.json({
    nombre: pet.nombre,
    especie: pet.especie,
    raza: pet.raza,
    color: pet.color,
    foto: pet.foto,
    fotos: pet.fotos,
    fotoPosicionX: pet.fotoPosicionX,
    fotoPosicionY: pet.fotoPosicionY,
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
