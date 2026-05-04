import { Clinic } from '../models/Clinic.js';
import { Pet } from '../models/Pet.js';
import { PetAccess } from '../models/PetAccess.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listClinics = asyncHandler(async (req, res) => {
  const query = req.user.rol === 'ADMIN'
    ? {}
    : { $or: [{ administradores: req.user._id }, { veterinarios: req.user._id }, { estado: 'ACTIVE' }] };
  const clinics = await Clinic.find(query).populate('veterinarios', 'nombre apellido email rol').sort('nombre');
  res.json(clinics);
});

export const createClinic = asyncHandler(async (req, res) => {
  const clinic = await Clinic.create({
    ...req.body,
    estado: req.user.rol === 'ADMIN' ? 'ACTIVE' : 'PENDING',
    administradores: [req.user._id],
    veterinarios: req.user.rol === 'VETERINARIO' ? [req.user._id] : []
  });
  res.status(201).json(clinic);
});

export const updateClinicStatus = asyncHandler(async (req, res) => {
  const clinic = await Clinic.findByIdAndUpdate(req.params.id, { estado: req.body.estado }, { new: true });
  if (!clinic) throw new ApiError('Clínica no encontrada', 404);
  res.json(clinic);
});

export const addVeterinarian = asyncHandler(async (req, res) => {
  const clinic = await Clinic.findById(req.params.id);
  if (!clinic) throw new ApiError('Clínica no encontrada', 404);
  const canManage = req.user.rol === 'ADMIN' || clinic.administradores.some((id) => id.toString() === req.user._id.toString());
  if (!canManage) throw new ApiError('Sin acceso a esta clínica', 403);

  const vet = await User.findOne({ email: req.body.email, rol: 'VETERINARIO' });
  if (!vet) throw new ApiError('Veterinario no encontrado', 404);
  if (!clinic.veterinarios.some((id) => id.toString() === vet._id.toString())) {
    clinic.veterinarios.push(vet._id);
    await clinic.save();
  }
  res.json(await clinic.populate('veterinarios', 'nombre apellido email rol'));
});

export const requestPetAccess = asyncHandler(async (req, res) => {
  if (req.user.rol !== 'VETERINARIO') throw new ApiError('Solo veterinarios pueden solicitar acceso', 403);
  const pet = req.body.pet
    ? await Pet.findById(req.body.pet)
    : await Pet.findOne({ codigoNFC: String(req.body.nfcCode || '').toUpperCase() });
  if (!pet) throw new ApiError('Mascota no encontrada', 404);

  const access = await PetAccess.findOneAndUpdate(
    { pet: pet._id, veterinarian: req.user._id },
    {
      pet: pet._id,
      owner: pet.propietario,
      veterinarian: req.user._id,
      clinic: req.body.clinic || undefined,
      status: 'PENDING',
      requestedBy: req.user._id
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(access);
});

export const listPetAccessRequests = asyncHandler(async (req, res) => {
  const query = req.user.rol === 'ADMIN'
    ? {}
    : req.user.rol === 'OWNER'
      ? { owner: req.user._id }
      : { veterinarian: req.user._id };
  const requests = await PetAccess.find(query)
    .populate('pet', 'nombre foto codigoNFC')
    .populate('owner', 'nombre apellido email')
    .populate('veterinarian', 'nombre apellido email')
    .populate('clinic', 'nombre ciudad')
    .sort('-createdAt');
  res.json(requests);
});

export const decidePetAccess = asyncHandler(async (req, res) => {
  const access = await PetAccess.findById(req.params.id);
  if (!access) throw new ApiError('Solicitud no encontrada', 404);
  const canDecide = req.user.rol === 'ADMIN' || access.owner.toString() === req.user._id.toString();
  if (!canDecide) throw new ApiError('Sin acceso', 403);

  access.status = req.body.status;
  access.approvedAt = req.body.status === 'APPROVED' ? new Date() : undefined;
  await access.save();
  res.json(access);
});
