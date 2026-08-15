const jwt = require("jsonwebtoken");

const env = require("../config/env");
const AppError = require("../utils/AppError");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new AppError(
        "Authentication token is required",
        401
      )
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      env.jwt.secret
    );

    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        new AppError(
          "Authentication token has expired",
          401
        )
      );
    }

    if (error.name === "JsonWebTokenError") {
      return next(
        new AppError(
          "Invalid authentication token",
          401
        )
      );
    }

    return next(error);
  }
};

module.exports = authMiddleware;