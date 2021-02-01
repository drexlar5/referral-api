require('dotenv').config();

module.exports = config = {
  mongoConnection: 'mongodb+srv://amitree:amitree@cluster0-g3vvd.mongodb.net/amitree-referral?retryWrites=true&w=majority',
  mongoTestConnection: 'mongodb+srv://amitree:amitree@cluster0-g3vvd.mongodb.net/amitree-referral-test?retryWrites=true&w=majority',
  secret: 'amitreejwtsecret',
  prod_url: process.env.PROD_URL,
  dev_url: process.env.DEV_URL,
  node_env: process.env.NODE_ENV,
  port: process.env.PORT || 3001
}