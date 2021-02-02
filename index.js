/* -------------------------------------------------------------------------- */
/*                              external imports                              */
/* -------------------------------------------------------------------------- */
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

/* ---------------------------- internal imports ---------------------------- */
const mongoConnection = require("./src/config/connection");
const logger = require("./src/lib/logger");
const { cors } = require("./src/middleware/utils");
const { globalErrorHandler } = require("./src/utils/error");

const userRoute = require("./src/routes/user");
const routeNotFound = require("./src/controller/routeNotFound");

const app = express();

app.use(morgan("tiny"));

// cors
app.use(cors);

app.use(bodyParser.json());

// Routes
app.use("/api/v1", userRoute);

app.use("*", routeNotFound);

// Global error handler
app.use(globalErrorHandler);

// Mongoose, app connection
mongoConnection.connectToDb(app);
