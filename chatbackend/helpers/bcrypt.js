const bcrypt = require("bcryptjs");

const getHashedString = (plainString) => {
  return bcrypt.hashSync(plainString, bcrypt.genSaltSync(9));
};

const isStringRelevant = (plainString, hashedString) => {
  return bcrypt.compareSync(plainString, hashedString);
};

module.exports = {getHashedString, isStringRelevant};
