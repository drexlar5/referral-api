/* ---------------------------- internal imports ---------------------------- */
const {
  createUser,
  authenticateUser,
  getReferralUrl,
  getUserById,
} = require("../services/user");
const {
  sendSuccessResponse,
  sendFailureResponse,
} = require("../utils/response");

exports.createUser = async (req, res, next) => {
  try {
    const { body, query } = req;

    const data = await createUser(body, query);

    sendSuccessResponse(res, "User created.", data);
  } catch (error) {
    sendFailureResponse(error, next);
  }
};

exports.authenticateUser = async (req, res, next) => {
  try {
    const { body } = req;

    const data = await authenticateUser(body);

    sendSuccessResponse(res, "User authenticated", data);
  } catch (error) {
    sendFailureResponse(error, next);
  }
};

exports.getReferralUrl = async (req, res, next) => {
  try {
    const data = await getReferralUrl(req.userId);

    sendSuccessResponse(res, "Referral code created.", data);
  } catch (error) {
    sendFailureResponse(error, next);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req;

    const data = await getUserById(userId);

    sendSuccessResponse(res, "User details found.", data);
  } catch (error) {
    sendFailureResponse(error, next);
  }
};
