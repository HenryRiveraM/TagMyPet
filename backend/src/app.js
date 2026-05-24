import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { adminRoutes } from './routes/adminRoutes.js';
import { adoptionRoutes } from './routes/adoptionRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { clinicRoutes } from './routes/clinicRoutes.js';
import { lostRoutes } from './routes/lostRoutes.js';
import { medicalRoutes } from './routes/medicalRoutes.js';
import { petRoutes } from './routes/petRoutes.js';
import { reminderRoutes } from './routes/reminderRoutes.js';
import { tagRoutes } from './routes/tagRoutes.js';
import { premiumRoutes } from './routes/premiumRoutes.js';
import { notificationRoutes } from './routes/notificationRoutes.js';
import { errorHandler, notFound } from './middleware/error.js';
import { emailConfigured } from './utils/email.js';

dotenv.config();

export const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL?.split(',') || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 150, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  service: 'TagMyPet API',
  cloudinaryConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'demo'),
  emailConfigured: emailConfigured()
}));
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/medical-records', medicalRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/lost', lostRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);
