/* -------------------------------------------------------------------------- */
/*                              external imports                              */
/* -------------------------------------------------------------------------- */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { default: ShortUniqueId } = require("short-unique-id");

/* ---------------------------- internal imports ---------------------------- */
const User = require("../models/user");
const config = require("../config/config");
const logger = require("../lib/logger");

const uid = new ShortUniqueId({ length: 8 });

/**
 * Updates and credits the referrers account
 * @param code
 * @param newUser mongoose object
 */
const _updateAndCreditReferrer = async (code, newUser) => {
  
    const referrer = await User.findOne({ referral_code: code });

    if (!referrer) {
      let error = new Error("Referral code doesn't exist.");
      error.statusCode = 400;
      throw error;
    }

    const updatedReferralCount = referrer.referral_count + 1;
    const updatedReferredUsersArray = [
      ...referrer.referred_users,
      newUser._id,
    ];

    if (updatedReferralCount % 5 === 0) {
     await User.updateOne(
        {
          _id: referrer._id,
        },
        {
          referral_count: updatedReferralCount,
          credit: referrer.credit + 10,
          referred_users: updatedReferredUsersArray,
        }, {new: true}
      );
    } else {
      await User.updateOne(
        {
          _id: referrer._id,
        },
        {
          referral_count: updatedReferralCount,
          referred_users: updatedReferredUsersArray,
        },
        {new: true}
      );
    }
}

/**
 * Creates a user
 * @param email
 * @param password
 * @param code optional
 * @returns message - String
 */
exports.createUser = async (data, query) => {
  try {
    const { email, password } = data;
    const formattedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: formattedEmail });

    if (user) {
      let error = new Error("Email already exists.");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      email: formattedEmail,
      password: hashedPassword,
      credit: query?.code ? 10 : 0,
    });

    if (query?.code && Object.keys(query).length > 0) await _updateAndCreditReferrer(query?.code, newUser);

    const response = await newUser.save();

    if (!response) {
      let error = new Error("User not created.");
      error.statusCode = 501;
      throw error;
    }

    return `User created successfully with credit balance of ${
      query?.code ? "$10" : "$0"
    }.`;
  } catch (error) {
    logger.error("Service::createUser::error", error.message);
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
    const user = await User.findOne({ email: formattedEmail });

    if (!user) {
      let error = new Error("User does not exist.");
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error("Wrong password.");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      config.secret,
      {
        expiresIn: "3h",
      }
    );

    if (!token) {
      const error = new Error("Error occured, could not create token.");
      throw error;
    }

    return token;
  } catch (error) {
    logger.error("Service::authenticateUser::error", error.message);
    throw error;
  }
};

/**
 * Creates referral code
 * @param id
 * @returns referral url - String
 */
exports.getReferralCode = async (id) => {
  try {
    const user = await User.findOne({ _id: id });

    if (!user) {
      let error = new Error("User does not exist.");
      error.statusCode = 401;
      throw error;
    }

    if (user.referral_code !== "none") {
      let error = new Error("User has created a referal code already.");
      error.statusCode = 501;
      throw error;
    }

    const { prod_url, dev_url, node_env } = config;
    const data = { referral_code: uid() };

    const updatedData = await User.updateOne(
      {
        _id: mongoose.Types.ObjectId(id),
      },
      data,
      { new: true }
    );

    if (updatedData.nModified !== 1) {
      let error = new Error("Referral code not created.");
      error.statusCode = 500;
      throw error;
    }

    const params = `register?code=${data.referral_code}`;

    const referral_url =
      node_env === "prod" ? `${prod_url}/${params}` : `${dev_url}/${params}`;

    return referral_url;
  } catch (error) {
    logger.error("Service::getReferralCode::error", error.message);
    throw error;
  }
};
