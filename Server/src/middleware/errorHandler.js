export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.stack);

  if (err.name === "MongooseError" || err.name === "MongoError") {
    return res.status(503).json({
      message: "Database error, please try again later",
      error: err.message,
    });
  }

  res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
};
