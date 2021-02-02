/* -------------------------------------------------------------------------- */
/*                              external imports                              */
/* -------------------------------------------------------------------------- */
const express = require("express");

/* ---------------------------- internal imports ---------------------------- */
const {
  createUser,
  authenticateUser,
  getReferralUrl,
  getUserById,
} = require("../controller/user");
const isAuth = require("../middleware/is-auth");
const validate = require("../middleware/validation");
const { authValidation } = require("../schema/user");

const router = express.Router();

router.get("/refer", isAuth, getReferralUrl);
router.get("/user", isAuth, getUserById);
router.post("/register", validate(authValidation), createUser);
router.post("/login", validate(authValidation), authenticateUser);

module.exports = router;
