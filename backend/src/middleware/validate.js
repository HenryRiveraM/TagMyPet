import { validationResult } from 'express-validator';
import { ApiError } from '../utils/apiError.js';

export function validate(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(errors.array().map((e) => e.msg).join(', '), 400);
  }
  next();
}
