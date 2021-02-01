/* -------------------------------------------------------------------------- */
/*                              external imports                              */
/* -------------------------------------------------------------------------- */
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

/* ---------------------------- internal imports ---------------------------- */
const mongoConn = require("./src/config/connection");
const authRoute = require("./src/routes/user");
const logger = require("./src/lib/logger");
const { cors } = require("./src/middleware/utils");
const errorHandler = require("./src/utils/error");

const app = express();

app.use(morgan("tiny"));

// cors
app.use(cors);

app.use(bodyParser.json());

// Routes
app.use("/api/v1", authRoute);

app.use("*", (_req, res, _next) =>
  res.status(404).json({ error: true, message: "Route not found." })
);

// Global error handler
app.use(errorHandler);

// Mongoose, app connection
mongoConn.connectToDb(app);
