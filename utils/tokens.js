const jwt = require("jsonwebtoken");

const createActivateToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATE_SECRET_KEY, {
    expiresIn: "5m",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_SECRET_KEY, {
    expiresIn: "120m",
  });
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_SECRET_KEY, { expiresIn: "3d" });
};

module.exports = {
  createActivateToken,
  createRefreshToken,
  createAccessToken,
};
