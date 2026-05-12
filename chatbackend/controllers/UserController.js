const User = require("../models/User");
const { ObjectId } = require("mongodb");

class UserController {
  static async getAllUsers(req, res, next){
    try{
      const collection = await User.collection();
      const users = await collection.find({}, {
        projection: {password: 0, encryptedPrivateKey: 0, salt: 0}
      }).toArray();
      res.status(200).json(users);
    } catch (error){
      next(error);
    }
  }
  static async getUserPublicKey(req, res, next) {
    try{
      const {userId} = req.params;
      const user = await User.findOne({ _id: new ObjectId(userId) });
      if (!user || !user.publicKey){
        throw { name: "NotFound", message: "User or Public Key not found" };
      }
      res.status(200).json({ publicKey: user.publicKey });
    } catch (error){
      next(error);
    }
  }
}

module.exports = UserController;