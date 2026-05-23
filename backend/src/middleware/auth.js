import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { expirePremiumIfNeeded } from '../utils/premium.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) throw new ApiError('No autenticado', 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');
  if (!user || user.estado !== 'ACTIVE') throw new ApiError('Usuario no autorizado', 401);
  await expirePremiumIfNeeded(user);

  req.user = user;
  next();
});

export const allowRoles = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.rol)) {
    throw new ApiError('Permisos insuficientes', 403);
  }
  next();
};
