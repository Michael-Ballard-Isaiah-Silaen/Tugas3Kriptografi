const {getPayload} = require("../helpers/jwt");
const User = require("../models/User");
const {ObjectId} = require("mongodb");

async function Authentication(req, res, next) {
  try{
    const {authorization} = req.headers;
    if (!authorization) throw {name: "Unauthorized", message: "Go login"};
    const access_token = authorization.split(" ")[1];
    let payload;
    try{
      payload = getPayload(access_token); 
    } catch (err){
      throw {name: "Unauthorized", message: err.message || "Invalid Token"};
    }
    const user = await User.findOne({_id: new ObjectId(payload.id)});
    if (!user) throw {name: "Unauthorized", message: "User doesn't exist"};
    req.user = {id: user._id, email: user.email, username: user.username};
    next();
  } catch (error){
    next(error);
  }
}

module.exports = Authentication;