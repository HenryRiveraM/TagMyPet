import { Adoption, AdoptionApplication } from '../models/Adoption.js';
import { Pet } from '../models/Pet.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listAdoptions = asyncHandler(async (req, res) => {
  let adoptions = await Adoption.find({ estado: 'OPEN' }).populate('pet', 'nombre especie raza foto edad sexo').populate('owner', 'nombre ciudad');

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
  pet.estado = 'ADOPTION';
  await pet.save();
  const adoption = await Adoption.create({ ...req.body, owner: pet.propietario });
  res.status(201).json(adoption);
});

export const applyToAdoption = asyncHandler(async (req, res) => {
  const adoption = await Adoption.findById(req.params.id);
  if (!adoption || adoption.estado !== 'OPEN') throw new ApiError('Adopción no disponible', 404);
  const application = await AdoptionApplication.create({
    adoption: adoption._id,
    solicitante: req.user._id,
    cuestionario: req.body.cuestionario,
    firmaDigital: req.body.firmaDigital
  });
  res.status(201).json(application);
});

export const listApplications = asyncHandler(async (req, res) => {
  const applications = await AdoptionApplication.find()
    .populate({ path: 'adoption', populate: [{ path: 'pet', select: 'nombre foto' }, { path: 'owner', select: '_id nombre apellido' }] })
    .populate('solicitante', 'nombre apellido email telefono ciudad');
  res.json(req.user.rol === 'ADMIN' ? applications : applications.filter((a) => a.adoption?.owner?._id?.toString() === req.user._id.toString()));
});
