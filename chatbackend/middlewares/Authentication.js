const { ObjectId } = require("mongodb");
const { getPayload } = require("../helpers/jwt");
const User = require("../models/User");
const { JsonWebTokenError } = require("jsonwebtoken");
const { CustomError } = require("./ErrorHandler");

const Authentication = async (req, res, next) => {
  try{
    const accessToken = req.headers.access_token;
    if (!accessToken) throw new CustomError(403, "Please re-login");
    const payload = getPayload(accessToken);
    if (!payload) throw new CustomError(403, "Please re-login");
    const { id, email } = payload;
    if (!id || !email) throw new CustomError(403, "Please re-login");
    const existingUser = await User.findOne({ _id: new ObjectId(id), email });
    if (!existingUser){
      throw new CustomError(403, "Please re-login");
    }
    req.user = { 
      id: existingUser._id.toString(), 
      ...existingUser 
    };
    next();
  }catch (error){
    if (error instanceof JsonWebTokenError){
      error = new CustomError(403, "Please re-login");
    }
    next(error);
  }
};

module.exports = Authentication;