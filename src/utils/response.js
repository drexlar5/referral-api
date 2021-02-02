exports.sendFailureResponse = (error, next) => {
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  next(error);
}

exports.sendSuccessResponse = (res, message, data = null) => {
  res.json({
    error: false,
    message: message,
    data,
  });
}