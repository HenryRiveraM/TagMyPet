import crypto from 'crypto';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/email.js';
import { signToken } from '../utils/token.js';
import { frontendUrl } from '../utils/url.js';

const publicUser = (user) => ({
  id: user._id,
  nombre: user.nombre,
  apellido: user.apellido,
  email: user.email,
  telefono: user.telefono,
  ciudad: user.ciudad,
  rol: user.rol,
  estado: user.estado,
  plan: user.plan,
  emailVerified: user.emailVerified
});

async function sendVerification(user) {
  const token = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  const url = frontendUrl(`/verify-email?token=${token}`);
  await sendEmail({
    to: user.email,
    subject: 'Verifica tu cuenta TagMyPet',
    text: `Verifica tu cuenta: ${url}`,
    html: `<p>Hola ${user.nombre},</p><p>Verifica tu cuenta TagMyPet aquí:</p><p><a href="${url}">${url}</a></p>`
  });
}

export const register = asyncHandler(async (req, res) => {
  const exists = await User.exists({ email: req.body.email });
  if (exists) throw new ApiError('El email ya está registrado', 409);

  const user = await User.create(req.body);
  await sendVerification(user);
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new ApiError('Credenciales inválidas', 401);
  }
  if (user.estado !== 'ACTIVE') throw new ApiError('Usuario suspendido', 403);

  res.json({ token: signToken(user), user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+passwordResetToken +passwordResetExpires');
  if (user) {
    const token = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const url = frontendUrl(`/reset-password?token=${token}`);
    await sendEmail({
      to: user.email,
      subject: 'Restablece tu password TagMyPet',
      text: `Restablece tu password: ${url}`,
      html: `<p>Recibimos una solicitud para restablecer tu password.</p><p><a href="${url}">${url}</a></p><p>Este enlace expira en 1 hora.</p>`
    });
  }
  res.json({ message: 'Si el email existe, enviamos instrucciones para restablecer el password' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() }
  }).select('+password +passwordResetToken +passwordResetExpires');
  if (!user) throw new ApiError('Token inválido o expirado', 400);

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({ token: signToken(user), user: publicUser(user) });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: new Date() }
  }).select('+emailVerificationToken +emailVerificationExpires');
  if (!user) throw new ApiError('Token inválido o expirado', 400);

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });
  res.json({ message: 'Email verificado correctamente' });
});

export const resendVerification = asyncHandler(async (req, res) => {
  if (req.user.emailVerified) return res.json({ message: 'Tu email ya está verificado' });
  await sendVerification(req.user);
  res.json({ message: 'Email de verificación enviado' });
});
