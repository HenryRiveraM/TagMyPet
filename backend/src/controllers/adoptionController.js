import { Adoption, AdoptionApplication } from '../models/Adoption.js';
import { Pet } from '../models/Pet.js';
import { NfcTag } from '../models/NfcTag.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listAdoptions = asyncHandler(async (req, res) => {
  let adoptions = await Adoption.find({ estado: 'OPEN' }).populate('pet', 'nombre especie raza foto fotos fotoPosicionX fotoPosicionY edad sexo').populate('owner', 'nombre ciudad');

  if (req.query.especie) {
    const especie = String(req.query.especie).toLowerCase();
    adoptions = adoptions.filter((adoption) => adoption.pet?.especie?.toLowerCase() === especie);
  }

  if (req.query.raza) {
    const raza = String(req.query.raza).toLowerCase();
    adoptions = adoptions.filter((adoption) => adoption.pet?.raza?.toLowerCase().includes(raza));
  }

  if (req.query.edad) {
    const maxAge = Number(req.query.edad);
    if (!Number.isNaN(maxAge)) {
      adoptions = adoptions.filter((adoption) => Number(adoption.pet?.edad ?? 0) <= maxAge);
    }
  }

  res.json(adoptions);
});

export const createAdoption = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.body.pet);
  if (!pet) throw new ApiError('Mascota no encontrada', 404);
  if (req.user.rol !== 'ADMIN' && pet.propietario.toString() !== req.user._id.toString()) throw new ApiError('Sin acceso', 403);
  const existing = await Adoption.exists({ pet: pet._id, estado: 'OPEN' });
  if (existing) throw new ApiError('La mascota ya tiene una publicación de adopción abierta', 409);
  pet.estado = 'ADOPTION';
  await pet.save();
  const adoption = await Adoption.create({ ...req.body, owner: pet.propietario });
  res.status(201).json(adoption);
});

export const applyToAdoption = asyncHandler(async (req, res) => {
  const adoption = await Adoption.findById(req.params.id);
  if (!adoption || adoption.estado !== 'OPEN') throw new ApiError('Adopción no disponible', 404);
  if (adoption.owner.toString() === req.user._id.toString()) throw new ApiError('No puedes solicitar la adopción de tu propia mascota', 409);
  const existing = await AdoptionApplication.exists({ adoption: adoption._id, solicitante: req.user._id, estado: 'PENDING' });
  if (existing) throw new ApiError('Ya tienes una solicitud pendiente para esta adopción', 409);
  const application = await AdoptionApplication.create({
    adoption: adoption._id,
    solicitante: req.user._id,
    cuestionario: req.body.cuestionario,
    firmaDigital: req.body.firmaDigital,
    consentimientoPerfilPublico: req.body.consentimientoPerfilPublico
  });
  res.status(201).json(application);
});

export const listApplications = asyncHandler(async (req, res) => {
  const applications = await AdoptionApplication.find()
    .populate({ path: 'adoption', populate: [{ path: 'pet', select: 'nombre foto fotoPosicionX fotoPosicionY' }, { path: 'owner', select: '_id nombre apellido' }] })
    .populate('solicitante', 'nombre apellido email telefono ciudad');
  res.json(req.user.rol === 'ADMIN' ? applications : applications.filter((a) =>
    a.adoption?.owner?._id?.toString() === req.user._id.toString() ||
    a.solicitante?._id?.toString() === req.user._id.toString()
  ));
});

export const decideApplication = asyncHandler(async (req, res) => {
  const application = await AdoptionApplication.findById(req.params.id).populate('adoption');
  if (!application || !application.adoption) throw new ApiError('Solicitud no encontrada', 404);
  const canDecide = req.user.rol === 'ADMIN' || application.adoption.owner.toString() === req.user._id.toString();
  if (!canDecide) throw new ApiError('Sin acceso', 403);
  if (application.adoption.estado !== 'OPEN' || application.estado !== 'PENDING') throw new ApiError('Esta solicitud ya no puede modificarse', 409);

  application.estado = req.body.estado;
  application.revisadaPor = req.user._id;
  application.fechaDecision = new Date();
  await application.save();

  if (req.body.estado === 'APPROVED') {
    application.adoption.estado = 'CLOSED';
    await application.adoption.save();
    await AdoptionApplication.updateMany(
      { adoption: application.adoption._id, _id: { $ne: application._id }, estado: 'PENDING' },
      { estado: 'REJECTED', revisadaPor: req.user._id, fechaDecision: new Date() }
    );
    await Pet.findByIdAndUpdate(application.adoption.pet, {
      propietario: application.solicitante,
      estado: 'ACTIVE',
      consentimientoPerfilPublico: true,
      fechaConsentimiento: new Date()
    });
    await NfcTag.updateMany({ pet: application.adoption.pet }, { owner: application.solicitante });
  }

  res.json(application);
});

export const closeAdoption = asyncHandler(async (req, res) => {
  const adoption = await Adoption.findById(req.params.id);
  if (!adoption) throw new ApiError('Publicación no encontrada', 404);
  if (req.user.rol !== 'ADMIN' && adoption.owner.toString() !== req.user._id.toString()) throw new ApiError('Sin acceso', 403);
  if (adoption.estado !== 'OPEN') throw new ApiError('La publicación ya está cerrada', 409);
  adoption.estado = 'CLOSED';
  await adoption.save();
  await AdoptionApplication.updateMany({ adoption: adoption._id, estado: 'PENDING' }, { estado: 'REJECTED', revisadaPor: req.user._id, fechaDecision: new Date() });
  await Pet.findByIdAndUpdate(adoption.pet, { estado: 'ACTIVE' });
  res.json(adoption);
});
