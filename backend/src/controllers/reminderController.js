import { Reminder } from '../models/Reminder.js';
import { Pet } from '../models/Pet.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendDueReminderNotifications } from '../services/reminderNotifications.js';

export const listReminders = asyncHandler(async (req, res) => {
  const query = req.user.rol === 'ADMIN' ? {} : { owner: req.user._id };
  const reminders = await Reminder.find(query).populate('pet', 'nombre foto').sort('fecha');
  res.json(reminders);
});

export const createReminder = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.body.pet);
  if (!pet) throw new ApiError('Mascota no encontrada', 404);
  if (req.user.rol !== 'ADMIN' && pet.propietario.toString() !== req.user._id.toString()) throw new ApiError('Sin acceso', 403);
  const reminder = await Reminder.create({ ...req.body, owner: pet.propietario });
  res.status(201).json(reminder);
});

export const toggleReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findById(req.params.id);
  if (!reminder) throw new ApiError('Recordatorio no encontrado', 404);
  if (req.user.rol !== 'ADMIN' && reminder.owner.toString() !== req.user._id.toString()) throw new ApiError('Sin acceso', 403);
  reminder.completado = !reminder.completado;
  await reminder.save();
  res.json(reminder);
});

export const sendReminderNotifications = asyncHandler(async (req, res) => {
  const count = await sendDueReminderNotifications({ daysAhead: Number(req.query.daysAhead || 2) });
  res.json({ sent: count });
});
