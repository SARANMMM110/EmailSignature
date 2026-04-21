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
  if (err.feature != null) body.feature = err.feature;
  if (err.required_plan != null) body.required_plan = err.required_plan;
  if (err.current_plan != null) body.current_plan = err.current_plan;
  if (err.limit != null) body.limit = err.limit;
  if (err.max != null) body.max = err.max;
  if (err.current != null) body.current = err.current;
  if (err.max_mb != null) body.max_mb = err.max_mb;
  if (err.plan != null) body.plan = err.plan;
  res.status(status).json(body);
}
