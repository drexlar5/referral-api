/* -------------------------------------------------------------------------- */
/*                              external imports                              */
/* -------------------------------------------------------------------------- */
const express = require('express');

/* ---------------------------- internal imports ---------------------------- */
const userController = require('../controller/user');
const isAuth = require('../middleware/is-auth');
const validate = require('../middleware/validation');
const { authValidation } = require('../schema/user');

const router = express.Router();

router.get('/refer', isAuth, userController.getReferralCode);
router.post('/register', validate(authValidation), userController.createUser);
router.post('/login', validate(authValidation), userController.authenticateUser);

module.exports = router;