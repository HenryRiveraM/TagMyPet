export function notFound(req, _res, next) {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(err, _req, res, _next) {
  const uploadLimitError = String(err.code || '').startsWith('LIMIT_');
  const status = uploadLimitError ? 400 : err.statusCode || 500;
  const payload = {
    message: status === 500
      ? 'Error interno del servidor'
      : err.code === 'LIMIT_FILE_SIZE'
        ? 'El archivo supera el límite permitido de 5 MB'
        : err.message
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}
