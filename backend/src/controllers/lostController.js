import { LostReport } from '../models/LostReport.js';
import { Pet } from '../models/Pet.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notifyUser } from '../utils/notifications.js';

export const publicLostReports = asyncHandler(async (req, res) => {
  const query = { estado: 'LOST' };
  if (req.query.ciudad) query.ciudad = new RegExp(req.query.ciudad, 'i');
  let reports = await LostReport.find(query)
    .select('-avistamientos')
    .populate('pet', 'nombre especie raza color foto fotos fotoPosicionX fotoPosicionY codigoNFC')
    .populate('owner', 'plan')
    .sort('-createdAt');

  if (req.query.especie) {
    const especie = String(req.query.especie).toLowerCase();
    reports = reports.filter((report) => report.pet?.especie?.toLowerCase() === especie);
  }

  if (req.query.raza) {
    const raza = String(req.query.raza).toLowerCase();
    reports = reports.filter((report) => report.pet?.raza?.toLowerCase().includes(raza));
  }

  if (req.query.texto) {
    const text = String(req.query.texto).toLowerCase();
    reports = reports.filter((report) => [
      report.pet?.nombre,
      report.pet?.especie,
      report.pet?.raza,
      report.ciudad,
      report.zona,
      report.descripcion,
      report.contactoPublico
    ].some((value) => String(value || '').toLowerCase().includes(text)));
  }

  const safeReports = reports
    .sort((a, b) => Number(b.owner?.plan === 'PREMIUM') - Number(a.owner?.plan === 'PREMIUM'))
    .map((report) => {
      const data = report.toObject();
      data.destacadoPremium = data.owner?.plan === 'PREMIUM';
      delete data.owner;
      return data;
    });
  res.json(safeReports);
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

export const createSighting = asyncHandler(async (req, res) => {
  const report = await LostReport.findById(req.params.id).populate('pet', 'nombre');
  if (!report || report.estado !== 'LOST') throw new ApiError('Reporte no disponible', 404);
  report.avistamientos.push({
    nombre: req.body.nombre,
    telefono: req.body.telefono,
    ubicacion: req.body.ubicacion,
    descripcion: req.body.descripcion
  });
  await report.save();
  await notifyUser(report.owner, 'LOST', `Posible avistamiento de ${report.pet.nombre}`, `Ubicación informada: ${req.body.ubicacion}.`, '/perdidos', { report: report._id });
  res.status(201).json({ message: 'Avistamiento enviado al dueño de la mascota' });
});

export const listSightings = asyncHandler(async (req, res) => {
  const report = await LostReport.findById(req.params.id).select('owner avistamientos');
  if (!report) throw new ApiError('Reporte no encontrado', 404);
  if (req.user.rol !== 'ADMIN' && report.owner.toString() !== req.user._id.toString()) throw new ApiError('Sin acceso', 403);
  res.json(report.avistamientos.sort((a, b) => b.fecha - a.fecha));
});
