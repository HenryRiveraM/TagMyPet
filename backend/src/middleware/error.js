export function notFound(req, _res, next) {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const payload = {
    message: status === 500 ? 'Error interno del servidor' : err.message
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}
