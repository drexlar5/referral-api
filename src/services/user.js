/* -------------------------------------------------------------------------- */
/*                              external imports                              */
/* -------------------------------------------------------------------------- */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { default: ShortUniqueId } = require("short-unique-id");

/* ---------------------------- internal imports ---------------------------- */
const User = require("../models/user");
const logger = require("../lib/logger");
const { secret } = require("../config/config");
const { throwError } = require("../utils/error");

const uid = new ShortUniqueId({ length: 8 });

/**
 * Credits the referrers account
 * @param referrerId
 */
const _creditReferrer = async (referrerId) => {
  await User.updateOne(
    {
      _id: referrerId,
    },
    {
      $inc: {
        credit: 10,
      },
    }
  );
};

/**
 * Updates the referrers data
 * @param code
 * @param newUser mongoose object
 * @returns referral_count Number
 */
const _updateReferrerReferralData = async (code, newUser) => {
  const referrer = await User.findOne({ referral_code: code }).lean();

  if (!referrer) throwError("Referral code doesn't exist.", 400);

  const { referral_count, referred_users } = referrer;

  const updatedReferralCount = referral_count + 1;
  const updatedReferredUsersArray = [...referred_users, newUser._id];

  let updatedReferrer = await User.findOneAndUpdate(
    {
      _id: referrer._id,
    },
    {
      referral_count: updatedReferralCount,
      referred_users: updatedReferredUsersArray,
    },
    { new: true }
  );
  return [updatedReferrer.referral_count, referrer._id];
};

/**
 * Handles the referral logic
 * @param code
 * @param newUser mongoose object
 */
const _linkUserToReferrer = async (code, newUser) => {
  const [updatedReferralCount, referrerId] = await _updateReferrerReferralData(
    code,
    newUser
  );

  if (updatedReferralCount % 5 === 0) await _creditReferrer(referrerId);
};

/**
 * Signs JWT token
 * @param userId
 * @returns jwt token - String
 */
const _signJwtToken = (userId) =>
  jwt.sign(
    {
      userId,
    },
    secret,
    {
      expiresIn: "1h",
    }
  );

/**
 * Creates a user
 * @param email
 * @param password
 * @param code optional
 * @returns savedUser - Object
 */
exports.createUser = async (data, queryParams) => {
  try {
    const { email, password } = data;
    const formattedEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      email: formattedEmail,
      password: hashedPassword,
      // credit user that signs up with referral link
      credit: queryParams?.code ? 10 : 0,
    });

    if (queryParams?.code)
      await _linkUserToReferrer(queryParams?.code, newUser);

    const savedUser = await newUser.save();

    if (!savedUser) throwError("User not created.", 501);

    return savedUser;
  } catch (error) {
    logger.error("Service::createUser::error", error);
    if (error.name === "MongoError" && error?.code === 11000) {
      throwError("User already exists.", 401);
    }
    throw error;
  }
};

/**
 * Authenticates a user
 * @param email
 * @param password
 * @returns token - String
 */
exports.authenticateUser = async ({ email, password }) => {
  try {
    const formattedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: formattedEmail }).lean();
    if (!user) throwError("User does not exist.", 401);

    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) throwError("Wrong password.", 401);

    const token = _signJwtToken(user._id);
    if (!token) throwError("Error occured, could not create token.", 500);

    return token;
  } catch (error) {
    logger.error("Service::authenticateUser::error", error.message);
    throw error;
  }
};

/**
 * Generates referral url
 * @param userId
 * @returns referral url - String
 */
exports.getReferralUrl = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId }).lean();

    if (!user) throwError("User does not exist.", 401);

    if (user.referral_code)
      throwError("User has created a referal code already.", 501);

    const { referral_base_url } = config;
    const referralId = uid();

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
      },
      { referral_code: referralId },
      { new: true }
    );

    if (updatedUser.referral_code !== referralId)
      throwError("Referral code not created.", 500);

    const referral_url_params = `register?code=${referralId}`;

    const referral_url = `${referral_base_url}/${referral_url_params}`;

    return referral_url;
  } catch (error) {
    logger.error("Service::getReferralUrl::error", error.message);
    throw error;
  }
};

/**
 * Get a user by Id
 * @param userId
 * @returns user details - String
 */
exports.getUserById = async (userId) => {
  try {
    const userDetails = await User.findOne({ _id: userId })
      .lean()
      .select("-_id -password -__v");

    if (!userDetails) throwError("User does not exist.", 401);

    return userDetails;
  } catch (error) {
    logger.error("Service::getUserById::error", error.message);
    throw error;
  }
};
