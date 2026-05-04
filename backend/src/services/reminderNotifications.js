import { Reminder } from '../models/Reminder.js';
import { sendEmail } from '../utils/email.js';

export async function sendDueReminderNotifications({ daysAhead = 2 } = {}) {
  const now = new Date();
  const until = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  const reminders = await Reminder.find({
    completado: false,
    notifyByEmail: true,
    notificationSentAt: { $exists: false },
    fecha: { $gte: now, $lte: until }
  }).populate('owner', 'nombre email').populate('pet', 'nombre');

  for (const reminder of reminders) {
    await sendEmail({
      to: reminder.owner.email,
      subject: `Recordatorio TagMyPet: ${reminder.titulo}`,
      text: `${reminder.owner.nombre}, recuerda ${reminder.titulo} para ${reminder.pet.nombre} el ${reminder.fecha.toLocaleDateString()}.`,
      html: `<p>Hola ${reminder.owner.nombre},</p><p>Recuerda <strong>${reminder.titulo}</strong> para <strong>${reminder.pet.nombre}</strong>.</p><p>Fecha: ${reminder.fecha.toLocaleDateString()}</p>`
    });
    reminder.notificationSentAt = new Date();
    await reminder.save();
  }

  return reminders.length;
}

export function startReminderNotificationJob() {
  const run = () => {
    sendDueReminderNotifications().then((count) => {
      if (count) console.log(`Reminder notifications sent: ${count}`);
    }).catch((error) => console.error('Reminder notification job failed', error));
  };
  run();
  return setInterval(run, 24 * 60 * 60 * 1000);
}
