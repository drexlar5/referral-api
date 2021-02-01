/* -------------------------------------------------------------------------- */
/*                              external imports                              */
/* -------------------------------------------------------------------------- */
const jwt = require('jsonwebtoken');

/* ---------------------------- internal imports ---------------------------- */
const jwtSecret = require('../config/config').secret;

module.exports = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const error = new Error('Not authenticated');
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, jwtSecret);
    } catch (error) {
      error.statusCode = 500;
      throw error;
    }

    if (!decodedToken) {
      const error = new Error('Not authenticated');
      error.statusCode = 401;
      throw error;
    }

    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    next(error)
  }
}