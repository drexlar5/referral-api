/* -------------------------------------------------------------------------- */
/*                              external imports                              */
/* -------------------------------------------------------------------------- */
const mongoose = require("mongoose");

/* ---------------------------- internal imports ---------------------------- */
const {mongoConnection, mongoTestConnection, port} = require("./config");
const logger = require("../lib/logger");

exports.connection = () => {
  return mongoose.connect(mongoConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
};

exports.testConnection = () => {
  return mongoose.connect(mongoTestConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
};

exports.disconnectTest = () => {
  return mongoose.disconnect();
};

exports.connectToDb = (app) =>
  this
    .connection()
    .then(() => {
      app.listen(port, () => logger.info(`server connected at port: ${port}`));
    })
    .catch((err) => logger.error("connection error", err));
