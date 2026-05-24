import { Adoption, AdoptionApplication } from '../models/Adoption.js';
import { Pet } from '../models/Pet.js';
import { NfcTag } from '../models/NfcTag.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notifyUser } from '../utils/notifications.js';

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
    vivienda: req.body.vivienda,
    firmaDigital: req.body.firmaDigital,
    consentimientoPerfilPublico: req.body.consentimientoPerfilPublico
  });
  await notifyUser(adoption.owner, 'ADOPTION', 'Nueva solicitud de adopción', 'Recibiste una postulación para una mascota publicada.', '/adopciones', { application: application._id });
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
  const stage = req.body.etapa;
  const currentStage = application.etapa || (application.estado === 'APPROVED' ? 'APPROVED' : application.estado === 'REJECTED' ? 'REJECTED' : 'RECEIVED');
  if (['DELIVERED', 'REJECTED'].includes(currentStage)) throw new ApiError('Esta solicitud ya no puede modificarse', 409);
  if (stage === 'IN_REVIEW' && !['RECEIVED', 'IN_REVIEW'].includes(currentStage)) throw new ApiError('Una solicitud aprobada no puede volver a revisión', 409);
  if (stage === 'APPROVED' && !['RECEIVED', 'IN_REVIEW'].includes(currentStage)) throw new ApiError('Esta solicitud ya fue decidida', 409);
  if (stage === 'DELIVERED' && currentStage !== 'APPROVED') throw new ApiError('Primero debes aprobar la adopción antes de registrar la entrega', 409);

  application.etapa = stage;
  if (!application.vivienda) application.vivienda = 'Información de vivienda pendiente de actualización.';
  if (req.body.entrevistaFecha) {
    application.entrevista = {
      fecha: req.body.entrevistaFecha,
      modalidad: req.body.entrevistaModalidad,
      notas: req.body.entrevistaNotas
    };
  }
  application.estado = stage === 'REJECTED' ? 'REJECTED' : stage === 'APPROVED' || stage === 'DELIVERED' ? 'APPROVED' : 'PENDING';
  application.revisadaPor = req.user._id;
  application.fechaDecision = new Date();

  if (stage === 'APPROVED') {
    application.adoption.estado = 'CLOSED';
    await application.adoption.save();
    await AdoptionApplication.updateMany(
      { adoption: application.adoption._id, _id: { $ne: application._id }, estado: 'PENDING' },
      { estado: 'REJECTED', etapa: 'REJECTED', revisadaPor: req.user._id, fechaDecision: new Date() }
    );
  }

  if (stage === 'DELIVERED') {
    const deliveredAt = new Date();
    application.seguimientos = [7, 30, 90].map((days) => ({
      dias: days,
      fechaProgramada: new Date(deliveredAt.getTime() + days * 24 * 60 * 60 * 1000),
      completado: false
    }));
    await Pet.findByIdAndUpdate(application.adoption.pet, {
      propietario: application.solicitante,
      estado: 'ACTIVE',
      consentimientoPerfilPublico: true,
      fechaConsentimiento: new Date()
    });
    await NfcTag.updateMany({ pet: application.adoption.pet }, { owner: application.solicitante });
  }

  await application.save();
  const messages = {
    IN_REVIEW: 'Tu solicitud está en revisión. Pronto recibirás novedades de la entrevista.',
    APPROVED: 'Tu solicitud fue aprobada. Coordina la entrega y firma del contrato.',
    DELIVERED: 'La adopción fue entregada. Tendrás seguimientos a 7, 30 y 90 días.',
    REJECTED: 'Tu solicitud de adopción no fue seleccionada.'
  };
  await notifyUser(application.solicitante, 'ADOPTION', 'Actualización de adopción', messages[stage], '/adopciones', { application: application._id });
  res.json(application);
});

export const completeFollowUp = asyncHandler(async (req, res) => {
  const application = await AdoptionApplication.findById(req.params.id).populate('adoption');
  if (!application || application.etapa !== 'DELIVERED') throw new ApiError('Seguimiento no disponible', 404);
  const isApplicant = application.solicitante.toString() === req.user._id.toString();
  const isOriginalOwner = application.adoption?.owner?.toString() === req.user._id.toString();
  if (req.user.rol !== 'ADMIN' && !isApplicant && !isOriginalOwner) throw new ApiError('Sin acceso', 403);
  const followUp = application.seguimientos.find((item) => item.dias === Number(req.params.days));
  if (!followUp) throw new ApiError('Seguimiento no encontrado', 404);
  followUp.completado = true;
  followUp.notas = req.body.notas;
  followUp.completadoAt = new Date();
  await application.save();
  res.json(application);
});

export const closeAdoption = asyncHandler(async (req, res) => {
  const adoption = await Adoption.findById(req.params.id);
  if (!adoption) throw new ApiError('Publicación no encontrada', 404);
  if (req.user.rol !== 'ADMIN' && adoption.owner.toString() !== req.user._id.toString()) throw new ApiError('Sin acceso', 403);
  if (adoption.estado !== 'OPEN') throw new ApiError('La publicación ya está cerrada', 409);
  adoption.estado = 'CLOSED';
  await adoption.save();
  await AdoptionApplication.updateMany({ adoption: adoption._id, estado: 'PENDING' }, { estado: 'REJECTED', etapa: 'REJECTED', revisadaPor: req.user._id, fechaDecision: new Date() });
  await Pet.findByIdAndUpdate(adoption.pet, { estado: 'ACTIVE' });
  res.json(adoption);
});
