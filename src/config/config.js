require("dotenv").config();

const {
  USERNAME,
  PASSWORD,
  DB,
  TEST_DB,
  REFERRAL_BASE_URL,
  PORT,
} = process.env;

module.exports = config = {
  mongoConnection: `mongodb+srv://${USERNAME}:${PASSWORD}@cluster0-g3vvd.mongodb.net/${DB}?retryWrites=true&w=majority`,
  mongoTestConnection: `mongodb+srv://${USERNAME}:${PASSWORD}@cluster0-g3vvd.mongodb.net/${TEST_DB}?retryWrites=true&w=majority`,
  secret: "amitreejwtsecret",
  referral_base_url: REFERRAL_BASE_URL,
  port: PORT || 3001,
};
