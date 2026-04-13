export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  console.error(err);
  const body = { message };
  if (err.error) body.error = err.error;
  res.status(status).json(body);
}
