import crypto from 'crypto';
import { NfcTag } from '../models/NfcTag.js';
import { Pet } from '../models/Pet.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { publicPetUrl } from '../utils/url.js';

const makeCode = () => `TMP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

export const listTags = asyncHandler(async (req, res) => {
  const query = req.user.rol === 'ADMIN' ? {} : { $or: [{ owner: req.user._id }, { status: { $in: ['AVAILABLE', 'SOLD'] } }] };
  const tags = await NfcTag.find(query).populate('pet', 'nombre foto codigoNFC').populate('owner', 'nombre apellido email').sort('-createdAt');
  res.json(tags);
});

export const createTag = asyncHandler(async (req, res) => {
  const code = String(req.body.code || makeCode()).toUpperCase().trim();
  const publicUrl = publicPetUrl(code);
  const tag = await NfcTag.create({
    code,
    batch: req.body.batch,
    status: req.body.status || 'AVAILABLE',
    notes: req.body.notes,
    publicUrl
  });
  res.status(201).json(tag);
});

export const createTagBatch = asyncHandler(async (req, res) => {
  const quantity = Math.min(Number(req.body.quantity || 1), 200);
  const batch = req.body.batch || `BATCH-${new Date().toISOString().slice(0, 10)}`;
  const tags = await NfcTag.insertMany(Array.from({ length: quantity }, () => {
    const code = makeCode();
    return {
      code,
      batch,
      publicUrl: publicPetUrl(code)
    };
  }));
  res.status(201).json(tags);
});

export const assignTag = asyncHandler(async (req, res) => {
  const tag = await NfcTag.findOne({ code: req.params.code.toUpperCase() });
  if (!tag) throw new ApiError('Tag NFC no encontrado', 404);
  if (!['AVAILABLE', 'SOLD'].includes(tag.status)) throw new ApiError('Tag no disponible para asignación', 400);

  const pet = await Pet.findById(req.body.pet);
  if (!pet) throw new ApiError('Mascota no encontrada', 404);
  if (req.user.rol !== 'ADMIN' && pet.propietario.toString() !== req.user._id.toString()) throw new ApiError('Sin acceso', 403);

  pet.codigoNFC = tag.code;
  await pet.save();
  tag.status = 'ASSIGNED';
  tag.pet = pet._id;
  tag.owner = pet.propietario;
  tag.assignedAt = new Date();
  tag.publicUrl = publicPetUrl(tag.code);
  await tag.save();
  res.json(tag);
});

export const updateTagStatus = asyncHandler(async (req, res) => {
  const tag = await NfcTag.findByIdAndUpdate(req.params.id, { status: req.body.status, notes: req.body.notes }, { new: true });
  if (!tag) throw new ApiError('Tag no encontrado', 404);
  res.json(tag);
});

export const exportTagsCsv = asyncHandler(async (req, res) => {
  const query = req.query.batch ? { batch: req.query.batch } : {};
  const tags = await NfcTag.find(query).populate('pet', 'nombre').sort('batch code');
  const rows = [
    ['code', 'batch', 'status', 'publicUrl', 'pet', 'notes'],
    ...tags.map((tag) => [
      tag.code,
      tag.batch || '',
      tag.status,
      publicPetUrl(tag.code),
      tag.pet?.nombre || '',
      tag.notes || ''
    ])
  ];
  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="tagmypet-nfc-tags.csv"');
  res.send(csv);
});
