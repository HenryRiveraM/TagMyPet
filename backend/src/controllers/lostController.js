import { LostReport } from '../models/LostReport.js';
import { Pet } from '../models/Pet.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const publicLostReports = asyncHandler(async (req, res) => {
  const query = { estado: 'LOST' };
  if (req.query.ciudad) query.ciudad = new RegExp(req.query.ciudad, 'i');
  let reports = await LostReport.find(query).populate('pet', 'nombre especie raza color foto codigoNFC').sort('-createdAt');
  if (req.query.especie) {
    const especie = String(req.query.especie).toLowerCase();
    reports = reports.filter((report) => report.pet?.especie?.toLowerCase() === especie);
  }
  res.json(reports);
});

export const createLostReport = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.body.pet);
  if (!pet) throw new ApiError('Mascota no encontrada', 404);
  if (req.user.rol !== 'ADMIN' && pet.propietario.toString() !== req.user._id.toString()) throw new ApiError('Sin acceso', 403);
  pet.estado = 'LOST';
  await pet.save();
  const report = await LostReport.create({ ...req.body, owner: pet.propietario });
  res.status(201).json(report);
});

export const markFound = asyncHandler(async (req, res) => {
  const report = await LostReport.findById(req.params.id);
  if (!report) throw new ApiError('Reporte no encontrado', 404);
  if (req.user.rol !== 'ADMIN' && report.owner.toString() !== req.user._id.toString()) throw new ApiError('Sin acceso', 403);
  report.estado = 'FOUND';
  await report.save();
  await Pet.findByIdAndUpdate(report.pet, { estado: 'ACTIVE' });
  res.json(report);
});
