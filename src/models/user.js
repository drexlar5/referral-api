/* -------------------------------------------------------------------------- */
/*                              external imports                              */
/* -------------------------------------------------------------------------- */
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  referral_code: {
    type: String,
    default: "none",
  },
  referral_count: {
    type: Number,
    default: 0,
  },
  credit: {
    type: Number,
    default: 0,
  },
  referred_users: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
});

module.exports = mongoose.model("User", userSchema);
