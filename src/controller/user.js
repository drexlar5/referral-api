/* ---------------------------- internal imports ---------------------------- */
const authService = require('../services/user');

exports.createUser = async (req, res, next) => {
  try {
    const { body, query } = req;

    const data = await authService.createUser(body, query);

    res.json({
      error: false,
      message: 'User created.',
      data
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
}

exports.authenticateUser = async (req, res, next) => {
  try {
    const { body } = req;

    const data = await authService.authenticateUser(body);
    
    res.json({
      error: false,
      message: 'User authenticated',
      data
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
}

exports.getReferralCode = async (req, res, next) => {
  try {

    const data = await authService.getReferralCode(req.userId);
    
    res.json({
      error: false,
      message: 'Referral code created.',
      data
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
}