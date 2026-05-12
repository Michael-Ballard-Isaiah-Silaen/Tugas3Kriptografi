const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secrethahahaha";

const getToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET);
};

const getPayload = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {getToken, getPayload};
