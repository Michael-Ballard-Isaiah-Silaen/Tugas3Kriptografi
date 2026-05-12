const User = require("../models/User");
const {isStringRelevant, getHashedString} = require("../helpers/bcrypt");
const {getToken} = require("../helpers/jwt");
const {ObjectId} = require("mongodb");

class AuthController{
  static async register(req, res, next){
    try{
      const {email, password, username, publicKey, encryptedPrivateKey, salt} = req.body;
      if (!email || !password || !username || !publicKey || !encryptedPrivateKey || !salt){
        throw {name: "BadRequest", message: "Email, password, username, publicKey, encryptedPrivateKey, and salt is required"};
      }
      const existingUser = await User.findOne({email});
      if (existingUser){
        throw {name: "BadRequest", message: "Email is already registered"};
      }
      const hashedPassword = getHashedString(password);
      const result = await User.create({
        email, 
        password: hashedPassword, 
        username,
        publicKey,
        encryptedPrivateKey,
        salt
      });
      res.status(201).json({ 
        message: "User registered successfully", 
        userId: result.insertedId 
      });
    } catch (error){
      next(error);
    }
  }
  static async login(req, res, next){
    try{
      const {email, password} = req.body;
      if (!email || !password){
        throw {name: "BadRequest", message: "Email and password is required"};
      }
      const user = await User.findOne({ email });
      if (!user) throw {name: "Unauthorized", message: "Invalid email or password"};
      const isPasswordValid = isStringRelevant(password, user.password); 
      if (!isPasswordValid) throw {name: "Unauthorized", message: "Invalid email or password"};
      const access_token = getToken({id: user._id, email: user.email, username: user.username});
      res.status(200).json({
        access_token,
        encryptedPrivateKey: user.encryptedPrivateKey,
        salt: user.salt
      });
    } catch (error){
      next(error);
    }
  }
  static async getUserInfo(req, res, next){
    try{
      const user = await User.findOne({_id: new ObjectId(req.user.id)});
      if (!user) throw {name: "NotFound", message: "User not found"};
      res.status(200).json({ 
        _id: user._id, 
        email: user.email, 
        username: user.username 
      });
    } catch(error){ 
      next(error); 
    }
  }
}

module.exports = AuthController;