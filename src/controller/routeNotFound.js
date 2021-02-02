const routeNotFound = (_req, res, _next) =>
  res.status(404).json({ error: true, message: "Route not found." });


module.exports = routeNotFound;