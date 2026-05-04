import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}
