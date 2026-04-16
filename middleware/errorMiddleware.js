export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError" && err.kind === "ObjectId") {
    message = "Resource not found / Invalid ID";
    statusCode = 404;
  }

  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    statusCode = 400;
  }

  if (err.code === 11000) {
    message = `Duplicate field value entered: ${Object.keys(err.keyValue).join(", ")}`;
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
