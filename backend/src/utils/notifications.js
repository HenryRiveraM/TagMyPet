import { Notification } from '../models/Notification.js';

export function notifyUser(user, type, title, message, link, metadata) {
  if (!user) return Promise.resolve();
  return Notification.create({ user, type, title, message, link, metadata });
}
